import { NextResponse } from 'next/server'
import { getRecap } from '@/lib/recap-store'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const recap = await getRecap(params.id)
  if (!recap) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(recap)
}
