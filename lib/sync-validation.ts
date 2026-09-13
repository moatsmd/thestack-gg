import type { SyncOp } from '@/types/sync'

export const isSyncId = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= 256

export const isSyncNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && Math.abs(value) <= 1_000_000_000

export const isSeatId = (value: unknown): value is number =>
  isSyncNumber(value) && value > 0

/** Select only supported fields so extra request data never enters the op log. */
export function parseSyncOp(value: unknown): SyncOp | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const op = value as Record<string, unknown>
  const delta = isSyncNumber(op.delta) && Math.abs(op.delta) <= 1_000_000 ? op.delta : null
  switch (op.type) {
    case 'life':
      return isSeatId(op.seatId) && delta !== null ? { type: 'life', seatId: op.seatId, delta } : null
    case 'counter':
      return isSeatId(op.seatId) && delta !== null && ['energy', 'experience', 'poison', 'mana'].includes(op.counter as string)
        ? { type: 'counter', seatId: op.seatId, counter: op.counter as 'energy' | 'experience' | 'poison' | 'mana', delta } : null
    case 'cmd_from':
      return isSeatId(op.seatId) && isSeatId(op.sourceId) && delta !== null
        ? { type: 'cmd_from', seatId: op.seatId, sourceId: op.sourceId, delta } : null
    case 'rename':
      return isSeatId(op.seatId) && typeof op.name === 'string' && op.name.trim().length > 0 && op.name.length <= 256
        ? { type: 'rename', seatId: op.seatId, name: op.name.trim().slice(0, 32) } : null
    case 'reset':
      return { type: 'reset' }
    case 'end_game':
      return op.winnerSeatId === undefined ? { type: 'end_game' }
        : isSeatId(op.winnerSeatId) ? { type: 'end_game', winnerSeatId: op.winnerSeatId } : null
    default:
      return null
  }
}
