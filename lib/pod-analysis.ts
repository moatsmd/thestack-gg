import type { Pod, PodRecapSummary } from '@/types/pod'
import { memberKey } from '@/lib/pod-store'

/**
 * Pure helpers that derive aggregate pod statistics from a Pod + the
 * summaries of its linked recaps. No I/O \u2014 trivial to unit-test.
 *
 * Members are matched across recaps by `memberKey(displayName)` (lowercased
 * trimmed name). That's the entire identity model.
 */

export type LeaderboardRow = {
  memberKey: string
  displayName: string
  /** Games played in this pod. */
  games: number
  /** Games won. A win means the member's name matched the recap's winnerId. */
  wins: number
  /** wins / games, 0\u20131. */
  winRate: number
  /** Sum of (startingLife \u2212 player's last lifeAfter) across games. */
  totalLifeLost: number
  /** Average life lost per game. */
  avgLifeLost: number
}

const findPlayerInRecap = (
  recap: PodRecapSummary,
  key: string,
): { id: number; commander?: string } | null => {
  const player = recap.players.find((p) => memberKey(p.name) === key)
  if (!player) return null
  return { id: player.id, commander: player.commander }
}

/** Per-member aggregate stats, sorted by win-rate desc then games desc. */
export const buildLeaderboard = (
  pod: Pod,
  recaps: PodRecapSummary[],
): LeaderboardRow[] => {
  const rows: Record<string, LeaderboardRow> = {}
  for (const m of pod.members) {
    rows[m.key] = {
      memberKey: m.key,
      displayName: m.displayName,
      games: 0,
      wins: 0,
      winRate: 0,
      totalLifeLost: 0,
      avgLifeLost: 0,
    }
  }

  for (const recap of recaps) {
    for (const member of pod.members) {
      const player = findPlayerInRecap(recap, member.key)
      if (!player) continue
      const row = rows[member.key]
      row.games += 1
      if (recap.winnerId !== undefined && recap.winnerId === player.id) {
        row.wins += 1
      }
      // No life-history in summaries \u2014 we approximate "life lost" as
      // (startingLife \u2212 0) for losses, and 0 for the winner. That keeps the
      // metric comparable across pods without re-fetching every event log.
      // It's an MVP heuristic, not a precise figure.
      const isWinner = recap.winnerId !== undefined && recap.winnerId === player.id
      row.totalLifeLost += isWinner ? 0 : recap.startingLife
    }
  }

  const list = Object.values(rows).map((r) => ({
    ...r,
    winRate: r.games > 0 ? r.wins / r.games : 0,
    avgLifeLost: r.games > 0 ? Math.round(r.totalLifeLost / r.games) : 0,
  }))

  list.sort((a, b) => {
    if (b.winRate !== a.winRate) return b.winRate - a.winRate
    if (b.games !== a.games) return b.games - a.games
    return a.displayName.localeCompare(b.displayName)
  })

  return list
}

export type HeadToHeadCell = {
  /** Member A defeated member B this many times. */
  wins: number
  /** Total games where both A and B were present. */
  games: number
}

export type HeadToHead = {
  /** memberKey \u2192 memberKey \u2192 cell (A beat B). */
  matrix: Record<string, Record<string, HeadToHeadCell>>
  /** A flat list of the highest-volume rivalries, sorted by games desc. */
  rivalries: Array<{
    aKey: string
    aDisplay: string
    bKey: string
    bDisplay: string
    aWins: number
    bWins: number
    games: number
  }>
}

export const buildHeadToHead = (
  pod: Pod,
  recaps: PodRecapSummary[],
): HeadToHead => {
  const matrix: HeadToHead['matrix'] = {}
  for (const m of pod.members) {
    matrix[m.key] = {}
    for (const other of pod.members) {
      if (other.key === m.key) continue
      matrix[m.key][other.key] = { wins: 0, games: 0 }
    }
  }

  for (const recap of recaps) {
    const presentKeys = recap.players
      .map((p) => memberKey(p.name))
      .filter((k) => pod.members.some((m) => m.key === k))

    // Increment "games together" for every pair.
    for (let i = 0; i < presentKeys.length; i++) {
      for (let j = 0; j < presentKeys.length; j++) {
        if (i === j) continue
        const a = presentKeys[i]
        const b = presentKeys[j]
        if (matrix[a]?.[b]) matrix[a][b].games += 1
      }
    }

    // Award a win to the recap winner against every other present member.
    if (recap.winnerId !== undefined) {
      const winner = recap.players.find((p) => p.id === recap.winnerId)
      if (!winner) continue
      const winnerKey = memberKey(winner.name)
      for (const otherKey of presentKeys) {
        if (otherKey === winnerKey) continue
        if (matrix[winnerKey]?.[otherKey]) matrix[winnerKey][otherKey].wins += 1
      }
    }
  }

  // Flatten unique pairs into a rivalry list (one entry per unordered pair).
  const seen = new Set<string>()
  const rivalries: HeadToHead['rivalries'] = []
  for (const a of pod.members) {
    for (const b of pod.members) {
      if (a.key === b.key) continue
      const pairKey = [a.key, b.key].sort().join('|')
      if (seen.has(pairKey)) continue
      seen.add(pairKey)
      const aWins = matrix[a.key]?.[b.key]?.wins ?? 0
      const bWins = matrix[b.key]?.[a.key]?.wins ?? 0
      const games = matrix[a.key]?.[b.key]?.games ?? 0
      if (games === 0) continue
      rivalries.push({
        aKey: a.key,
        aDisplay: a.displayName,
        bKey: b.key,
        bDisplay: b.displayName,
        aWins,
        bWins,
        games,
      })
    }
  }
  rivalries.sort((a, b) => {
    if (b.games !== a.games) return b.games - a.games
    return Math.abs(b.aWins - b.bWins) - Math.abs(a.aWins - a.bWins)
  })

  return { matrix, rivalries }
}

export type PodSummary = {
  totalGames: number
  totalMinutes: number
  /** Most-recent recap timestamp (ms), or pod.createdAt if none. */
  lastPlayedAt: number
  /** Most-played format ("Commander 40", "Standard 20", \u2026). */
  topFormat?: string
}

export const buildPodSummary = (
  pod: Pod,
  recaps: PodRecapSummary[],
): PodSummary => {
  let totalMinutes = 0
  const formatCounts: Record<string, number> = {}
  let lastPlayedAt = pod.createdAt
  for (const r of recaps) {
    totalMinutes += Math.max(1, Math.round((r.endedAt - r.startedAt) / 60000))
    formatCounts[r.format] = (formatCounts[r.format] ?? 0) + 1
    if (r.endedAt > lastPlayedAt) lastPlayedAt = r.endedAt
  }
  const topFormat =
    Object.entries(formatCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? undefined
  return {
    totalGames: recaps.length,
    totalMinutes,
    lastPlayedAt,
    topFormat,
  }
}
