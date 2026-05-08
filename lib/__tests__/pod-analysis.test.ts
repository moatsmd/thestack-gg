import {
  buildLeaderboard,
  buildHeadToHead,
  buildPodSummary,
} from '../pod-analysis'
import type { Pod, PodRecapSummary } from '@/types/pod'

const pod: Pod = {
  id: 'pod-1',
  name: 'Crew',
  members: [
    { key: 'alice', displayName: 'Alice' },
    { key: 'bob', displayName: 'Bob' },
    { key: 'carol', displayName: 'Carol' },
  ],
  recapIds: ['r1', 'r2', 'r3'],
  createdAt: 1_000,
  updatedAt: 4_000,
}

const summary = (overrides: Partial<PodRecapSummary>): PodRecapSummary => ({
  recapId: 'rX',
  format: 'Commander 40',
  startingLife: 40,
  startedAt: 1_000,
  endedAt: 2_000,
  players: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Carol' },
  ],
  winnerId: 1,
  ...overrides,
})

const recaps: PodRecapSummary[] = [
  // Alice wins all three present
  summary({ recapId: 'r1', winnerId: 1, startedAt: 1_000, endedAt: 2_000 }),
  // Bob wins (Alice + Bob only)
  summary({
    recapId: 'r2',
    winnerId: 2,
    startedAt: 3_000,
    endedAt: 4_000,
    players: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ],
  }),
  // Alice wins again, all three present
  summary({ recapId: 'r3', winnerId: 1, startedAt: 5_000, endedAt: 7_000 }),
]

describe('buildLeaderboard', () => {
  it('orders by win-rate desc, then games desc, then name asc', () => {
    const board = buildLeaderboard(pod, recaps)
    expect(board.map((r) => r.displayName)).toEqual(['Alice', 'Bob', 'Carol'])
    const alice = board[0]
    expect(alice.games).toBe(3)
    expect(alice.wins).toBe(2)
    expect(alice.winRate).toBeCloseTo(2 / 3)
    const bob = board[1]
    expect(bob.games).toBe(3)
    expect(bob.wins).toBe(1)
    const carol = board[2]
    expect(carol.games).toBe(2)
    expect(carol.wins).toBe(0)
  })

  it('returns rows with zero stats when no recaps exist', () => {
    const board = buildLeaderboard(pod, [])
    expect(board).toHaveLength(3)
    expect(board.every((r) => r.games === 0 && r.wins === 0)).toBe(true)
  })
})

describe('buildHeadToHead', () => {
  it('builds a matrix and a flat rivalry list', () => {
    const h2h = buildHeadToHead(pod, recaps)
    // Alice vs Bob: 3 games together, Alice wins twice, Bob once
    expect(h2h.matrix['alice']['bob']).toEqual({ wins: 2, games: 3 })
    expect(h2h.matrix['bob']['alice']).toEqual({ wins: 1, games: 3 })
    // Alice vs Carol: 2 games, Alice 2-0
    expect(h2h.matrix['alice']['carol']).toEqual({ wins: 2, games: 2 })
    // Top rivalry by volume
    expect(h2h.rivalries[0].games).toBe(3)
  })

  it('filters out pairs that never played together', () => {
    const h2h = buildHeadToHead(pod, [])
    expect(h2h.rivalries).toEqual([])
  })
})

describe('buildPodSummary', () => {
  it('aggregates totals and picks lastPlayedAt', () => {
    const s = buildPodSummary(pod, recaps)
    expect(s.totalGames).toBe(3)
    // each recap rounds up to a 1-min minimum (deltas are in ms, all small)
    expect(s.totalMinutes).toBe(3)
    expect(s.lastPlayedAt).toBe(7_000)
    expect(s.topFormat).toBe('Commander 40')
  })

  it('falls back to pod.createdAt when no recaps', () => {
    const s = buildPodSummary(pod, [])
    expect(s.totalGames).toBe(0)
    expect(s.lastPlayedAt).toBe(pod.createdAt)
    expect(s.topFormat).toBeUndefined()
  })
})
