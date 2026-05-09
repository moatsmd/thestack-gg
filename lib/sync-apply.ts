/**
 * Pure, in-place mutation of a SyncSnapshot given a SyncOp.
 *
 * Shared between the server-side sync-store (where it applies op envelopes
 * into the canonical snapshot) and the client-side useSync hook (where it
 * applies remote ops returned from /since polling so every device converges
 * on the same state).
 *
 * Authority is enforced on the server before this is called. Here we only
 * concern ourselves with the math.
 */

import type { SyncOp, SyncSeat, SyncSnapshot } from '@/types/sync'

const findPlayer = (snapshot: SyncSnapshot, id: number) =>
  snapshot.players.find((p) => p.id === id)

/**
 * Apply a single op to a snapshot in place. Returns the mutated snapshot
 * for chaining. Unknown seat ids no-op rather than throw — the server
 * has already validated, and a client receiving an op for a seat it
 * doesn't know about (shouldn't happen in PR #21) should not crash.
 *
 * The optional `seats` array is updated for `rename` ops so the lobby's
 * seat name mirrors the player name.
 */
export function applySyncOp(
  snapshot: SyncSnapshot,
  op: SyncOp,
  seats?: SyncSeat[],
): SyncSnapshot {
  switch (op.type) {
    case 'life': {
      const p = findPlayer(snapshot, op.seatId)
      if (!p) return snapshot
      p.life = p.life + op.delta
      return snapshot
    }
    case 'counter': {
      const p = findPlayer(snapshot, op.seatId)
      if (!p) return snapshot
      const cur = p[op.counter]
      p[op.counter] = Math.max(0, cur + op.delta)
      return snapshot
    }
    case 'cmd_from': {
      const p = findPlayer(snapshot, op.seatId)
      if (!p) return snapshot
      p.cmdFrom ??= {}
      const cur = p.cmdFrom[op.sourceId] ?? 0
      p.cmdFrom[op.sourceId] = Math.max(0, cur + op.delta)
      // cmd_from does NOT auto-mutate life — the local tracker keeps
      // commander damage and life independent.
      let max = 0
      for (const v of Object.values(p.cmdFrom)) if (v > max) max = v
      p.cmd = max
      return snapshot
    }
    case 'rename': {
      const p = findPlayer(snapshot, op.seatId)
      if (!p) return snapshot
      const trimmed = op.name.trim().slice(0, 32)
      if (trimmed) {
        p.name = trimmed
        if (seats) {
          const seat = seats.find((s) => s.seatId === op.seatId)
          if (seat) seat.name = trimmed
        }
      }
      return snapshot
    }
    case 'reset': {
      const startLife =
        snapshot.gameMode.name === 'Custom'
          ? snapshot.customLife
          : snapshot.gameMode.life
      for (const p of snapshot.players) {
        p.life = startLife
        p.cmd = 0
        p.cmdFrom = {}
        p.poison = 0
        p.mana = 0
        p.energy = 0
        p.experience = 0
      }
      return snapshot
    }
    case 'end_game': {
      snapshot.endedAt = Date.now()
      snapshot.winnerSeatId = op.winnerSeatId
      return snapshot
    }
  }
}

/**
 * Deep-clone a snapshot so callers can apply ops without sharing references
 * with whatever produced it. Only the fields we mutate are cloned.
 */
export function cloneSnapshot(snapshot: SyncSnapshot): SyncSnapshot {
  return {
    ...snapshot,
    players: snapshot.players.map((p) => ({ ...p, cmdFrom: { ...p.cmdFrom } })),
    enabledCounters: [...snapshot.enabledCounters],
  }
}
