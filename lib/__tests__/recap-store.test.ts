import {
  createRecap,
  getRecap,
  getRecapTtlMs,
  __clearRecapStoreForTests,
} from '../recap-store'
import type { GameEvent, RecapPlayer } from '@/types/replay'

// Force in-memory mode by ensuring REDIS_URL is not set.
beforeEach(() => {
  delete process.env.REDIS_URL
  __clearRecapStoreForTests()
})

const players: RecapPlayer[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
]

const baseEvents = (): GameEvent[] => [
  {
    type: 'game_start',
    seq: 0,
    timestamp: 1_000,
    format: 'Commander 40',
    startingLife: 40,
    players,
  },
  {
    type: 'life_change',
    seq: 1,
    timestamp: 2_000,
    playerId: 1,
    delta: -3,
    lifeAfter: 37,
  },
  {
    type: 'game_end',
    seq: 2,
    timestamp: 3_000,
    winnerId: 2,
  },
]

describe('recap-store', () => {
  it('creates a recap and assigns a non-empty id', async () => {
    const r = await createRecap({
      players,
      format: 'Commander 40',
      startingLife: 40,
      events: baseEvents(),
      winnerId: 2,
    })
    expect(typeof r.id).toBe('string')
    expect(r.id.length).toBeGreaterThan(4)
    expect(r.players).toHaveLength(2)
    expect(r.winnerId).toBe(2)
  })

  it('derives startedAt and endedAt from events', async () => {
    const r = await createRecap({
      players,
      format: 'Commander 40',
      startingLife: 40,
      events: baseEvents(),
    })
    expect(r.startedAt).toBe(1_000)
    expect(r.endedAt).toBe(3_000)
  })

  it('stores then retrieves a recap by id', async () => {
    const r = await createRecap({
      players,
      format: 'Commander 40',
      startingLife: 40,
      events: baseEvents(),
    })
    const got = await getRecap(r.id)
    expect(got).not.toBeNull()
    expect(got?.id).toBe(r.id)
    expect(got?.events).toHaveLength(3)
  })

  it('returns null for a missing recap', async () => {
    const got = await getRecap('does-not-exist')
    expect(got).toBeNull()
  })

  it('exposes a 30-day TTL', () => {
    expect(getRecapTtlMs()).toBe(30 * 24 * 60 * 60 * 1000)
  })

  it('generates unique ids across creates', async () => {
    const a = await createRecap({
      players,
      format: 'Commander 40',
      startingLife: 40,
      events: baseEvents(),
    })
    const b = await createRecap({
      players,
      format: 'Commander 40',
      startingLife: 40,
      events: baseEvents(),
    })
    expect(a.id).not.toBe(b.id)
  })
})
