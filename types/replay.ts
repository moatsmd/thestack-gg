/**
 * Game Replay event types.
 *
 * The tracker page records a chronological log of state-changing events as
 * the game plays out. At "End game" time the log is sent to /api/recap and
 * a shareable recap page is generated at /recap/[id].
 *
 * Design notes:
 * - Events are append-only; once logged they're never mutated.
 * - Each event carries a monotonic `seq` (insertion order) and a wall-clock
 *   `timestamp` (ms since epoch). Both are useful: `seq` for ordering across
 *   identical timestamps, `timestamp` for "biggest swing in the last
 *   30 seconds" style highlight detection.
 * - We do NOT track turns explicitly in v1. v1.1 will add a "Next turn"
 *   button in the tracker; until then, recap pages infer activity windows
 *   from time gaps.
 */

export type RecapPlayer = {
  id: number
  /** Player name as entered in setup (or "Player 1" etc. by default). */
  name: string
  /** Optional commander name, captured at end-game time. */
  commander?: string
}

/** Adjustment to a player's life total. */
export type LifeChangeEvent = {
  type: 'life_change'
  seq: number
  timestamp: number
  playerId: number
  /** Signed delta. Negative = damage, positive = heal. */
  delta: number
  /** Absolute life total AFTER applying the delta. */
  lifeAfter: number
}

/** Adjustment to a player's poison counter total. */
export type PoisonChangeEvent = {
  type: 'poison_change'
  seq: number
  timestamp: number
  playerId: number
  delta: number
  poisonAfter: number
}

/**
 * Adjustment to a player's commander-damage-taken total.
 *
 * v1 records this as a sum (no per-source). The tracker UI doesn't expose
 * source attribution today; v1.1 will add it and we'll extend this event
 * with `sourcePlayerId`. Treating it as a separate event type now means we
 * don't have to migrate the schema later.
 */
export type CommanderDamageEvent = {
  type: 'commander_damage'
  seq: number
  timestamp: number
  /** Player TAKING the damage. */
  playerId: number
  delta: number
  cmdAfter: number
  /** Optional source player. v1.1 wires the UI; v1 leaves this undefined. */
  sourcePlayerId?: number
}

/** Game started — first event in any recap. */
export type GameStartEvent = {
  type: 'game_start'
  seq: number
  timestamp: number
  format: string
  startingLife: number
  players: RecapPlayer[]
}

/** Game ended — last event in any recap. */
export type GameEndEvent = {
  type: 'game_end'
  seq: number
  timestamp: number
  /** Optional declared winner. */
  winnerId?: number
}

export type GameEvent =
  | GameStartEvent
  | LifeChangeEvent
  | PoisonChangeEvent
  | CommanderDamageEvent
  | GameEndEvent

/** Stored recap document. */
export type Recap = {
  id: string
  /** Optional pod name entered at end-game. */
  podName?: string
  /** Final players array (with commanders, if entered). */
  players: RecapPlayer[]
  /** Format string ("Commander 40", "Standard 20", etc.). */
  format: string
  /** Starting life total used for axes. */
  startingLife: number
  /** Optional declared winner id. */
  winnerId?: number
  /** Full ordered event log. */
  events: GameEvent[]
  /** Wall-clock ms when the game started (first event timestamp). */
  startedAt: number
  /** Wall-clock ms when the game ended. */
  endedAt: number
  /** Wall-clock ms when the recap was created (server-set). */
  createdAt: number
}
