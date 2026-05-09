import { NextResponse } from 'next/server'
import {
  createSyncSession,
  getSyncTtlMs,
  type CreateSyncInput,
} from '@/lib/sync-store'
import { checkNames, type LabeledName } from '@/lib/name-moderation'
import type { SyncCounter, SyncPlayer } from '@/types/sync'

const isString = (v: unknown): v is string =>
  typeof v === 'string' && v.length > 0
const isNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v)

const COUNTERS: SyncCounter[] = ['energy', 'experience', 'poison', 'mana', 'cmd']
const isCounter = (v: unknown): v is SyncCounter =>
  typeof v === 'string' && (COUNTERS as string[]).includes(v)

const isPlayer = (v: unknown): v is SyncPlayer => {
  if (!v || typeof v !== 'object') return false
  const r = v as Record<string, unknown>
  return (
    isNumber(r.id) &&
    isString(r.name) &&
    isNumber(r.life) &&
    isNumber(r.cmd) &&
    isNumber(r.poison) &&
    isNumber(r.mana) &&
    isNumber(r.energy) &&
    isNumber(r.experience) &&
    typeof r.cmdFrom === 'object' &&
    r.cmdFrom !== null
  )
}

/** POST /api/sync — create a sync session for a live tracker game. */
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

  if (!isString(b.hostDeviceId)) {
    return NextResponse.json({ error: 'Missing hostDeviceId' }, { status: 400 })
  }
  if (!Array.isArray(b.players) || b.players.length === 0 || !b.players.every(isPlayer)) {
    return NextResponse.json({ error: 'Invalid players' }, { status: 400 })
  }
  if (b.players.length > 6) {
    return NextResponse.json({ error: 'Too many players' }, { status: 400 })
  }
  const gm = b.gameMode as Record<string, unknown> | undefined
  if (!gm || !isString(gm.name) || !isNumber(gm.life)) {
    return NextResponse.json({ error: 'Invalid gameMode' }, { status: 400 })
  }
  if (!isNumber(b.customLife)) {
    return NextResponse.json({ error: 'Invalid customLife' }, { status: 400 })
  }
  if (!Array.isArray(b.enabledCounters) || !b.enabledCounters.every(isCounter)) {
    return NextResponse.json({ error: 'Invalid enabledCounters' }, { status: 400 })
  }

  // Moderate player names — these are sharable via QR/code.
  const players = b.players as SyncPlayer[]
  const labels: LabeledName[] = players.map((p) => ({
    label: `Player "${p.name}"`,
    value: p.name,
  }))
  const mod = checkNames(labels)
  if (!mod.ok) {
    return NextResponse.json(
      { error: mod.error, field: mod.field },
      { status: 422 },
    )
  }

  const input: CreateSyncInput = {
    hostDeviceId: b.hostDeviceId,
    players,
    gameMode: { name: gm.name as string, life: gm.life as number },
    customLife: b.customLife as number,
    enabledCounters: b.enabledCounters as SyncCounter[],
  }
  const created = await createSyncSession(input)

  const url = new URL(request.url)
  url.pathname = `/tracker`
  url.search = `?join=${created.session.code}`

  return NextResponse.json({
    id: created.session.id,
    code: created.session.code,
    joinUrl: url.toString(),
    session: created.session,
    snapshot: created.snapshot,
    seats: created.seats,
    expiresInMs: getSyncTtlMs(),
  })
}
