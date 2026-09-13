import { NextResponse } from 'next/server'
import { claimSeat, releaseSeat } from '@/lib/sync-store'
import { readSyncBody } from '@/lib/sync-request'
import { isSyncId, isSeatId } from '@/lib/sync-validation'
import { publicSeats, SYNC_RESPONSE_HEADERS } from '@/lib/sync-public'

/** POST /api/sync/[id]/seat — claim a seat for this device. */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params

  const parsed = await readSyncBody(request)
  if (parsed.error) return parsed.error
  const b = parsed.body

  if (!isSyncId(b.deviceId)) {
    return NextResponse.json({ error: 'Missing deviceId' }, { status: 400 })
  }
  if (!isSeatId(b.seatId)) {
    return NextResponse.json({ error: 'Missing seatId' }, { status: 400 })
  }

  const result = await claimSeat(params.id, b.seatId, b.deviceId)
  if (!result.ok) {
    const status = result.error === 'not_found' ? 404 : result.error === 'sync_busy' ? 503 : 409
    return NextResponse.json({ error: result.error }, { status })
  }
  return NextResponse.json({ seats: publicSeats(result.seats, b.deviceId) }, { headers: SYNC_RESPONSE_HEADERS })
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
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params

  const parsed = await readSyncBody(request)
  if (parsed.error) return parsed.error
  const b = parsed.body

  if (!isSyncId(b.deviceId)) {
    return NextResponse.json({ error: 'Missing deviceId' }, { status: 400 })
  }
  if (!isSeatId(b.seatId)) {
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
        : result.error === 'sync_busy'
        ? 503
        : 409
    return NextResponse.json({ error: result.error }, { status })
  }
  return NextResponse.json({ seats: publicSeats(result.seats, b.deviceId) }, { headers: SYNC_RESPONSE_HEADERS })
}
