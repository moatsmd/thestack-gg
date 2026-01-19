import { NextResponse } from 'next/server'
import { createSession, getSessionTtlMs } from '@/lib/share-store'

export async function POST(request: Request) {
  const body = await request.json()
  if (!body?.state) {
    return NextResponse.json({ error: 'Missing state' }, { status: 400 })
  }

  const session = await createSession(body.state)
  const url = new URL(request.url)
  url.pathname = `/share/${session.id}`

  return NextResponse.json({
    id: session.id,
    shareUrl: url.toString(),
    expiresInMs: getSessionTtlMs(),
    updatedAt: session.updatedAt,
  })
}
