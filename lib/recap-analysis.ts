import type { GameEvent, Recap } from '@/types/replay'

/**
 * Pure helpers that derive recap-page data from a Recap document.
 * No React, no fetch — easy to unit-test.
 */

export type LifeSeriesPoint = {
  /** Event sequence number (x-axis). */
  seq: number
  /** Life value at this seq for each player, keyed by player id. */
  values: Record<number, number>
}

export type LifeSeries = {
  points: LifeSeriesPoint[]
  /** Min life value across the whole series (for axis scaling). */
  min: number
  /** Max life value across the whole series. */
  max: number
}

/**
 * Build a per-event life series. We "carry forward" each player's last known
 * life value so every series has a point at every seq — that makes the SVG
 * line graph trivial to render.
 */
export const buildLifeSeries = (recap: Recap): LifeSeries => {
  const startingLife = recap.startingLife
  const current: Record<number, number> = {}
  recap.players.forEach((p) => {
    current[p.id] = startingLife
  })

  const points: LifeSeriesPoint[] = []
  let min = startingLife
  let max = startingLife

  // Seed point at seq 0 (game_start).
  points.push({ seq: 0, values: { ...current } })

  for (const ev of recap.events) {
    if (ev.type === 'life_change') {
      current[ev.playerId] = ev.lifeAfter
      min = Math.min(min, ev.lifeAfter)
      max = Math.max(max, ev.lifeAfter)
      points.push({ seq: ev.seq, values: { ...current } })
    }
  }

  return { points, min, max }
}

export type CommanderDamageTotals = Record<number, number>

/** Total commander damage TAKEN per player. */
export const buildCommanderDamageTotals = (recap: Recap): CommanderDamageTotals => {
  const totals: CommanderDamageTotals = {}
  recap.players.forEach((p) => {
    totals[p.id] = 0
  })
  for (const ev of recap.events) {
    if (ev.type === 'commander_damage' && ev.delta > 0) {
      totals[ev.playerId] = (totals[ev.playerId] ?? 0) + ev.delta
    }
  }
  return totals
}

export type Highlight = {
  kind: 'biggest_swing' | 'lethal_moment' | 'first_poison' | 'comeback'
  /** Display title. */
  title: string
  /** Display body. */
  body: string
  /** seq of the underlying event (optional). */
  seq?: number
}

/** Pick a small set of headline-able highlights from the event log. */
export const buildHighlights = (recap: Recap): Highlight[] => {
  const highlights: Highlight[] = []
  const playerName = (id: number) =>
    recap.players.find((p) => p.id === id)?.name ?? `Player ${id}`

  // Biggest single life swing (largest |delta| in life_change events).
  let biggest: GameEvent | null = null
  let biggestAbs = 0
  for (const ev of recap.events) {
    if (ev.type === 'life_change') {
      const a = Math.abs(ev.delta)
      if (a > biggestAbs) {
        biggestAbs = a
        biggest = ev
      }
    }
  }
  if (biggest && biggest.type === 'life_change' && biggestAbs >= 4) {
    const dir = biggest.delta < 0 ? 'lost' : 'gained'
    highlights.push({
      kind: 'biggest_swing',
      title: `Biggest swing: ${biggestAbs} life`,
      body: `${playerName(biggest.playerId)} ${dir} ${biggestAbs} in a single move.`,
      seq: biggest.seq,
    })
  }

  // First moment a player hit ≤0 life.
  for (const ev of recap.events) {
    if (ev.type === 'life_change' && ev.lifeAfter <= 0) {
      highlights.push({
        kind: 'lethal_moment',
        title: 'Lethal',
        body: `${playerName(ev.playerId)} dropped to ${ev.lifeAfter} on event #${ev.seq}.`,
        seq: ev.seq,
      })
      break
    }
  }

  // First poison counter applied.
  for (const ev of recap.events) {
    if (ev.type === 'poison_change' && ev.delta > 0) {
      highlights.push({
        kind: 'first_poison',
        title: 'First poison',
        body: `${playerName(ev.playerId)} took their first poison counter.`,
        seq: ev.seq,
      })
      break
    }
  }

  // Simple "comeback" detection: if the declared winner reached < 25% starting
  // life at any point and still won, surface it.
  if (recap.winnerId !== undefined) {
    const threshold = recap.startingLife * 0.25
    for (const ev of recap.events) {
      if (
        ev.type === 'life_change' &&
        ev.playerId === recap.winnerId &&
        ev.lifeAfter > 0 &&
        ev.lifeAfter <= threshold
      ) {
        highlights.push({
          kind: 'comeback',
          title: 'Comeback',
          body: `${playerName(recap.winnerId)} dropped to ${ev.lifeAfter} life and still won.`,
          seq: ev.seq,
        })
        break
      }
    }
  }

  return highlights
}

/** Compose a one-line auto-headline for the recap. */
export const buildHeadline = (recap: Recap): string => {
  const winner = recap.winnerId !== undefined
    ? recap.players.find((p) => p.id === recap.winnerId)
    : undefined
  const cmdTotals = buildCommanderDamageTotals(recap)
  const totalCmd = Object.values(cmdTotals).reduce((a, b) => a + b, 0)

  if (winner) {
    const cmdTaken = cmdTotals[winner.id] ?? 0
    if (cmdTaken >= 10) {
      return `${winner.commander ?? winner.name} took ${cmdTaken} commander damage and still won`
    }
    if (totalCmd >= 21) {
      return `${winner.commander ?? winner.name} closed it out — ${totalCmd} total commander damage flew`
    }
    return `${winner.commander ?? winner.name} took it down`
  }
  return recap.podName ? `${recap.podName} — recap` : 'Pod recap'
}

/** Game duration in minutes (rounded). */
export const getDurationMinutes = (recap: Recap): number => {
  const ms = Math.max(0, recap.endedAt - recap.startedAt)
  return Math.max(1, Math.round(ms / 60000))
}
