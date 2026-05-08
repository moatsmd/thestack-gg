import { NextResponse } from 'next/server'
import { createPod, getPod, listViewerPods, getPodTtlMs } from '@/lib/pod-store'
import { getRecap } from '@/lib/recap-store'
import type { Pod } from '@/types/pod'

const isString = (v: unknown): v is string => typeof v === 'string' && v.length > 0

/** POST /api/pod  \u2014 create a pod from a recap id. */
export async function POST(request: Request) {
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

  if (!isString(b.recapId)) {
    return NextResponse.json({ error: 'Missing recapId' }, { status: 400 })
  }
  if (b.name !== undefined && typeof b.name !== 'string') {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
  }
  if (b.viewerId !== undefined && typeof b.viewerId !== 'string') {
    return NextResponse.json({ error: 'Invalid viewerId' }, { status: 400 })
  }

  const recap = await getRecap(b.recapId)
  if (!recap) {
    return NextResponse.json({ error: 'Recap not found' }, { status: 404 })
  }

  const name =
    (typeof b.name === 'string' && b.name.trim()) ||
    recap.podName ||
    `Pod of ${recap.players.length}`

  const pod = await createPod({
    name,
    recap,
    ownerViewerId: typeof b.viewerId === 'string' ? b.viewerId : undefined,
  })

  const url = new URL(request.url)
  url.pathname = `/pod/${pod.id}`
  url.search = ''

  return NextResponse.json({
    id: pod.id,
    url: url.toString(),
    expiresInMs: getPodTtlMs(),
    pod,
  })
}

/** GET /api/pod?viewerId=... \u2014 list a viewer's pods (id + name + meta). */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const viewerId = url.searchParams.get('viewerId')
  if (!viewerId) {
    return NextResponse.json({ pods: [] })
  }
  const ids = await listViewerPods(viewerId)
  const pods: Array<Pick<Pod, 'id' | 'name' | 'updatedAt' | 'recapIds'>> = []
  for (const id of ids) {
    const pod = await getPod(id)
    if (!pod) continue
    pods.push({
      id: pod.id,
      name: pod.name,
      updatedAt: pod.updatedAt,
      recapIds: pod.recapIds,
    })
  }
  return NextResponse.json({ pods })
}
