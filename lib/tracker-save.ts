import type { SyncSnapshot } from '@/types/sync'
import type { GameEvent } from '@/types/replay'

export const TRACKER_SAVE_KEY = 'thestack:active-table:v1'
export type SavedTable = {
  snapshot: SyncSnapshot
  events: GameEvent[]
  syncSessionId: string | null
  savedAt: number
}

const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.length <= 256 && !/[\u0000-\u001f\u007f]/.test(value)
const integer = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value)
const total = (value: unknown): value is number => integer(value) && Math.abs(value) <= 1_000_000_000
const nonnegative = (value: unknown): value is number => total(value) && value >= 0
const positive = (value: unknown): value is number => total(value) && value > 0
const timestamp = (value: unknown): value is number => integer(value) && value >= 0
const COUNTERS = ['cmd', 'poison', 'mana', 'energy', 'experience']

function validEvents(events: unknown, playerIds: Set<number>): events is GameEvent[] {
  if (!Array.isArray(events) || events.length > 10000) return false
  let previousSeq = -1
  return events.every((event: unknown, index: number) => {
    if (!record(event) || !integer(event.seq) || event.seq <= previousSeq || !timestamp(event.timestamp)) return false
    previousSeq = event.seq
    if (index === 0 && event.type !== 'game_start') return false
    if (event.type === 'game_start') {
      if (index !== 0 || !text(event.format) || !positive(event.startingLife) ||
        !Array.isArray(event.players) || event.players.length !== playerIds.size) return false
      const seen = new Set<number>()
      return event.players.every((player: unknown) => {
        if (!record(player) || !positive(player.id) || !playerIds.has(player.id) || seen.has(player.id) || !text(player.name)) return false
        if (player.commander !== undefined && !text(player.commander)) return false
        seen.add(player.id)
        return true
      })
    }
    if (event.type === 'game_end') {
      return index === events.length - 1 &&
        (event.winnerId === undefined || (positive(event.winnerId) && playerIds.has(event.winnerId)))
    }
    if (!positive(event.playerId) || !playerIds.has(event.playerId) || !total(event.delta)) return false
    if (event.type === 'life_change') return total(event.lifeAfter)
    if (event.type === 'poison_change') return nonnegative(event.poisonAfter)
    if (event.type === 'commander_damage') {
      return nonnegative(event.cmdAfter) && (event.sourcePlayerId === undefined ||
        (positive(event.sourcePlayerId) && playerIds.has(event.sourcePlayerId)))
    }
    return false
  })
}

/** Validate every field consumed by the tracker and log before restoring it. */
export function readTable(): SavedTable | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(TRACKER_SAVE_KEY) || 'null')
    if (!record(value) || !timestamp(value.savedAt) || Date.now() - value.savedAt > 30 * 60 * 60 * 1000 ||
      !(value.syncSessionId === null || (text(value.syncSessionId) && value.syncSessionId.length > 0))) return null
    const snapshot = value.snapshot
    if (!record(snapshot) || !nonnegative(snapshot.seq) || !Array.isArray(snapshot.players) ||
      snapshot.players.length < 1 || snapshot.players.length > 4 || !record(snapshot.gameMode) ||
      !text(snapshot.gameMode.name) || !positive(snapshot.gameMode.life) || !positive(snapshot.customLife) ||
      !Array.isArray(snapshot.enabledCounters) || snapshot.enabledCounters.length > COUNTERS.length ||
      snapshot.enabledCounters.some(counter => typeof counter !== 'string' || !COUNTERS.includes(counter)) ||
      new Set(snapshot.enabledCounters).size !== snapshot.enabledCounters.length) return null
    if (snapshot.endedAt !== undefined && !timestamp(snapshot.endedAt)) return null
    const playerIds = new Set<number>()
    for (const player of snapshot.players) {
      if (!record(player) || !positive(player.id) || playerIds.has(player.id) || !text(player.name) ||
        !total(player.life) || !['cmd', 'poison', 'mana', 'energy', 'experience'].every(key => nonnegative(player[key])) ||
        !record(player.cmdFrom)) return null
      playerIds.add(player.id)
    }
    if (snapshot.players.some(player => Object.entries(player.cmdFrom).some(([sourceId, amount]) =>
      !positive(Number(sourceId)) || !playerIds.has(Number(sourceId)) || !nonnegative(amount)))) return null
    if (snapshot.winnerSeatId !== undefined &&
      (!positive(snapshot.winnerSeatId) || !playerIds.has(snapshot.winnerSeatId))) return null
    if (!validEvents(value.events, playerIds)) return null
    return value as unknown as SavedTable
  } catch { return null }
}

export function saveTable(table: Omit<SavedTable, 'savedAt'>): boolean {
  try {
    localStorage.setItem(TRACKER_SAVE_KEY, JSON.stringify({ ...table, savedAt: Date.now() }))
    return true
  } catch { return false }
}

export function clearTable() {
  try { localStorage.removeItem(TRACKER_SAVE_KEY) } catch { /* Storage is optional. */ }
}
