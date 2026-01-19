import { NextResponse } from 'next/server'
import { deleteSession, getSession, updateSession } from '@/lib/share-store'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession(params.id)
  if (!session) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    state: session.state,
    updatedAt: session.updatedAt,
  })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  if (!body?.state) {
    return NextResponse.json({ error: 'Missing state' }, { status: 400 })
  }

  const updated = await updateSession(params.id, body.state)
  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    updatedAt: updated.updatedAt,
  })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await deleteSession(params.id)
  return NextResponse.json({ ok: true })
}
