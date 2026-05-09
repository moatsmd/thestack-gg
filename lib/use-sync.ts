'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getDeviceId } from '@/lib/device-id'
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
 * useSync — write-path hook for Pod Sync (PR #20 of 4).
 *
 * Responsibilities in this PR:
 *   - Resolve a stable deviceId.
 *   - Create a session on demand from the active tracker state.
 *   - Hold session meta / seats / snapshot in state.
 *   - Accept emit() calls for each tracker write and POST them through a
 *     serial queue with exponential backoff and idempotent opIds.
 *
 * Future PRs add:
 *   - PR #21: polling reads via GET /since?seq=N + apply-remote-ops.
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
  /** Create a new sync session from the current tracker state. */
  createSession: (input: CreateInput) => Promise<CreateResponse | null>
  /** Emit an op. No-op when no session is active. */
  emit: (op: SyncOp) => void
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

  useEffect(() => {
    sessionIdRef.current = session?.id ?? null
  }, [session?.id])

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
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
        setStatus('active')
        return data
      } catch {
        setStatus('idle')
        return null
      }
    },
    [deviceId],
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
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
  }, [])

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
    createSession,
    emit,
    teardown,
  }
}
