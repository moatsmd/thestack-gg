import { NextResponse } from 'next/server'
import { appendOp } from '@/lib/sync-store'
import { isSyncId, parseSyncOp } from '@/lib/sync-validation'
import { readSyncBody } from '@/lib/sync-request'
import { publicEnvelope, SYNC_RESPONSE_HEADERS } from '@/lib/sync-public'

/** POST /api/sync/[id]/op — append a single op. */
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
  if (!isSyncId(b.opId)) {
    return NextResponse.json({ error: 'Missing opId' }, { status: 400 })
  }
  const op = parseSyncOp(b.op)
  if (!op) {
    return NextResponse.json({ error: 'Invalid op' }, { status: 400 })
  }

  const result = await appendOp({
    sessionId: params.id,
    deviceId: b.deviceId,
    opId: b.opId,
    op,
  })

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 400 },
    )
  }
  return NextResponse.json({
    envelope: publicEnvelope(result.envelope, b.deviceId),
    snapshot: result.snapshot,
  }, { headers: SYNC_RESPONSE_HEADERS })
}
