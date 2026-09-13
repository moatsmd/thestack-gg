import type { SyncOp, SyncSeat, SyncSessionMeta } from '@/types/sync'

export const SYNC_RECOVERY_KEY = 'thestack:sync-recovery:v1'
const MAX_AGE_MS = 24 * 60 * 60 * 1000

export type PendingSyncOp = { opId: string; op: SyncOp; attempts: number }
export type SyncRecovery = {
  version: 1
  deviceId: string
  session: SyncSessionMeta
  seats: SyncSeat[]
  queue: PendingSyncOp[]
  savedAt: number
}
export type SavedSyncSession = Pick<SyncRecovery, 'session' | 'seats' | 'savedAt'> & { pendingCount: number }

const validOp = (op: SyncOp): boolean => {
  if (!op || typeof op !== 'object') return false
  if (op.type === 'reset') return true
  if (op.type === 'end_game') return op.winnerSeatId === undefined || Number.isFinite(op.winnerSeatId)
  if (!('seatId' in op) || !Number.isFinite(op.seatId)) return false
  if (op.type === 'rename') return typeof op.name === 'string'
  if (!('delta' in op) || !Number.isFinite(op.delta)) return false
  if (op.type === 'life') return true
  if (op.type === 'cmd_from') return Number.isFinite(op.sourceId)
  return op.type === 'counter' && ['energy', 'experience', 'poison', 'mana'].includes(op.counter)
}

export function readSyncRecovery(deviceId: string): SyncRecovery | null {
  try {
    const raw = window.localStorage.getItem(SYNC_RECOVERY_KEY)
    if (!raw) return null
    const value = JSON.parse(raw) as SyncRecovery
    if (value.version !== 1 || value.deviceId !== deviceId || typeof value.session?.id !== 'string' ||
      typeof value.session.code !== 'string' || value.session.endedAt || !Array.isArray(value.seats) ||
      !Array.isArray(value.queue) || !Number.isFinite(value.savedAt) ||
      Date.now() - value.savedAt > MAX_AGE_MS ||
      value.queue.some((item) => !item || typeof item.opId !== 'string' ||
        !Number.isFinite(item.attempts) || item.attempts < 0 || !validOp(item.op))) {
      window.localStorage.removeItem(SYNC_RECOVERY_KEY)
      return null
    }
    return value
  } catch {
    return null
  }
}

export function writeSyncRecovery(value: SyncRecovery | null): boolean {
  try {
    if (value) window.localStorage.setItem(SYNC_RECOVERY_KEY, JSON.stringify(value))
    else window.localStorage.removeItem(SYNC_RECOVERY_KEY)
    return true
  } catch {
    return false
  }
}

export function summarizeRecovery(value: SyncRecovery | null): SavedSyncSession | null {
  return value ? {
    session: value.session, seats: value.seats, savedAt: value.savedAt, pendingCount: value.queue.length,
  } : null
}

/** New random IDs survive reloads and concurrent tabs without counter reuse. */
export function newSyncOpId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
}
