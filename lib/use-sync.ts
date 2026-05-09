'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getDeviceId } from '@/lib/device-id'
import { applySyncOp, cloneSnapshot } from '@/lib/sync-apply'
import type {
  SyncCounter,
  SyncGameMode,
  SyncOp,
  SyncOpEnvelope,
  SyncPlayer,
  SyncSeat,
  SyncSessionMeta,
  SyncSnapshot,
} from '@/types/sync'

/**
 * useSync — read + write hook for Pod Sync (PRs #20–#21 of 4).
 *
 * Write path (PR #20): each tracker mutation is emitted as an op, queued
 * serially, and POSTed with an idempotent opId.
 *
 * Read path (PR #21): when a session is active, a 1.5s poller fetches
 * /since?seq=N and applies any new ops to a local copy of the snapshot.
 * Polling pauses when the document is hidden and resumes on visibility.
 * The hook exposes a `remoteOps` callback that fires for ops authored by
 * other devices; the tracker uses this to reconcile its local Player[]
 * state. Ops authored by this device are filtered out of the callback to
 * avoid double-applying our own writes.
 *
 * Future PRs add:
 *   - PR #22: QR modal + join flow + seat picker.
 *
 * The hook is intentionally permissive: when no session is active, emit()
 * is a no-op so wiring it into the tracker has zero behaviour change in
 * single-device mode.
 */

export type SyncStatus = 'idle' | 'creating' | 'active' | 'offline' | 'ended'

export type CreateInput = {
  players: SyncPlayer[]
  gameMode: SyncGameMode
  customLife: number
  enabledCounters: SyncCounter[]
}

type QueueItem = {
  opId: string
  op: SyncOp
  attempts: number
}

type CreateResponse = {
  id: string
  code: string
  joinUrl: string
  session: SyncSessionMeta
  snapshot: SyncSnapshot
  seats: SyncSeat[]
  expiresInMs: number
}

const BACKOFF_MS = [500, 1_000, 2_000, 4_000, 8_000, 16_000, 30_000]
const backoffFor = (attempts: number) =>
  BACKOFF_MS[Math.min(attempts, BACKOFF_MS.length - 1)]

/** Callback invoked for each remote op (excludes ops authored by this device). */
export type RemoteOpHandler = (envelope: SyncOpEnvelope) => void

export type UseSyncResult = {
  status: SyncStatus
  deviceId: string | null
  session: SyncSessionMeta | null
  seats: SyncSeat[]
  snapshot: SyncSnapshot | null
  joinUrl: string | null
  /** True iff we are the host device. */
  isHost: boolean
  /** Pending ops not yet acknowledged by server. */
  pendingCount: number
  /** Latest seq the client has applied. */
  appliedSeq: number
  /** Create a new sync session from the current tracker state. */
  createSession: (input: CreateInput) => Promise<CreateResponse | null>
  /** Emit an op. No-op when no session is active. */
  emit: (op: SyncOp) => void
  /**
   * Subscribe to remote ops. The handler is called once per envelope authored
   * by another device, in seq order, after the snapshot has been mutated.
   * Returns an unsubscribe function. Safe to call repeatedly — only the
   * latest registered handler fires.
   */
  subscribeRemoteOps: (handler: RemoteOpHandler | null) => () => void
  /** Tear down — used on Exit/End. Does not delete server state. */
  teardown: () => void
}

export function useSync(): UseSyncResult {
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [session, setSession] = useState<SyncSessionMeta | null>(null)
  const [seats, setSeats] = useState<SyncSeat[]>([])
  const [snapshot, setSnapshot] = useState<SyncSnapshot | null>(null)
  const [joinUrl, setJoinUrl] = useState<string | null>(null)
  const [pendingCount, setPendingCount] = useState(0)

  // Resolve deviceId on mount (SSR-safe).
  useEffect(() => {
    const id = getDeviceId()
    if (id) setDeviceId(id)
  }, [])

  // Refs survive re-renders; queue/draining state lives outside React state
  // to avoid render-loop churn on every op.
  const queueRef = useRef<QueueItem[]>([])
  const drainingRef = useRef(false)
  const opCounterRef = useRef(0)
  const sessionIdRef = useRef<string | null>(null)
  const statusRef = useRef<SyncStatus>('idle')
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Read-path refs (PR #21).
  const appliedSeqRef = useRef(0)
  const [appliedSeq, setAppliedSeq] = useState(0)
  const remoteHandlerRef = useRef<RemoteOpHandler | null>(null)
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollingRef = useRef(false)
  const deviceIdRef = useRef<string | null>(null)

  useEffect(() => {
    sessionIdRef.current = session?.id ?? null
  }, [session?.id])

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    deviceIdRef.current = deviceId
  }, [deviceId])

  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current)
    }
  }, [])

  const drain = useCallback(async () => {
    if (drainingRef.current) return
    if (!sessionIdRef.current) return
    if (!deviceId) return
    drainingRef.current = true
    try {
      while (queueRef.current.length > 0) {
        const head = queueRef.current[0]
        try {
          const res = await fetch(`/api/sync/${sessionIdRef.current}/op`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deviceId,
              opId: head.opId,
              op: head.op,
            }),
          })
          if (res.status === 409) {
            // game_ended — stop queue, mark ended, drop pending writes.
            queueRef.current = []
            setPendingCount(0)
            setStatus('ended')
            return
          }
          if (res.status === 403 || res.status === 400) {
            // Authority/validation rejection. Drop this op (we can't fix
            // it by retrying) and continue.
            queueRef.current.shift()
            setPendingCount(queueRef.current.length)
            continue
          }
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`)
          }
          // Success — drop the op, keep status active.
          queueRef.current.shift()
          setPendingCount(queueRef.current.length)
          if (statusRef.current === 'offline') setStatus('active')
        } catch {
          // Network error or 5xx — schedule a retry.
          head.attempts += 1
          setStatus('offline')
          drainingRef.current = false
          if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
          retryTimerRef.current = setTimeout(() => {
            void drain()
          }, backoffFor(head.attempts))
          return
        }
      }
    } finally {
      drainingRef.current = false
    }
  }, [deviceId])

  const emit = useCallback(
    (op: SyncOp) => {
      if (!sessionIdRef.current) return
      if (!deviceId) return
      const opId = `${deviceId}:${opCounterRef.current++}`
      queueRef.current.push({ opId, op, attempts: 0 })
      setPendingCount(queueRef.current.length)
      void drain()
    },
    [deviceId, drain],
  )

  const createSession = useCallback(
    async (input: CreateInput): Promise<CreateResponse | null> => {
      if (!deviceId) return null
      if (sessionIdRef.current) {
        // Already active — don't double-create. Return current state.
        return null
      }
      setStatus('creating')
      try {
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hostDeviceId: deviceId,
            players: input.players,
            gameMode: input.gameMode,
            customLife: input.customLife,
            enabledCounters: input.enabledCounters,
          }),
        })
        if (!res.ok) {
          setStatus('idle')
          return null
        }
        const data: CreateResponse = await res.json()
        setSession(data.session)
        setSeats(data.seats)
        setSnapshot(data.snapshot)
        setJoinUrl(data.joinUrl)
        sessionIdRef.current = data.id
        appliedSeqRef.current = data.snapshot.seq
        setAppliedSeq(data.snapshot.seq)
        setStatus('active')
        startPolling()
        return data
      } catch {
        setStatus('idle')
        return null
      }
    },
    [deviceId, /* startPolling captured via closure; see read-path block below */],
  )

  // ── Read path: poll /since?seq=N at 1.5s and apply remote ops ──────
  const POLL_INTERVAL_MS = 1_500

  const pollOnce = useCallback(async () => {
    const id = sessionIdRef.current
    if (!id) return
    if (statusRef.current === 'ended') return
    // Skip polling while a tab is hidden — saves battery and avoids the
    // backlog effect when laptops sleep.
    if (typeof document !== 'undefined' && document.hidden) return

    try {
      const res = await fetch(`/api/sync/${id}/since?seq=${appliedSeqRef.current}`)
      if (!res.ok) {
        if (res.status === 404) {
          // Session expired or was never there — give up cleanly.
          setStatus('ended')
          return
        }
        // 5xx — keep status, just wait for next tick.
        if (statusRef.current === 'active') setStatus('offline')
        return
      }
      const data = (await res.json()) as {
        ops: SyncOpEnvelope[]
        seq: number
      }
      // Recover from offline if a successful read came through.
      if (statusRef.current === 'offline') setStatus('active')
      if (!data.ops || data.ops.length === 0) {
        // Even with no new ops, mirror the head seq so a later POST
        // doesn't ask for a stale floor.
        appliedSeqRef.current = Math.max(appliedSeqRef.current, data.seq)
        setAppliedSeq(appliedSeqRef.current)
        return
      }
      // Apply ops in seq order. We compute the new seq + side effects
      // synchronously here (not inside a functional setSnapshot callback)
      // so the ref is correctly advanced before any subsequent reads.
      const newOps = data.ops.filter((env) => env.seq > appliedSeqRef.current)
      for (const env of newOps) {
        appliedSeqRef.current = env.seq
        if (
          env.deviceId !== deviceIdRef.current &&
          remoteHandlerRef.current
        ) {
          remoteHandlerRef.current(env)
        }
        if (env.op.type === 'end_game') {
          setStatus('ended')
        }
      }
      // Then mutate snapshot (which may be null if we haven't seeded yet).
      setSnapshot((prev) => {
        if (!prev) return prev
        let next = cloneSnapshot(prev)
        for (const env of newOps) {
          next = applySyncOp(next, env.op, undefined)
        }
        next.seq = appliedSeqRef.current
        return next
      })
      // Mirror seats too — rename ops update seat name through a separate
      // path; we sync from snapshot.players to keep them consistent.
      setSeats((prevSeats) => {
        if (prevSeats.length === 0) return prevSeats
        let changed = false
        const out = prevSeats.map((s) => {
          // Find the matching player on the latest applied snapshot. Reading
          // the closed-over snapshot would be stale, so we look up by seatId.
          const renames = data.ops.filter(
            (o) => o.op.type === 'rename' && o.op.seatId === s.seatId,
          )
          if (renames.length === 0) return s
          const latest = renames[renames.length - 1]
          if (latest.op.type !== 'rename') return s
          const trimmed = latest.op.name.trim().slice(0, 32)
          if (!trimmed || trimmed === s.name) return s
          changed = true
          return { ...s, name: trimmed }
        })
        return changed ? out : prevSeats
      })
      setAppliedSeq(appliedSeqRef.current)
    } catch {
      if (statusRef.current === 'active') setStatus('offline')
    }
  }, [])

  const startPolling = useCallback(() => {
    if (pollingRef.current) return
    pollingRef.current = true
    const tick = () => {
      if (!pollingRef.current) return
      void pollOnce().finally(() => {
        if (!pollingRef.current) return
        pollTimerRef.current = setTimeout(tick, POLL_INTERVAL_MS)
      })
    }
    tick()
  }, [pollOnce])

  const stopPolling = useCallback(() => {
    pollingRef.current = false
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }, [])

  // Visibility-aware: pause when tab hides, resume on visible.
  useEffect(() => {
    if (typeof document === 'undefined') return
    const onVis = () => {
      if (document.hidden) return
      if (sessionIdRef.current && statusRef.current !== 'ended') {
        // Force one immediate fetch to catch up after a hide period.
        void pollOnce()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [pollOnce])

  const subscribeRemoteOps = useCallback(
    (handler: RemoteOpHandler | null) => {
      remoteHandlerRef.current = handler
      return () => {
        if (remoteHandlerRef.current === handler) {
          remoteHandlerRef.current = null
        }
      }
    },
    [],
  )

  const teardown = useCallback(() => {
    queueRef.current = []
    setPendingCount(0)
    setSession(null)
    setSeats([])
    setSnapshot(null)
    setJoinUrl(null)
    sessionIdRef.current = null
    setStatus('idle')
    appliedSeqRef.current = 0
    setAppliedSeq(0)
    stopPolling()
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
  }, [stopPolling])

  const isHost = useMemo(
    () => !!session && !!deviceId && session.hostDeviceId === deviceId,
    [session, deviceId],
  )

  return {
    status,
    deviceId,
    session,
    seats,
    snapshot,
    joinUrl,
    isHost,
    pendingCount,
    appliedSeq,
    createSession,
    emit,
    subscribeRemoteOps,
    teardown,
  }
}
