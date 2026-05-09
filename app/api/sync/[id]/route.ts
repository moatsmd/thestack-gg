import { NextResponse } from 'next/server'
import { getSyncSession } from '@/lib/sync-store'

/** GET /api/sync/[id] — full snapshot + seats + meta. Used on join. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> } | { params: { id: string } },
) {
  const params =
    'then' in (context.params as Promise<unknown>)
      ? await (context.params as Promise<{ id: string }>)
      : (context.params as { id: string })

  const session = await getSyncSession(params.id)
  if (!session) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  return NextResponse.json(session)
}
