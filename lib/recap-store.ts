import { getRedis } from '@/lib/redis'
import type { GameEvent, Recap, RecapPlayer } from '@/types/replay'

/**
 * Recap store.
 *
 * Mirrors the share-store pattern (Redis with in-memory fallback for dev) but
 * with a longer 30-day TTL and an immutable contract — once created, recaps
 * are never updated or deleted via the API.
 */

const RECAP_TTL_MS = 30 * 24 * 60 * 60 * 1000
const RECAP_TTL_SEC = Math.floor(RECAP_TTL_MS / 1000)
const recaps = new Map<string, Recap>()

const cleanupExpired = () => {
  const now = Date.now()
  recaps.forEach((recap, id) => {
    if (recap.createdAt + RECAP_TTL_MS <= now) {
      recaps.delete(id)
    }
  })
}

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  }
  return Math.random().toString(16).slice(2, 14)
}

const getKey = (id: string) => `recap:${id}`

export type CreateRecapInput = {
  podName?: string
  players: RecapPlayer[]
  format: string
  startingLife: number
  winnerId?: number
  events: GameEvent[]
}

const deriveTimes = (events: GameEvent[]) => {
  const startedAt = events[0]?.timestamp ?? Date.now()
  const endedAt = events[events.length - 1]?.timestamp ?? startedAt
  return { startedAt, endedAt }
}

export const createRecap = async (input: CreateRecapInput): Promise<Recap> => {
  const now = Date.now()
  const { startedAt, endedAt } = deriveTimes(input.events)
  const recap: Recap = {
    id: createId(),
    podName: input.podName,
    players: input.players,
    format: input.format,
    startingLife: input.startingLife,
    winnerId: input.winnerId,
    events: input.events,
    startedAt,
    endedAt,
    createdAt: now,
  }

  const redis = await getRedis()
  if (!redis) {
    cleanupExpired()
    recaps.set(recap.id, recap)
    return recap
  }

  await redis.set(getKey(recap.id), JSON.stringify(recap), {
    EX: RECAP_TTL_SEC,
  })
  return recap
}

export const getRecap = async (id: string): Promise<Recap | null> => {
  const redis = await getRedis()
  if (!redis) {
    cleanupExpired()
    return recaps.get(id) ?? null
  }

  const cached = await redis.get(getKey(id))
  if (!cached) {
    return null
  }
  return JSON.parse(cached) as Recap
}

export const getRecapTtlMs = () => RECAP_TTL_MS

/** Test-only helper: clear the in-memory store. */
export const __clearRecapStoreForTests = () => {
  recaps.clear()
}
