import { getRedis } from '@/lib/redis'
import type {
  SyncCounter,
  SyncGameMode,
  SyncJoinResponse,
  SyncOp,
  SyncOpEnvelope,
  SyncPlayer,
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
 *
 * Concurrency: ops are accepted serially per session via the `appendOp`
 * function. Two clients writing simultaneously go through the route handler
 * which serializes via Redis WATCH/MULTI in production. For MVP we do
 * read-modify-write without WATCH and accept that the rare lost-tick
 * collision (≤1.5s window) is acceptable for a 6-player table — each op is
 * scoped to a single seat and ops mutate independent fields, so collisions
 * almost never overlap.
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
}
const memSessions = new Map<string, MemSession>()
const memCodeIndex = new Map<string, string>()
const memCreatedAt = new Map<string, number>()

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
    memSessions.set(meta.id, { meta, snapshot, seats, ops: [] })
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
  const [metaStr, snapStr, seatsStr] = await Promise.all([
    redis.get(metaKey(id)),
    redis.get(snapKey(id)),
    redis.get(seatsKey(id)),
  ])
  if (!metaStr || !snapStr || !seatsStr) return null
  return {
    session: JSON.parse(metaStr) as SyncSessionMeta,
    snapshot: JSON.parse(snapStr) as SyncSnapshot,
    seats: JSON.parse(seatsStr) as SyncSeat[],
  }
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
): Promise<{ ops: SyncOpEnvelope[]; seq: number } | null> => {
  const redis = await getRedis()
  if (!redis) {
    cleanupExpired()
    const sess = memSessions.get(id)
    if (!sess) return null
    return {
      ops: sess.ops.filter((o) => o.seq > sinceSeq),
      seq: sess.meta.seq,
    }
  }
  const [opsStr, metaStr] = await Promise.all([
    redis.get(opsKey(id)),
    redis.get(metaKey(id)),
  ])
  if (!opsStr || !metaStr) return null
  const ops = JSON.parse(opsStr) as SyncOpEnvelope[]
  const meta = JSON.parse(metaStr) as SyncSessionMeta
  return {
    ops: ops.filter((o) => o.seq > sinceSeq),
    seq: meta.seq,
  }
}

// ─── Seat claiming ────────────────────────────────────────────────────
export const claimSeat = async (
  id: string,
  seatId: number,
  deviceId: string,
): Promise<{ ok: true; seats: SyncSeat[] } | { ok: false; error: string }> => {
  if (!deviceId) return { ok: false, error: 'deviceId required' }

  const redis = await getRedis()
  if (!redis) {
    cleanupExpired()
    const sess = memSessions.get(id)
    if (!sess) return { ok: false, error: 'not_found' }
    return claimInPlace(sess.seats, seatId, deviceId)
      ? { ok: true, seats: sess.seats }
      : { ok: false, error: 'seat_taken' }
  }

  const seatsStr = await redis.get(seatsKey(id))
  if (!seatsStr) return { ok: false, error: 'not_found' }
  const seats = JSON.parse(seatsStr) as SyncSeat[]
  if (!claimInPlace(seats, seatId, deviceId)) {
    return { ok: false, error: 'seat_taken' }
  }
  await redis.set(seatsKey(id), JSON.stringify(seats), { EX: SYNC_TTL_SEC })
  return { ok: true, seats }
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
  if (!input.deviceId) return { ok: false, error: 'deviceId required', status: 400 }
  if (!input.opId) return { ok: false, error: 'opId required', status: 400 }

  const redis = await getRedis()
  if (!redis) {
    cleanupExpired()
    const sess = memSessions.get(input.sessionId)
    if (!sess) return { ok: false, error: 'not_found', status: 404 }
    return applyOpInPlace(sess.meta, sess.snapshot, sess.seats, sess.ops, input)
  }

  const [metaStr, snapStr, seatsStr, opsStr] = await Promise.all([
    redis.get(metaKey(input.sessionId)),
    redis.get(snapKey(input.sessionId)),
    redis.get(seatsKey(input.sessionId)),
    redis.get(opsKey(input.sessionId)),
  ])
  if (!metaStr || !snapStr || !seatsStr || !opsStr) {
    return { ok: false, error: 'not_found', status: 404 }
  }
  const meta = JSON.parse(metaStr) as SyncSessionMeta
  const snapshot = JSON.parse(snapStr) as SyncSnapshot
  const seats = JSON.parse(seatsStr) as SyncSeat[]
  const ops = JSON.parse(opsStr) as SyncOpEnvelope[]

  const result = applyOpInPlace(meta, snapshot, seats, ops, input)
  if (!result.ok) return result

  await Promise.all([
    redis.set(metaKey(input.sessionId), JSON.stringify(meta), { EX: SYNC_TTL_SEC }),
    redis.set(snapKey(input.sessionId), JSON.stringify(snapshot), { EX: SYNC_TTL_SEC }),
    redis.set(opsKey(input.sessionId), JSON.stringify(ops), { EX: SYNC_TTL_SEC }),
  ])
  return result
}

const applyOpInPlace = (
  meta: SyncSessionMeta,
  snapshot: SyncSnapshot,
  seats: SyncSeat[],
  ops: SyncOpEnvelope[],
  input: AppendOpInput,
): AppendOpResult => {
  // Idempotency: if opId already applied, return prior envelope.
  const dup = ops.find((o) => o.opId === input.opId)
  if (dup) return { ok: true, envelope: dup, snapshot }

  // If the game has ended, only allow no-op reads (block all writes).
  if (meta.endedAt) {
    return { ok: false, error: 'game_ended', status: 409 }
  }

  // Authority check: only the owning device may mutate a seat.
  // Host owns any seat with ownerDeviceId === null and is also the only
  // one allowed to emit reset / end_game.
  const op = input.op
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

  // Apply mutation.
  switch (op.type) {
    case 'life': {
      const p = snapshot.players.find((x) => x.id === op.seatId)
      if (!p) return { ok: false, error: 'unknown_seat', status: 400 }
      p.life = p.life + op.delta
      break
    }
    case 'counter': {
      const p = snapshot.players.find((x) => x.id === op.seatId)
      if (!p) return { ok: false, error: 'unknown_seat', status: 400 }
      const cur = p[op.counter]
      p[op.counter] = Math.max(0, cur + op.delta)
      break
    }
    case 'cmd_from': {
      const p = snapshot.players.find((x) => x.id === op.seatId)
      if (!p) return { ok: false, error: 'unknown_seat', status: 400 }
      p.cmdFrom ??= {}
      const cur = p.cmdFrom[op.sourceId] ?? 0
      const next = Math.max(0, cur + op.delta)
      p.cmdFrom[op.sourceId] = next
      // Also update derived life from this commander hit (keep in sync with
      // the local tracker behaviour: cmdFrom delta also moves life by -delta).
      p.life = p.life - op.delta
      // Recompute max-from-single-source for the cmd badge.
      let max = 0
      for (const v of Object.values(p.cmdFrom)) if (v > max) max = v
      p.cmd = max
      break
    }
    case 'rename': {
      const p = snapshot.players.find((x) => x.id === op.seatId)
      if (!p) return { ok: false, error: 'unknown_seat', status: 400 }
      const trimmed = op.name.trim().slice(0, 32)
      if (trimmed) {
        p.name = trimmed
        const seat = seats.find((s) => s.seatId === op.seatId)
        if (seat) seat.name = trimmed
      }
      break
    }
    case 'reset': {
      const startLife =
        snapshot.gameMode.name === 'Custom'
          ? snapshot.customLife
          : snapshot.gameMode.life
      for (const p of snapshot.players) {
        p.life = startLife
        p.cmd = 0
        p.cmdFrom = {}
        p.poison = 0
        p.mana = 0
        p.energy = 0
        p.experience = 0
      }
      break
    }
    case 'end_game': {
      meta.endedAt = Date.now()
      snapshot.endedAt = meta.endedAt
      snapshot.winnerSeatId = op.winnerSeatId
      break
    }
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
