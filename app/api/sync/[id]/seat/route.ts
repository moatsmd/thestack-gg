import { NextResponse } from 'next/server'
import { claimSeat, releaseSeat } from '@/lib/sync-store'

const isString = (v: unknown): v is string =>
  typeof v === 'string' && v.length > 0
const isNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v)

/** POST /api/sync/[id]/seat — claim a seat for this device. */
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
  if (!isNumber(b.seatId)) {
    return NextResponse.json({ error: 'Missing seatId' }, { status: 400 })
  }

  const result = await claimSeat(params.id, b.seatId, b.deviceId)
  if (!result.ok) {
    const status = result.error === 'not_found' ? 404 : 409
    return NextResponse.json({ error: result.error }, { status })
  }
  return NextResponse.json({ seats: result.seats })
}

/**
 * DELETE /api/sync/[id]/seat — host-only release of a claimed seat.
 * Body: { deviceId, seatId }. The deviceId must be the host's deviceId
 * (i.e. meta.hostDeviceId) or the request is rejected with 403.
 *
 * Used to recover from the iOS Safari ITP eviction case: a returning
 * player's localStorage was purged, so they have a new deviceId and
 * cannot re-claim their welded seat. The host releases it for them.
 */
export async function DELETE(
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
  if (!isNumber(b.seatId)) {
    return NextResponse.json({ error: 'Missing seatId' }, { status: 400 })
  }

  const result = await releaseSeat(params.id, b.seatId, b.deviceId)
  if (!result.ok) {
    const status =
      result.error === 'not_found'
        ? 404
        : result.error === 'host_only'
        ? 403
        : result.error === 'unknown_seat'
        ? 400
        : 409
    return NextResponse.json({ error: result.error }, { status })
  }
  return NextResponse.json({ seats: result.seats })
}
