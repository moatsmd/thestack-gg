import { NextResponse } from 'next/server'
import {
  createSyncSession,
  getSyncTtlMs,
  type CreateSyncInput,
} from '@/lib/sync-store'
import { checkNames, type LabeledName } from '@/lib/name-moderation'
import type { SyncCounter, SyncPlayer } from '@/types/sync'
import { isSyncId, isSyncNumber, isSeatId } from '@/lib/sync-validation'
import { readSyncBody } from '@/lib/sync-request'
import { publicSession, SYNC_RESPONSE_HEADERS } from '@/lib/sync-public'

const isString = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0 && v.length <= 80
const isNumber = isSyncNumber

const COUNTERS: SyncCounter[] = ['energy', 'experience', 'poison', 'mana', 'cmd']
const isCounter = (v: unknown): v is SyncCounter =>
  typeof v === 'string' && (COUNTERS as string[]).includes(v)

const isPlayer = (v: unknown): v is SyncPlayer => {
  if (!v || typeof v !== 'object') return false
  const r = v as Record<string, unknown>
  return (
    isSeatId(r.id) &&
    isString(r.name) &&
    isNumber(r.life) &&
    isNumber(r.cmd) && r.cmd >= 0 &&
    isNumber(r.poison) && r.poison >= 0 &&
    isNumber(r.mana) && r.mana >= 0 &&
    isNumber(r.energy) && r.energy >= 0 &&
    isNumber(r.experience) && r.experience >= 0 &&
    typeof r.cmdFrom === 'object' &&
    r.cmdFrom !== null && !Array.isArray(r.cmdFrom) &&
    Object.entries(r.cmdFrom).every(([key, value]) => /^\d+$/.test(key) && isSeatId(Number(key)) && isNumber(value) && value >= 0)
  )
}

/** POST /api/sync — create a sync session for a live tracker game. */
export async function POST(request: Request) {
  const parsed = await readSyncBody(request)
  if (parsed.error) return parsed.error
  const b = parsed.body

  if (!isSyncId(b.hostDeviceId)) {
    return NextResponse.json({ error: 'Missing hostDeviceId' }, { status: 400 })
  }
  if (!Array.isArray(b.players) || b.players.length === 0 || !b.players.every(isPlayer)) {
    return NextResponse.json({ error: 'Invalid players' }, { status: 400 })
  }
  if (b.players.length > 6) {
    return NextResponse.json({ error: 'Too many players' }, { status: 400 })
  }
  const ids = new Set(b.players.map((player: SyncPlayer) => player.id))
  if (ids.size !== b.players.length || b.players.some((player: SyncPlayer) => Object.keys(player.cmdFrom).some((id) => !ids.has(Number(id))))) {
    return NextResponse.json({ error: 'Invalid player references' }, { status: 400 })
  }
  const gm = b.gameMode as Record<string, unknown> | undefined
  if (!gm || !isString(gm.name) || !isNumber(gm.life) || gm.life < 1) {
    return NextResponse.json({ error: 'Invalid gameMode' }, { status: 400 })
  }
  if (!isNumber(b.customLife) || b.customLife < 1) {
    return NextResponse.json({ error: 'Invalid customLife' }, { status: 400 })
  }
  if (!Array.isArray(b.enabledCounters) || b.enabledCounters.length > COUNTERS.length || !b.enabledCounters.every(isCounter)) {
    return NextResponse.json({ error: 'Invalid enabledCounters' }, { status: 400 })
  }

  // Moderate player names — these are sharable via QR/code.
  const players = (b.players as SyncPlayer[]).map((player) => ({
    id: player.id, name: player.name.trim().slice(0, 32), life: player.life,
    cmd: player.cmd, cmdFrom: { ...player.cmdFrom }, poison: player.poison,
    mana: player.mana, energy: player.energy, experience: player.experience,
  }))
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
    ...publicSession(created, b.hostDeviceId),
    expiresInMs: getSyncTtlMs(),
  }, { headers: SYNC_RESPONSE_HEADERS })
}
