import { NextResponse } from 'next/server'
import { getOpsSince } from '@/lib/sync-store'

/**
 * GET /api/sync/[id]/since?seq=N — return all ops with seq > N, plus the
 * current head seq. Clients poll this every ~1.5s.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> } | { params: { id: string } },
) {
  const params =
    'then' in (context.params as Promise<unknown>)
      ? await (context.params as Promise<{ id: string }>)
      : (context.params as { id: string })

  const url = new URL(request.url)
  const sinceParam = url.searchParams.get('seq') ?? '0'
  const sinceSeq = Number.parseInt(sinceParam, 10)
  if (!Number.isFinite(sinceSeq) || sinceSeq < 0) {
    return NextResponse.json({ error: 'Invalid seq' }, { status: 400 })
  }

  const result = await getOpsSince(params.id, sinceSeq)
  if (!result) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  return NextResponse.json(result)
}
