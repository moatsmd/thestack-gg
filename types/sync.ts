/**
 * Pod Sync — types shared between client hook, API routes, and store.
 *
 * Authority model (self-only):
 *   - Each device owns exactly one player slot, identified by `seatId`.
 *   - A device may only emit ops that mutate its own seat (life, name,
 *     counters, cmdFrom updates against opponents).
 *   - The host device (the one that created the session) owns any slot
 *     not yet claimed by another device, and is the only one allowed to
 *     emit `reset` and `end_game` ops.
 *
 * Transport: 1.5s polling over a bounded Redis JSON operation log. Clients
 * pull by `sinceSeq`; the server provides a coalesced snapshot for joining
 * or recovering a cursor outside retained history. Separate receipts keep
 * retries idempotent after older operations leave the polling log.
 *
 * TTL: 24h.
 */

export type SyncCounter = 'energy' | 'experience' | 'poison' | 'mana' | 'cmd'

/** The state each device joins into. Mirrors the tracker's runtime shape. */
export type SyncPlayer = {
  id: number
  name: string
  life: number
  cmd: number
  cmdFrom: Record<number, number>
  poison: number
  mana: number
  energy: number
  experience: number
}

export type SyncGameMode = { name: string; life: number }

export type SyncSnapshot = {
  /** Monotonic counter of applied ops; clients use this as their cursor. */
  seq: number
  players: SyncPlayer[]
  gameMode: SyncGameMode
  customLife: number
  enabledCounters: SyncCounter[]
  /** Set when the host ends the game. Clients can show the recap link. */
  endedAt?: number
  winnerSeatId?: number
}

/** Op kinds — each op is idempotent given (deviceId, opId). */
export type SyncOp =
  | {
      type: 'life'
      seatId: number
      delta: number
    }
  | {
      type: 'counter'
      seatId: number
      counter: Exclude<SyncCounter, 'cmd'>
      delta: number
    }
  | {
      type: 'cmd_from'
      /** Defender (the seat taking damage) */
      seatId: number
      /** Attacker — the source commander */
      sourceId: number
      delta: number
    }
  | {
      type: 'rename'
      seatId: number
      name: string
    }
  | {
      /** Host-only. Reset all player life + counters to startingLife. */
      type: 'reset'
    }
  | {
      /** Host-only. Mark the pod as ended; freezes further mutations. */
      type: 'end_game'
      winnerSeatId?: number
    }

export type SyncOpEnvelope = {
  /** Server-assigned monotonic sequence. */
  seq: number
  /** Client-generated unique id for dedup; format `${deviceId}:${n}`. */
  opId: string
  deviceId: string
  /** Server clock when op was accepted. */
  ts: number
  op: SyncOp
}

/** Seats binding: who owns which player id. */
export type SyncSeat = {
  seatId: number
  /** Own deviceId or an opaque public owner marker; null = unclaimed (host owns). */
  ownerDeviceId: string | null
  /** Display name as last-known; mirrors player.name for the lobby. */
  name: string
}

export type SyncSessionMeta = {
  id: string
  /** Short human-readable code for verbal sharing (e.g. "K7M-X9P"). */
  code: string
  /** Own deviceId for the host, opaque public marker for other readers. */
  hostDeviceId: string
  createdAt: number
  /** Latest applied seq (mirrors snapshot.seq, but stored separately for fast HEAD). */
  seq: number
  /** Set when end_game op is applied. */
  endedAt?: number
}

export type SyncJoinResponse = {
  session: SyncSessionMeta
  snapshot: SyncSnapshot
  seats: SyncSeat[]
}

export type SyncPollResponse = {
  ops: SyncOpEnvelope[]
  seq: number
  /** Seat changes do not advance the game-op cursor. */
  seats: SyncSeat[]
  /** Present when the requested cursor cannot be replayed from retained ops. */
  snapshot?: SyncSnapshot
}
