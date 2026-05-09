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
 * Transport: 1.5s polling. Each op is appended to a Redis list; clients
 * pull by `sinceSeq`. The server also keeps a coalesced snapshot for
 * fresh-join bootstrapping.
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
  /** The deviceId that has claimed this seat; null = unclaimed (host owns). */
  ownerDeviceId: string | null
  /** Display name as last-known; mirrors player.name for the lobby. */
  name: string
}

export type SyncSessionMeta = {
  id: string
  /** Short human-readable code for verbal sharing (e.g. "K7M-X9P"). */
  code: string
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
