import { NextResponse } from 'next/server'
import { getSyncSession } from '@/lib/sync-store'
import { publicSession, SYNC_RESPONSE_HEADERS } from '@/lib/sync-public'

export const dynamic = 'force-dynamic'

/** GET /api/sync/[id] — full snapshot + seats + meta. Used on join. */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params

  const session = await getSyncSession(params.id)
  if (!session) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  return NextResponse.json(publicSession(session, request.headers.get('X-Sync-Device-Id')), { headers: SYNC_RESPONSE_HEADERS })
}
