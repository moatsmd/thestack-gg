'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getDeviceId } from '@/lib/device-id'
import { applySyncOp, cloneSnapshot } from '@/lib/sync-apply'
import {
  newSyncOpId, readSyncRecovery, summarizeRecovery, writeSyncRecovery,
  type PendingSyncOp, type SavedSyncSession, type SyncRecovery,
} from '@/lib/sync-recovery'
import type {
  SyncCounter, SyncGameMode, SyncOp, SyncOpEnvelope, SyncPlayer, SyncSeat,
  SyncSessionMeta, SyncSnapshot,
} from '@/types/sync'

export type SyncStatus = 'idle' | 'creating' | 'active' | 'offline' | 'ended'
export type CreateInput = {
  players: SyncPlayer[]
  gameMode: SyncGameMode
  customLife: number
  enabledCounters: SyncCounter[]
}
type JoinResponse = {
  id: string
  session: SyncSessionMeta
  snapshot: SyncSnapshot
  seats: SyncSeat[]
}
type CreateResponse = JoinResponse & { code: string; joinUrl: string; expiresInMs: number }
export type RemoteOpHandler = (envelope: SyncOpEnvelope) => void
export type UseSyncResult = {
  status: SyncStatus
  deviceId: string | null
  session: SyncSessionMeta | null
  seats: SyncSeat[]
  /** Server state plus this device's pending changes. Safe to render directly. */
  snapshot: SyncSnapshot | null
  joinUrl: string | null
  isHost: boolean
  pendingCount: number
  appliedSeq: number
  savedSession: SavedSyncSession | null
  error: string | null
  lastSyncedAt: number | null
  createSession: (input: CreateInput) => Promise<CreateResponse | null>
  joinSession: (code: string) => Promise<JoinResponse | null>
  /** Restore the same session, seat, and pending operations after a reload. */
  resumeSession: () => Promise<JoinResponse | null>
  /** Immediately flush pending writes and fetch updates. Safe to call repeatedly. */
  reconnect: () => Promise<void>
  /** Wait for queued writes. False on network failure, rejection, or teardown. */
  flush: () => Promise<boolean>
  claimSeat: (seatId: number) => Promise<SyncSeat[] | null>
  releaseSeat: (seatId: number) => Promise<SyncSeat[] | null>
  emit: (op: SyncOp) => void
  subscribeRemoteOps: (handler: RemoteOpHandler | null) => () => void
  /** Explicit leave: forget recovery. Unmount alone keeps it. */
  teardown: () => void
}

const POLL_MS = 1_500
const REQUEST_TIMEOUT_MS = 12_000
const BACKOFF_MS = [500, 1_000, 2_000, 4_000, 8_000, 16_000, 30_000]
const STORAGE_ERROR = 'Browser storage is unavailable. Keep this page open to retain your seat and unsent changes.'
const inviteUrlFor = (code: string) => `${window.location.origin}/tracker?join=${encodeURIComponent(code)}`

export function useSync(): UseSyncResult {
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [session, setSession] = useState<SyncSessionMeta | null>(null)
  const [seats, setSeats] = useState<SyncSeat[]>([])
  const [snapshot, setSnapshot] = useState<SyncSnapshot | null>(null)
  const [joinUrl, setJoinUrl] = useState<string | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [appliedSeq, setAppliedSeq] = useState(0)
  const [savedSession, setSavedSession] = useState<SavedSyncSession | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)

  const mounted = useRef(true)
  const generation = useRef(0)
  const device = useRef<string | null>(null)
  const meta = useRef<SyncSessionMeta | null>(null)
  const seatState = useRef<SyncSeat[]>([])
  const seatRevision = useRef(0)
  const canonical = useRef<SyncSnapshot | null>(null)
  const cursor = useRef(0)
  const queue = useRef<PendingSyncOp[]>([])
  const recovery = useRef<SyncRecovery | null>(null)
  const currentStatus = useRef<SyncStatus>('idle')
  const visibleSession = useRef(false)
  const writeFailed = useRef(false)
  const batchRejected = useRef(false)
  const remoteHandler = useRef<RemoteOpHandler | null>(null)
  const controllers = useRef(new Set<AbortController>())
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const polling = useRef(false)
  const pollJob = useRef<Promise<void> | null>(null)
  const drainJob = useRef<Promise<void> | null>(null)

  const setSyncStatus = useCallback((next: SyncStatus) => {
    currentStatus.current = next
    setStatus(next)
  }, [])
  const isCurrent = useCallback((epoch: number) => mounted.current && generation.current === epoch, [])

  const cancelWork = useCallback(() => {
    generation.current += 1
    polling.current = false
    if (pollTimer.current) clearTimeout(pollTimer.current)
    if (retryTimer.current) clearTimeout(retryTimer.current)
    pollTimer.current = retryTimer.current = null
    controllers.current.forEach((controller) => controller.abort())
    controllers.current.clear()
    pollJob.current = drainJob.current = null
  }, [])

  const request = useCallback(async (url: string, init: RequestInit = {}) => {
    const controller = new AbortController()
    controllers.current.add(controller)
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      return await fetch(url, {
        ...init, cache: 'no-store', signal: controller.signal,
        headers: { ...init.headers, 'X-Sync-Device-Id': device.current ?? '' },
      })
    } finally {
      clearTimeout(timeout)
      controllers.current.delete(controller)
    }
  }, [])

  const persist = useCallback(() => {
    if (!meta.current || !device.current) return
    const value: SyncRecovery | null = currentStatus.current === 'ended' ? null : {
      version: 1, deviceId: device.current, session: meta.current,
      seats: seatState.current, queue: queue.current, savedAt: Date.now(),
    }
    recovery.current = value
    setSavedSession(summarizeRecovery(value))
    if (!writeSyncRecovery(value)) setError(STORAGE_ERROR)
  }, [])

  const publish = useCallback(() => {
    if (!visibleSession.current || !canonical.current) return
    const next = cloneSnapshot(canonical.current)
    for (const item of queue.current) applySyncOp(next, item.op)
    setSnapshot(next)
    setPendingCount(queue.current.length)
    setAppliedSeq(cursor.current)
    setSeats(seatState.current)
    persist()
  }, [persist])

  const endSession = useCallback((message?: string) => {
    if (queue.current.length || message) batchRejected.current = true
    queue.current = []
    writeFailed.current = false
    polling.current = false
    if (retryTimer.current) clearTimeout(retryTimer.current)
    if (pollTimer.current) clearTimeout(pollTimer.current)
    retryTimer.current = pollTimer.current = null
    setSyncStatus('ended')
    if (message) setError(message)
    publish()
    persist()
  }, [persist, publish, setSyncStatus])

  const drain = useCallback((): Promise<void> => {
    if (drainJob.current) return drainJob.current
    if (!meta.current || !device.current || currentStatus.current === 'ended') return Promise.resolve()
    const epoch = generation.current
    const id = meta.current.id
    const stillActive = () => isCurrent(epoch) && currentStatus.current !== 'ended'
    const job = (async () => {
      while (isCurrent(epoch) && queue.current.length && currentStatus.current !== 'ended') {
        const head = queue.current[0]
        try {
          const response = await request(`/api/sync/${id}/op`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId: device.current, opId: head.opId, op: head.op }),
          })
          if (!stillActive()) return
          if (response.status === 409 || response.status === 404) {
            endSession(response.status === 404 ? 'This table has expired.' : 'The host has ended this game.')
            return
          }
          if ([400, 403, 413, 422].includes(response.status)) {
            batchRejected.current = true
            queue.current = queue.current.filter((item) => item.opId !== head.opId)
            setError(response.status === 403
              ? 'That change was not saved: this device no longer controls that seat.'
              : 'That change was not saved. The table has been restored to its latest state.')
            writeFailed.current = false
            publish()
            persist()
            continue
          }
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          const data = await response.json() as { snapshot?: SyncSnapshot; envelope?: SyncOpEnvelope }
          if (!stillActive()) return
          const stillPending = queue.current.some((item) => item.opId === head.opId)
          queue.current = queue.current.filter((item) => item.opId !== head.opId)
          if (data.snapshot && (!canonical.current || data.snapshot.seq >= canonical.current.seq)) {
            canonical.current = cloneSnapshot(data.snapshot)
          } else if (!data.snapshot && stillPending && canonical.current) {
            // Compatibility with older servers; current servers send a snapshot.
            applySyncOp(canonical.current, head.op)
            canonical.current.seq = Math.max(canonical.current.seq, data.envelope?.seq ?? canonical.current.seq)
          }
          writeFailed.current = false
          setLastSyncedAt(Date.now())
          if (currentStatus.current !== 'creating') setSyncStatus('active')
          setError((previous) => previous?.startsWith('Connection') ? null : previous)
          publish()
          persist()
          if (canonical.current?.endedAt) { endSession(); return }
        } catch {
          if (!stillActive()) return
          head.attempts += 1
          writeFailed.current = true
          if (currentStatus.current !== 'creating') setSyncStatus('offline')
          setError('Connection lost. Your changes are queued and will retry automatically.')
          persist()
          if (retryTimer.current) clearTimeout(retryTimer.current)
          retryTimer.current = setTimeout(() => {
            retryTimer.current = null
            void drain()
          }, BACKOFF_MS[Math.min(head.attempts - 1, BACKOFF_MS.length - 1)])
          return
        }
      }
      if (queue.current.length === 0) writeFailed.current = false
    })()
    drainJob.current = job
    void job.finally(() => { if (drainJob.current === job) drainJob.current = null })
    return job
  }, [endSession, isCurrent, persist, publish, request, setSyncStatus])

  const pollOnce = useCallback((): Promise<void> => {
    if (pollJob.current) return pollJob.current
    if (!meta.current || currentStatus.current === 'ended' || document.hidden) return Promise.resolve()
    const id = meta.current.id
    const epoch = generation.current
    const seatsAtRequest = seatRevision.current
    const job = (async () => {
      try {
        const response = await request(`/api/sync/${id}/since?seq=${cursor.current}`)
        if (!isCurrent(epoch)) return
        if (response.status === 404) { endSession('This table has expired.'); return }
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json() as {
          ops: SyncOpEnvelope[]; seq: number; seats?: SyncSeat[]; snapshot?: SyncSnapshot
        }
        if (!isCurrent(epoch) || currentStatus.current === 'ended') return
        const newOps = (data.ops ?? []).filter((env) => env.seq > cursor.current).sort((a, b) => a.seq - b.seq)
        if (data.snapshot && (!canonical.current || data.snapshot.seq >= canonical.current.seq)) {
          canonical.current = cloneSnapshot(data.snapshot)
        }
        for (const envelope of newOps) {
          queue.current = queue.current.filter((item) => item.opId !== envelope.opId)
          if (canonical.current && envelope.seq > canonical.current.seq) {
            applySyncOp(canonical.current, envelope.op, seatState.current)
            canonical.current.seq = envelope.seq
          }
          if (envelope.deviceId !== device.current) remoteHandler.current?.(envelope)
        }
        cursor.current = Math.max(cursor.current, data.seq)
        if (data.seats && seatRevision.current === seatsAtRequest) seatState.current = data.seats
        else seatState.current = seatState.current.map((seat) => ({
          ...seat, name: canonical.current?.players.find((player) => player.id === seat.seatId)?.name ?? seat.name,
        }))
        if (!queue.current.length) writeFailed.current = false
        setLastSyncedAt(Date.now())
        if (!writeFailed.current) {
          setSyncStatus('active')
          setError((previous) => previous?.startsWith('Connection') ? null : previous)
        }
        if (canonical.current?.endedAt || newOps.some((env) => env.op.type === 'end_game')) endSession()
        else publish()
      } catch {
        if (!isCurrent(epoch)) return
        setSyncStatus('offline')
        setError('Connection lost. Reconnecting to your table automatically.')
      }
    })()
    pollJob.current = job
    void job.finally(() => { if (pollJob.current === job) pollJob.current = null })
    return job
  }, [endSession, isCurrent, publish, request, setSyncStatus])

  const startPolling = useCallback(() => {
    if (polling.current) return
    polling.current = true
    const epoch = generation.current
    const tick = async () => {
      if (!isCurrent(epoch) || !polling.current) return
      await pollOnce()
      if (isCurrent(epoch) && polling.current) pollTimer.current = setTimeout(() => { void tick() }, POLL_MS)
    }
    void tick()
  }, [isCurrent, pollOnce])

  const reconnect = useCallback(async () => {
    if (!meta.current || currentStatus.current === 'ended' || currentStatus.current === 'creating') return
    if (retryTimer.current) clearTimeout(retryTimer.current)
    retryTimer.current = null
    await drain()
    await pollOnce()
  }, [drain, pollOnce])

  const flush = useCallback(async () => {
    const epoch = generation.current
    if (retryTimer.current) clearTimeout(retryTimer.current)
    retryTimer.current = null
    await drain()
    return isCurrent(epoch) && queue.current.length === 0 && !writeFailed.current && !batchRejected.current
  }, [drain, isCurrent])

  useEffect(() => {
    mounted.current = true
    const id = getDeviceId()
    device.current = id
    setDeviceId(id)
    recovery.current = id ? readSyncRecovery(id) : null
    setSavedSession(summarizeRecovery(recovery.current))
    return () => { mounted.current = false; cancelWork() }
  }, [cancelWork])

  useEffect(() => {
    const wake = () => { if (!document.hidden) void reconnect() }
    const offline = () => {
      if (meta.current && currentStatus.current !== 'ended' && currentStatus.current !== 'creating') {
        setSyncStatus('offline')
        setError('Connection lost. Your changes stay queued until you reconnect.')
      }
    }
    document.addEventListener('visibilitychange', wake)
    window.addEventListener('online', wake)
    window.addEventListener('focus', wake)
    window.addEventListener('pageshow', wake)
    window.addEventListener('offline', offline)
    return () => {
      document.removeEventListener('visibilitychange', wake)
      window.removeEventListener('online', wake)
      window.removeEventListener('focus', wake)
      window.removeEventListener('pageshow', wake)
      window.removeEventListener('offline', offline)
    }
  }, [reconnect, setSyncStatus])

  const activate = useCallback((data: JoinResponse) => {
    meta.current = data.session
    seatState.current = data.seats
    canonical.current = cloneSnapshot(data.snapshot)
    cursor.current = data.snapshot.seq
    visibleSession.current = true
    setSession(data.session)
    setJoinUrl(inviteUrlFor(data.session.code))
    setLastSyncedAt(Date.now())
    setSyncStatus(data.snapshot.endedAt || data.session.endedAt ? 'ended' : 'active')
    publish()
    if (currentStatus.current === 'ended') endSession()
    else startPolling()
  }, [endSession, publish, setSyncStatus, startPolling])

  const createSession = useCallback(async (input: CreateInput): Promise<CreateResponse | null> => {
    if (!device.current || meta.current || currentStatus.current === 'creating') return null
    const epoch = generation.current
    setSyncStatus('creating')
    setError(null)
    try {
      const response = await request('/api/sync', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostDeviceId: device.current, ...input }),
      })
      if (!isCurrent(epoch)) return null
      if (!response.ok) throw new Error('create failed')
      const data = await response.json() as CreateResponse
      if (!isCurrent(epoch)) return null
      // The server may see a wildcard bind address or proxy origin. Invite
      // from the origin that this browser actually used to reach the table.
      data.joinUrl = inviteUrlFor(data.session.code)
      queue.current = []
      activate(data)
      return data
    } catch {
      if (isCurrent(epoch)) { setSyncStatus('idle'); setError('Could not open a shared table. Check your connection and try again.') }
      return null
    }
  }, [activate, isCurrent, request, setSyncStatus])

  const joinSession = useCallback(async (code: string): Promise<JoinResponse | null> => {
    if (!device.current || meta.current || currentStatus.current === 'creating') return null
    const normalized = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    if (!normalized) return null
    const epoch = generation.current
    setSyncStatus('creating')
    setError(null)
    const saved = recovery.current?.session.code.replace(/[^A-Za-z0-9]/g, '').toUpperCase() === normalized
      ? recovery.current : null
    try {
      const response = await request(`/api/sync/by-code/${normalized}`)
      if (!isCurrent(epoch)) return null
      if (!response.ok) {
        if (response.status === 404 && saved) {
          recovery.current = null
          setSavedSession(null)
          writeSyncRecovery(null)
        }
        setSyncStatus('idle')
        setError(response.status === 404 ? 'That table was not found or has expired.' : 'Could not reach that table. Try again when connected.')
        return null
      }
      let data = await response.json() as JoinResponse
      if (!isCurrent(epoch)) return null
      queue.current = saved?.session.id === data.id ? saved.queue.map((item) => ({ ...item })) : []
      // Flush saved operations with their original IDs before exposing the
      // server snapshot: a lost acknowledgement must not double a life change.
      meta.current = data.session
      seatState.current = data.seats
      canonical.current = cloneSnapshot(data.snapshot)
      if (queue.current.length && !data.snapshot.endedAt && !data.session.endedAt) {
        await drain()
        if (!isCurrent(epoch)) return null
        if (queue.current.length) {
          cancelWork()
          meta.current = null
          canonical.current = null
          setSyncStatus('idle')
          return null
        }
        data = { ...data, snapshot: cloneSnapshot(canonical.current!) }
      }
      activate(data)
      return data
    } catch {
      if (isCurrent(epoch)) {
        meta.current = null
        canonical.current = null
        setSyncStatus('idle')
        setError('Could not reconnect to your table. Your saved seat and pending changes are still here.')
      }
      return null
    }
  }, [activate, cancelWork, drain, isCurrent, request, setSyncStatus])

  const resumeSession = useCallback(() => recovery.current
    ? joinSession(recovery.current.session.code) : Promise.resolve(null), [joinSession])

  const emit = useCallback((op: SyncOp) => {
    if (!meta.current || !device.current || !visibleSession.current || currentStatus.current === 'ended') return
    // Retrying the finish button must retry the original receipt, not append
    // a second end operation that the first acknowledgement will invalidate.
    if (op.type === 'end_game' && queue.current.some(item => item.op.type === 'end_game')) {
      void drain()
      return
    }
    if (!queue.current.length) batchRejected.current = false
    queue.current.push({ opId: newSyncOpId(), op, attempts: 0 })
    publish() // Persist before network I/O, including before the browser can sleep.
    void drain()
  }, [drain, publish])

  const changeSeat = useCallback(async (seatId: number, method: 'POST' | 'DELETE'): Promise<SyncSeat[] | null> => {
    if (!meta.current || !device.current || currentStatus.current === 'ended') return null
    const epoch = generation.current
    try {
      const response = await request(`/api/sync/${meta.current.id}/seat`, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: device.current, seatId }),
      })
      if (!isCurrent(epoch)) return null
      if (!response.ok) { setError('Could not update that seat. It may already be claimed.'); return null }
      const data = await response.json() as { seats: SyncSeat[] }
      if (!isCurrent(epoch)) return null
      seatState.current = data.seats
      seatRevision.current += 1
      publish()
      return data.seats
    } catch {
      if (isCurrent(epoch)) setError('Could not update that seat. Check your connection and try again.')
      return null
    }
  }, [isCurrent, publish, request])
  const claimSeat = useCallback((seatId: number) => changeSeat(seatId, 'POST'), [changeSeat])
  const releaseSeat = useCallback((seatId: number) => changeSeat(seatId, 'DELETE'), [changeSeat])
  const subscribeRemoteOps = useCallback((handler: RemoteOpHandler | null) => {
    remoteHandler.current = handler
    return () => { if (remoteHandler.current === handler) remoteHandler.current = null }
  }, [])

  const teardown = useCallback(() => {
    cancelWork()
    meta.current = null
    canonical.current = null
    seatState.current = []
    queue.current = []
    recovery.current = null
    visibleSession.current = false
    writeFailed.current = false
    batchRejected.current = false
    cursor.current = 0
    writeSyncRecovery(null)
    setSession(null)
    setSeats([])
    setSnapshot(null)
    setJoinUrl(null)
    setPendingCount(0)
    setAppliedSeq(0)
    setSavedSession(null)
    setError(null)
    setLastSyncedAt(null)
    setSyncStatus('idle')
  }, [cancelWork, setSyncStatus])

  return {
    status, deviceId, session, seats, snapshot, joinUrl,
    isHost: !!session && session.hostDeviceId === deviceId,
    pendingCount, appliedSeq, savedSession, error, lastSyncedAt,
    createSession, joinSession, resumeSession, reconnect, flush, claimSeat, releaseSeat,
    emit, subscribeRemoteOps, teardown,
  }
}
