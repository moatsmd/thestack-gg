import { NextResponse } from 'next/server'
import { getIdByCode, getSyncSession } from '@/lib/sync-store'

/**
 * GET /api/sync/by-code/[code] — resolve a sharable code to a session id.
 * Used by the join flow when the user pastes or scans a code.
 */
export async function GET(
  _request: Request,
  context:
    | { params: Promise<{ code: string }> }
    | { params: { code: string } },
) {
  const params =
    'then' in (context.params as Promise<unknown>)
      ? await (context.params as Promise<{ code: string }>)
      : (context.params as { code: string })

  const id = await getIdByCode(params.code)
  if (!id) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  const session = await getSyncSession(id)
  if (!session) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  return NextResponse.json({ id, ...session })
}
