import { NextResponse } from 'next/server'
import { getOpsSince } from '@/lib/sync-store'
import { publicPoll, SYNC_RESPONSE_HEADERS } from '@/lib/sync-public'

export const dynamic = 'force-dynamic'

/**
 * GET /api/sync/[id]/since?seq=N — return all ops with seq > N, plus the
 * current head seq. Clients poll this every ~1.5s.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params

  const url = new URL(request.url)
  const sinceParam = url.searchParams.get('seq') ?? '0'
  const sinceSeq = Number(sinceParam)
  if (!/^\d+$/.test(sinceParam) || !Number.isSafeInteger(sinceSeq) || sinceSeq < 0) {
    return NextResponse.json({ error: 'Invalid seq' }, { status: 400 })
  }

  const result = await getOpsSince(params.id, sinceSeq)
  if (!result) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  return NextResponse.json(publicPoll(result, request.headers.get('X-Sync-Device-Id')), { headers: SYNC_RESPONSE_HEADERS })
}
