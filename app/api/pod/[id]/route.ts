import { NextResponse } from 'next/server'
import {
  attachRecapToPod,
  getPod,
  recapToSummary,
} from '@/lib/pod-store'
import { getRecap } from '@/lib/recap-store'
import { buildHeadline } from '@/lib/recap-analysis'
import type { PodWithRecaps } from '@/types/pod'

/** GET /api/pod/[id]  \u2014 pod doc + linked recap summaries. */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const pod = await getPod(params.id)
  if (!pod) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const recaps = []
  for (const rid of pod.recapIds) {
    const recap = await getRecap(rid)
    if (!recap) continue // recap may have expired before the pod did
    recaps.push(recapToSummary(recap, buildHeadline(recap)))
  }
  // Newest first \u2014 the pod page reads top-down.
  recaps.sort((a, b) => b.endedAt - a.endedAt)
  const payload: PodWithRecaps = { pod, recaps }
  return NextResponse.json(payload)
}

/** PATCH /api/pod/[id]  \u2014 attach a recap. */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
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
  if (typeof b.recapId !== 'string' || !b.recapId) {
    return NextResponse.json({ error: 'Missing recapId' }, { status: 400 })
  }
  const recap = await getRecap(b.recapId)
  if (!recap) {
    return NextResponse.json({ error: 'Recap not found' }, { status: 404 })
  }
  const updated = await attachRecapToPod(params.id, recap)
  if (!updated) {
    return NextResponse.json({ error: 'Pod not found' }, { status: 404 })
  }
  return NextResponse.json({ pod: updated })
}
