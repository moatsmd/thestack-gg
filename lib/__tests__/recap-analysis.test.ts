import {
  buildLifeSeries,
  buildCommanderDamageTotals,
  buildHighlights,
  buildHeadline,
  getDurationMinutes,
} from '../recap-analysis'
import type { Recap } from '@/types/replay'

const baseRecap = (): Recap => ({
  id: 'rec_test',
  podName: 'Friday Night Pod',
  format: 'Commander 40',
  startingLife: 40,
  players: [
    { id: 1, name: 'Alice', commander: 'Atraxa' },
    { id: 2, name: 'Bob', commander: 'Edgar' },
    { id: 3, name: 'Cara', commander: 'Krenko' },
  ],
  winnerId: 1,
  startedAt: 1_000,
  endedAt: 1_000 + 35 * 60_000,
  createdAt: 1_000,
  events: [
    {
      type: 'game_start',
      seq: 0,
      timestamp: 1_000,
      format: 'Commander 40',
      startingLife: 40,
      players: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Cara' },
      ],
    },
    { type: 'life_change', seq: 1, timestamp: 2_000, playerId: 1, delta: -8, lifeAfter: 32 },
    { type: 'life_change', seq: 2, timestamp: 3_000, playerId: 2, delta: -5, lifeAfter: 35 },
    { type: 'commander_damage', seq: 3, timestamp: 4_000, playerId: 1, delta: 7, cmdAfter: 7 },
    { type: 'life_change', seq: 4, timestamp: 5_000, playerId: 1, delta: -25, lifeAfter: 7 },
    { type: 'poison_change', seq: 5, timestamp: 6_000, playerId: 2, delta: 2, poisonAfter: 2 },
    { type: 'life_change', seq: 6, timestamp: 7_000, playerId: 3, delta: -42, lifeAfter: -2 },
    { type: 'commander_damage', seq: 7, timestamp: 8_000, playerId: 1, delta: 5, cmdAfter: 12 },
    { type: 'game_end', seq: 8, timestamp: 1_000 + 35 * 60_000, winnerId: 1 },
  ],
})

describe('recap-analysis', () => {
  describe('buildLifeSeries', () => {
    it('seeds every player at starting life', () => {
      const r = baseRecap()
      const s = buildLifeSeries(r)
      expect(s.points[0].values[1]).toBe(40)
      expect(s.points[0].values[2]).toBe(40)
      expect(s.points[0].values[3]).toBe(40)
    })

    it('adds one point per life_change event', () => {
      const r = baseRecap()
      const s = buildLifeSeries(r)
      // 1 seed + 4 life_change events = 5 points
      expect(s.points).toHaveLength(5)
    })

    it('tracks min and max across the game', () => {
      const r = baseRecap()
      const s = buildLifeSeries(r)
      expect(s.min).toBe(-2)
      expect(s.max).toBe(40)
    })

    it('carries forward player values across events', () => {
      const r = baseRecap()
      const s = buildLifeSeries(r)
      const last = s.points[s.points.length - 1]
      expect(last.values[1]).toBe(7)
      expect(last.values[2]).toBe(35)
      expect(last.values[3]).toBe(-2)
    })
  })

  describe('buildCommanderDamageTotals', () => {
    it('sums positive cmd deltas per player', () => {
      const r = baseRecap()
      const totals = buildCommanderDamageTotals(r)
      expect(totals[1]).toBe(12)
      expect(totals[2]).toBe(0)
    })

    it('initializes every player at zero', () => {
      const r = baseRecap()
      const totals = buildCommanderDamageTotals(r)
      expect(totals[3]).toBe(0)
    })
  })

  describe('buildHighlights', () => {
    it('surfaces the biggest swing', () => {
      const r = baseRecap()
      const h = buildHighlights(r)
      const swing = h.find((x) => x.kind === 'biggest_swing')
      expect(swing).toBeDefined()
      expect(swing?.title).toContain('42')
    })

    it('surfaces a lethal moment when a player drops to 0 or below', () => {
      const r = baseRecap()
      const h = buildHighlights(r)
      const lethal = h.find((x) => x.kind === 'lethal_moment')
      expect(lethal).toBeDefined()
    })

    it('surfaces first poison', () => {
      const r = baseRecap()
      const h = buildHighlights(r)
      const poison = h.find((x) => x.kind === 'first_poison')
      expect(poison).toBeDefined()
    })

    it('surfaces a comeback when winner dropped low and still won', () => {
      const r = baseRecap()
      const h = buildHighlights(r)
      const comeback = h.find((x) => x.kind === 'comeback')
      expect(comeback).toBeDefined()
    })

    it('does not surface highlights for trivial games', () => {
      const r: Recap = {
        ...baseRecap(),
        events: [
          {
            type: 'game_start',
            seq: 0,
            timestamp: 0,
            format: 'Commander 40',
            startingLife: 40,
            players: [{ id: 1, name: 'Solo' }],
          },
          { type: 'game_end', seq: 1, timestamp: 1, winnerId: 1 },
        ],
        winnerId: 1,
      }
      const h = buildHighlights(r)
      expect(h).toHaveLength(0)
    })
  })

  describe('buildHeadline', () => {
    it('mentions the winner when commander damage was significant', () => {
      const r = baseRecap()
      const headline = buildHeadline(r)
      expect(headline).toMatch(/Atraxa/)
      expect(headline).toMatch(/12/)
    })

    it('falls back to pod name when no winner', () => {
      const r = baseRecap()
      r.winnerId = undefined
      const headline = buildHeadline(r)
      expect(headline).toContain('Friday Night Pod')
    })
  })

  describe('getDurationMinutes', () => {
    it('rounds to the nearest minute, minimum 1', () => {
      const r = baseRecap()
      expect(getDurationMinutes(r)).toBe(35)
    })

    it('returns 1 for instant games', () => {
      const r: Recap = { ...baseRecap(), startedAt: 100, endedAt: 100 }
      expect(getDurationMinutes(r)).toBe(1)
    })
  })
})
