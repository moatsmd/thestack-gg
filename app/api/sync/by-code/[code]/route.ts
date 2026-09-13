import { NextResponse } from 'next/server'
import { getIdByCode, getSyncSession } from '@/lib/sync-store'
import { publicSession, SYNC_RESPONSE_HEADERS } from '@/lib/sync-public'

export const dynamic = 'force-dynamic'

/**
 * GET /api/sync/by-code/[code] — resolve a sharable code to a session id.
 * Used by the join flow when the user pastes or scans a code.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const params = await context.params

  const id = await getIdByCode(params.code)
  if (!id) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  const session = await getSyncSession(id)
  if (!session) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  return NextResponse.json({ id, ...publicSession(session, request.headers.get('X-Sync-Device-Id')) }, { headers: SYNC_RESPONSE_HEADERS })
}
