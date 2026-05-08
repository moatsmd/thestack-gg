import { NextResponse } from 'next/server'
import { createRecap, getRecapTtlMs } from '@/lib/recap-store'
import { checkNames, type LabeledName } from '@/lib/name-moderation'
import type { GameEvent, RecapPlayer } from '@/types/replay'

const isString = (v: unknown): v is string => typeof v === 'string' && v.length > 0
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

const isRecapPlayer = (v: unknown): v is RecapPlayer => {
  if (!v || typeof v !== 'object') return false
  const r = v as Record<string, unknown>
  if (!isNumber(r.id)) return false
  if (!isString(r.name)) return false
  if (r.commander !== undefined && typeof r.commander !== 'string') return false
  return true
}

const VALID_EVENT_TYPES = new Set([
  'game_start',
  'life_change',
  'poison_change',
  'commander_damage',
  'game_end',
])

const isGameEvent = (v: unknown): v is GameEvent => {
  if (!v || typeof v !== 'object') return false
  const r = v as Record<string, unknown>
  if (typeof r.type !== 'string' || !VALID_EVENT_TYPES.has(r.type)) return false
  if (!isNumber(r.seq)) return false
  if (!isNumber(r.timestamp)) return false
  return true
}

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

  if (!isString(b.format)) {
    return NextResponse.json({ error: 'Missing format' }, { status: 400 })
  }
  if (!isNumber(b.startingLife)) {
    return NextResponse.json({ error: 'Missing startingLife' }, { status: 400 })
  }
  if (!Array.isArray(b.players) || b.players.length === 0 || !b.players.every(isRecapPlayer)) {
    return NextResponse.json({ error: 'Invalid players' }, { status: 400 })
  }
  if (!Array.isArray(b.events) || b.events.length === 0 || !b.events.every(isGameEvent)) {
    return NextResponse.json({ error: 'Invalid events' }, { status: 400 })
  }
  if (b.podName !== undefined && typeof b.podName !== 'string') {
    return NextResponse.json({ error: 'Invalid podName' }, { status: 400 })
  }
  if (b.winnerId !== undefined && !isNumber(b.winnerId)) {
    return NextResponse.json({ error: 'Invalid winnerId' }, { status: 400 })
  }

  // Cap event log size to a sane upper bound to prevent abuse.
  const events = b.events as GameEvent[]
  if (events.length > 5000) {
    return NextResponse.json({ error: 'Too many events' }, { status: 413 })
  }

  // Reject pod / player / commander names that contain slurs or hard
  // offensive content. Pages are public-by-link, so this runs before any
  // recap is persisted.
  const players = b.players as RecapPlayer[]
  const moderation: LabeledName[] = [
    { label: 'Pod name', value: b.podName as string | undefined },
    ...players.flatMap((p): LabeledName[] => [
      { label: `Player "${p.name}"`, value: p.name },
      { label: `Commander for ${p.name}`, value: p.commander },
    ]),
  ]
  const moderationResult = checkNames(moderation)
  if (!moderationResult.ok) {
    return NextResponse.json(
      { error: moderationResult.error, field: moderationResult.field },
      { status: 422 },
    )
  }

  const recap = await createRecap({
    podName: b.podName as string | undefined,
    players: b.players as RecapPlayer[],
    format: b.format,
    startingLife: b.startingLife,
    winnerId: b.winnerId as number | undefined,
    events,
  })

  const url = new URL(request.url)
  url.pathname = `/recap/${recap.id}`
  url.search = ''

  return NextResponse.json({
    id: recap.id,
    url: url.toString(),
    expiresInMs: getRecapTtlMs(),
    createdAt: recap.createdAt,
  })
}
