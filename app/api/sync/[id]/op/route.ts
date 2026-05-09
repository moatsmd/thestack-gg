import { NextResponse } from 'next/server'
import { appendOp } from '@/lib/sync-store'
import type { SyncOp } from '@/types/sync'

const isString = (v: unknown): v is string =>
  typeof v === 'string' && v.length > 0
const isNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v)

const VALID_OP_TYPES = new Set([
  'life',
  'counter',
  'cmd_from',
  'rename',
  'reset',
  'end_game',
])

const isOp = (v: unknown): v is SyncOp => {
  if (!v || typeof v !== 'object') return false
  const r = v as Record<string, unknown>
  if (typeof r.type !== 'string' || !VALID_OP_TYPES.has(r.type)) return false
  switch (r.type) {
    case 'life':
      return isNumber(r.seatId) && isNumber(r.delta)
    case 'counter':
      return (
        isNumber(r.seatId) &&
        isNumber(r.delta) &&
        typeof r.counter === 'string' &&
        ['energy', 'experience', 'poison', 'mana'].includes(r.counter)
      )
    case 'cmd_from':
      return (
        isNumber(r.seatId) && isNumber(r.sourceId) && isNumber(r.delta)
      )
    case 'rename':
      return isNumber(r.seatId) && typeof r.name === 'string'
    case 'reset':
      return true
    case 'end_game':
      return r.winnerSeatId === undefined || isNumber(r.winnerSeatId)
    default:
      return false
  }
}

/** POST /api/sync/[id]/op — append a single op. */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> } | { params: { id: string } },
) {
  const params =
    'then' in (context.params as Promise<unknown>)
      ? await (context.params as Promise<{ id: string }>)
      : (context.params as { id: string })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Missing body' }, { status: 400 })
  }
  const b = body as Record<string, unknown>

  if (!isString(b.deviceId)) {
    return NextResponse.json({ error: 'Missing deviceId' }, { status: 400 })
  }
  if (!isString(b.opId)) {
    return NextResponse.json({ error: 'Missing opId' }, { status: 400 })
  }
  if (!isOp(b.op)) {
    return NextResponse.json({ error: 'Invalid op' }, { status: 400 })
  }

  const result = await appendOp({
    sessionId: params.id,
    deviceId: b.deviceId,
    opId: b.opId,
    op: b.op,
  })

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 400 },
    )
  }
  return NextResponse.json({
    envelope: result.envelope,
    snapshot: result.snapshot,
  })
}
