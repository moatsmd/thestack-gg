import { getRedis } from '@/lib/redis'
import { applySyncOp } from '@/lib/sync-apply'
import { isSyncId, parseSyncOp } from '@/lib/sync-validation'
import { checkNames } from '@/lib/name-moderation'
import { createHash } from 'node:crypto'
import type {
  SyncCounter,
  SyncGameMode,
  SyncJoinResponse,
  SyncOp,
  SyncOpEnvelope,
  SyncPlayer,
  SyncPollResponse,
  SyncSeat,
  SyncSessionMeta,
  SyncSnapshot,
} from '@/types/sync'

/**
 * Sync store — Redis-backed pod-sync sessions with in-memory fallback.
 *
 * Layout in Redis (TTL 24h on every key):
 *   sync:meta:<id>      → JSON SyncSessionMeta
 *   sync:snap:<id>      → JSON SyncSnapshot (coalesced, current state)
 *   sync:seats:<id>     → JSON SyncSeat[]
 *   sync:ops:<id>       → JSON SyncOpEnvelope[] (capped at MAX_OPS)
 *   sync:code:<code>    → string id (reverse lookup for join-by-code)
 *   sync:receipt:<id>:<hash> → accepted envelope, retained for the session TTL
 *
 * Concurrency: MGET reads a consistent version, then a Lua compare-and-swap
 * commits all state keys together. A conflicting writer retries against the
 * latest version. No connection-scoped WATCH state is shared across requests.
 */

const SYNC_TTL_MS = 24 * 60 * 60 * 1000
const SYNC_TTL_SEC = Math.floor(SYNC_TTL_MS / 1000)
const MAX_OPS = 5_000

// ─── In-memory fallback stores (dev / tests) ──────────────────────────
type MemSession = {
  meta: SyncSessionMeta
  snapshot: SyncSnapshot
  seats: SyncSeat[]
  ops: SyncOpEnvelope[]
  receipts: Map<string, SyncOpEnvelope>
}
type SyncMemory = {
  sessions: Map<string, MemSession>
  codeIndex: Map<string, string>
  createdAt: Map<string, number>
}
// Next's development route bundles and HMR reload modules independently.
// Keep their fallback in one process-wide registry; this is local development
// storage only, never a substitute for a shared database on serverless hosts.
const syncGlobal = globalThis as typeof globalThis & { __theStackSyncMemory?: SyncMemory }
const memory = syncGlobal.__theStackSyncMemory ??= {
  sessions: new Map(), codeIndex: new Map(), createdAt: new Map(),
}
const memSessions = memory.sessions
const memCodeIndex = memory.codeIndex
const memCreatedAt = memory.createdAt

const cleanupExpired = () => {
  const now = Date.now()
  memCreatedAt.forEach((createdAt, id) => {
    if (createdAt + SYNC_TTL_MS <= now) {
      const sess = memSessions.get(id)
      if (sess) memCodeIndex.delete(sess.meta.code)
      memSessions.delete(id)
      memCreatedAt.delete(id)
    }
  })
}

// ─── ID + code generators ─────────────────────────────────────────────
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // no I, L, O, 0, 1
const randChar = () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  }
  return Math.random().toString(16).slice(2, 14)
}
const createCode = (): string => {
  // 6 chars, formatted as XXX-XXX for readability when displayed.
  let out = ''
  for (let i = 0; i < 6; i++) out += randChar()
  return out
}

// ─── Key helpers ──────────────────────────────────────────────────────
const metaKey = (id: string) => `sync:meta:${id}`
const snapKey = (id: string) => `sync:snap:${id}`
const seatsKey = (id: string) => `sync:seats:${id}`
const opsKey = (id: string) => `sync:ops:${id}`
const codeKey = (code: string) => `sync:code:${code}`
const sessionKeys = (id: string) => [metaKey(id), snapKey(id), seatsKey(id), opsKey(id)]

const COMMIT_SESSION = `
for i = 1, 4 do
  if redis.call('GET', KEYS[i]) ~= ARGV[i] then return 0 end
end
for i = 1, 4 do
  redis.call('SET', KEYS[i], ARGV[4 + i], 'KEEPTTL')
end
if KEYS[5] then
  local ttl = redis.call('PTTL', KEYS[1])
  if ttl > 0 then redis.call('SET', KEYS[5], ARGV[9], 'PX', ttl) end
end
return 1
`

const decodeSession = (values: (string | null)[]): MemSession | null => {
  if (values.some((value) => value === null)) return null
  return {
    meta: JSON.parse(values[0]!),
    snapshot: JSON.parse(values[1]!),
    seats: JSON.parse(values[2]!),
    ops: JSON.parse(values[3]!),
    receipts: new Map(),
  }
}

type MutationFailure = { ok: false; error: string; status?: number }
const mutateSession = async <T extends { ok: boolean; envelope?: SyncOpEnvelope }>(
  id: string,
  mutate: (session: MemSession, receipt?: SyncOpEnvelope) => T,
  receiptId?: string,
): Promise<T | MutationFailure> => {
  const redis = await getRedis()
  if (!redis) {
    cleanupExpired()
    const session = memSessions.get(id)
    if (!session) return { ok: false, error: 'not_found', status: 404 }
    const result = mutate(session, receiptId ? session.receipts.get(receiptId) : undefined)
    if (receiptId && result.ok && result.envelope) session.receipts.set(receiptId, result.envelope)
    return result
  }
  const keys = [...sessionKeys(id), ...(receiptId ? [`sync:receipt:${id}:${receiptId}`] : [])]
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const before = await redis.mGet(keys)
    const session = decodeSession(before.slice(0, 4))
    if (!session) return { ok: false, error: 'not_found', status: 404 }
    const receipt = before[4] ? JSON.parse(before[4]) as SyncOpEnvelope : undefined
    const result = mutate(session, receipt)
    if (!result.ok) return result
    if (receipt) return result
    const after = [session.meta, session.snapshot, session.seats, session.ops].map((value) => JSON.stringify(value))
    const committed = await redis.eval(COMMIT_SESSION, {
      keys,
      arguments: [...before.slice(0, 4) as string[], ...after, ...(receiptId ? [JSON.stringify(result.envelope)] : [])],
    })
    if (committed === 1) return result
    // Concurrent phones otherwise race in lockstep and can exhaust the retry
    // budget while a faster writer keeps winning. Brief jitter yields fairly.
    await new Promise((resolve) => setTimeout(resolve,
      Math.min(50, 4 * (attempt + 1)) + Math.floor(Math.random() * 12),
    ))
  }
  // Safe to retry with the same opId; no speculative state was committed.
  return { ok: false, error: 'sync_busy', status: 503 }
}

// ─── Public types for create input ────────────────────────────────────
export type CreateSyncInput = {
  hostDeviceId: string
  players: SyncPlayer[]
  gameMode: SyncGameMode
  customLife: number
  enabledCounters: SyncCounter[]
}

// ─── Create ───────────────────────────────────────────────────────────
export const createSyncSession = async (
  input: CreateSyncInput,
): Promise<SyncJoinResponse> => {
  if (!input.hostDeviceId) throw new Error('hostDeviceId required')
  if (!Array.isArray(input.players) || input.players.length === 0) {
    throw new Error('players required')
  }
  const now = Date.now()
  const meta: SyncSessionMeta = {
    id: createId(),
    code: createCode(),
    hostDeviceId: input.hostDeviceId,
    createdAt: now,
    seq: 0,
  }
  const snapshot: SyncSnapshot = {
    seq: 0,
    players: input.players,
    gameMode: input.gameMode,
    customLife: input.customLife,
    enabledCounters: input.enabledCounters,
  }
  const seats: SyncSeat[] = input.players.map((p) => ({
    seatId: p.id,
    ownerDeviceId: null, // host owns all unclaimed seats by default
    name: p.name,
  }))

  const redis = await getRedis()
  if (!redis) {
    cleanupExpired()
    memSessions.set(meta.id, { meta, snapshot, seats, ops: [], receipts: new Map() })
    memCodeIndex.set(meta.code, meta.id)
    memCreatedAt.set(meta.id, now)
    return { session: meta, snapshot, seats }
  }

  await Promise.all([
    redis.set(metaKey(meta.id), JSON.stringify(meta), { EX: SYNC_TTL_SEC }),
    redis.set(snapKey(meta.id), JSON.stringify(snapshot), { EX: SYNC_TTL_SEC }),
    redis.set(seatsKey(meta.id), JSON.stringify(seats), { EX: SYNC_TTL_SEC }),
    redis.set(opsKey(meta.id), JSON.stringify([] as SyncOpEnvelope[]), {
      EX: SYNC_TTL_SEC,
    }),
    redis.set(codeKey(meta.code), meta.id, { EX: SYNC_TTL_SEC }),
  ])

  return { session: meta, snapshot, seats }
}

// ─── Read ─────────────────────────────────────────────────────────────
export const getSyncSession = async (
  id: string,
): Promise<SyncJoinResponse | null> => {
  const redis = await getRedis()
  if (!redis) {
    cleanupExpired()
    const sess = memSessions.get(id)
    if (!sess) return null
    return { session: sess.meta, snapshot: sess.snapshot, seats: sess.seats }
  }
  const session = decodeSession(await redis.mGet(sessionKeys(id)))
  return session ? { session: session.meta, snapshot: session.snapshot, seats: session.seats } : null
}

export const getIdByCode = async (code: string): Promise<string | null> => {
  const normalized = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  if (!normalized) return null
  const redis = await getRedis()
  if (!redis) {
    cleanupExpired()
    return memCodeIndex.get(normalized) ?? null
  }
  const id = await redis.get(codeKey(normalized))
  return id ?? null
}

// ─── Ops since seq (for polling) ─────────────────────────────────────
export const getOpsSince = async (
  id: string,
  sinceSeq: number,
): Promise<SyncPollResponse | null> => {
  const redis = await getRedis()
  if (!redis) {
    cleanupExpired()
    const sess = memSessions.get(id)
    if (!sess) return null
    return pollResponse(sess, sinceSeq)
  }
  const session = decodeSession(await redis.mGet(sessionKeys(id)))
  return session ? pollResponse(session, sinceSeq) : null
}

const pollResponse = (session: MemSession, sinceSeq: number): SyncPollResponse => {
  const firstAvailable = session.ops[0]?.seq ?? session.meta.seq + 1
  const needsSnapshot = sinceSeq < firstAvailable - 1 || sinceSeq > session.meta.seq
  return {
    seq: session.meta.seq,
    seats: session.seats,
    ops: needsSnapshot ? [] : session.ops.filter((op) => op.seq > sinceSeq),
    ...(needsSnapshot ? { snapshot: session.snapshot } : {}),
  }
}

// ─── Seat claiming ────────────────────────────────────────────────────
export const claimSeat = async (
  id: string,
  seatId: number,
  deviceId: string,
): Promise<{ ok: true; seats: SyncSeat[] } | { ok: false; error: string }> => {
  if (!deviceId) return { ok: false, error: 'deviceId required' }

  return mutateSession(id, (sess) => {
    if (sess.meta.endedAt) return { ok: false as const, error: 'game_ended' }
    return claimInPlace(sess.seats, seatId, deviceId)
      ? { ok: true as const, seats: sess.seats }
      : { ok: false as const, error: 'seat_taken' }
  })
}

const claimInPlace = (
  seats: SyncSeat[],
  seatId: number,
  deviceId: string,
): boolean => {
  // Allow re-claim of own seat, and release of any seat already owned by
  // this device when claiming a different one.
  const target = seats.find((s) => s.seatId === seatId)
  if (!target) return false
  if (target.ownerDeviceId && target.ownerDeviceId !== deviceId) return false
  for (const s of seats) {
    if (s.ownerDeviceId === deviceId) s.ownerDeviceId = null
  }
  target.ownerDeviceId = deviceId
  return true
}

// ─── Seat release (host-only escape hatch) ────────────────────────────
/**
 * Host-only operation that clears a seat's ownerDeviceId so it becomes
 * unclaimed again. Used when a returning player's phone has rotated its
 * device id (e.g. iOS Safari purged localStorage) and they can no longer
 * re-claim what was "theirs" before.
 *
 * - The requesting deviceId MUST equal meta.hostDeviceId.
 * - Host identity is independent of which seat the host has claimed.
 * - Releasing an already-empty seat is a no-op (returns ok with current
 *   seats) so the UI can call this safely.
 */
export const releaseSeat = async (
  id: string,
  seatId: number,
  requesterDeviceId: string,
): Promise<{ ok: true; seats: SyncSeat[] } | { ok: false; error: string }> => {
  if (!requesterDeviceId) return { ok: false, error: 'deviceId required' }

  return mutateSession(id, (sess) => {
    if (sess.meta.hostDeviceId !== requesterDeviceId) {
      return { ok: false as const, error: 'host_only' }
    }
    const target = sess.seats.find((s) => s.seatId === seatId)
    if (!target) return { ok: false as const, error: 'unknown_seat' }
    target.ownerDeviceId = null
    return { ok: true as const, seats: sess.seats }
  })
}

// ─── Apply op ─────────────────────────────────────────────────────────
export type AppendOpInput = {
  sessionId: string
  deviceId: string
  opId: string
  op: SyncOp
}

export type AppendOpResult =
  | { ok: true; envelope: SyncOpEnvelope; snapshot: SyncSnapshot }
  | { ok: false; error: string; status?: number }

export const appendOp = async (
  input: AppendOpInput,
): Promise<AppendOpResult> => {
  if (!isSyncId(input.deviceId)) return { ok: false, error: 'deviceId required', status: 400 }
  if (!isSyncId(input.opId)) return { ok: false, error: 'opId required', status: 400 }
  const op = parseSyncOp(input.op)
  if (!op) return { ok: false, error: 'Invalid op', status: 400 }
  input = { ...input, op }

  const receiptId = createHash('sha256').update(JSON.stringify([input.deviceId, input.opId])).digest('hex')
  return mutateSession(input.sessionId, (sess, receipt): AppendOpResult => receipt
    ? { ok: true, envelope: receipt, snapshot: sess.snapshot }
    : applyOpInPlace(sess.meta, sess.snapshot, sess.seats, sess.ops, input),
  receiptId)
}

const applyOpInPlace = (
  meta: SyncSessionMeta,
  snapshot: SyncSnapshot,
  seats: SyncSeat[],
  ops: SyncOpEnvelope[],
  input: AppendOpInput,
): AppendOpResult => {
  // Idempotency: if opId already applied, return prior envelope.
  const dup = ops.find((o) => o.opId === input.opId && o.deviceId === input.deviceId)
  if (dup) return { ok: true, envelope: dup, snapshot }

  // If the game has ended, only allow no-op reads (block all writes).
  if (meta.endedAt) {
    return { ok: false, error: 'game_ended', status: 409 }
  }

  // Authority check: only the owning device may mutate a seat.
  // Host owns any seat with ownerDeviceId === null and is also the only
  // one allowed to emit reset / end_game.
  const op = input.op
  if (op.type === 'cmd_from' && !snapshot.players.some((player) => player.id === op.sourceId)) {
    return { ok: false, error: 'unknown_source', status: 400 }
  }
  if (op.type === 'end_game' && op.winnerSeatId !== undefined && !snapshot.players.some((player) => player.id === op.winnerSeatId)) {
    return { ok: false, error: 'unknown_winner', status: 400 }
  }
  if (op.type === 'reset' || op.type === 'end_game') {
    if (input.deviceId !== meta.hostDeviceId) {
      return { ok: false, error: 'host_only', status: 403 }
    }
  } else {
    const seat = seats.find((s) => s.seatId === op.seatId)
    if (!seat) return { ok: false, error: 'unknown_seat', status: 400 }
    const allowed =
      seat.ownerDeviceId === input.deviceId ||
      (seat.ownerDeviceId === null && input.deviceId === meta.hostDeviceId)
    if (!allowed) return { ok: false, error: 'not_seat_owner', status: 403 }
  }

  // Validate seat references for ops that target a specific seat. The
  // shared applySyncOp helper no-ops on unknown seats, but the server
  // contract returns 400 so the client knows the op was bad.
  if (
    op.type === 'life' ||
    op.type === 'counter' ||
    op.type === 'cmd_from' ||
    op.type === 'rename'
  ) {
    if (!snapshot.players.find((x) => x.id === op.seatId)) {
      return { ok: false, error: 'unknown_seat', status: 400 }
    }
  }

  // Apply mutation via the shared client/server helper.
  if (op.type === 'rename') {
    const moderation = checkNames([{ label: 'Player name', value: op.name }])
    if (!moderation.ok) return { ok: false, error: moderation.error, status: 422 }
  }
  applySyncOp(snapshot, op, seats)
  if (op.type === 'end_game') {
    // Server also stamps the meta.endedAt for HEAD/lifecycle queries.
    meta.endedAt = snapshot.endedAt
  }

  // Bump seq, build envelope, append (cap log).
  meta.seq += 1
  snapshot.seq = meta.seq
  const envelope: SyncOpEnvelope = {
    seq: meta.seq,
    opId: input.opId,
    deviceId: input.deviceId,
    ts: Date.now(),
    op,
  }
  ops.push(envelope)
  if (ops.length > MAX_OPS) ops.splice(0, ops.length - MAX_OPS)
  return { ok: true, envelope, snapshot }
}

export const getSyncTtlMs = () => SYNC_TTL_MS

/** Test-only helper: clear the in-memory store. */
export const __clearSyncStoreForTests = () => {
  memSessions.clear()
  memCodeIndex.clear()
  memCreatedAt.clear()
}
