/** @jest-environment node */
import { POST as create } from '../sync/route'
import { POST as append } from '../sync/[id]/op/route'
import { GET as poll } from '../sync/[id]/since/route'
import { __clearSyncStoreForTests, getSyncSession } from '@/lib/sync-store'

const base = () => ({ hostDeviceId: 'host-secret', gameMode: { name: 'Commander', life: 40 }, customLife: 20, enabledCounters: ['cmd'], players: [1, 2].map((id) => ({ id, name: `Player ${id}`, life: 40, cmd: 0, cmdFrom: {}, poison: 0, mana: 0, energy: 0, experience: 0 })) })
const request = (body: unknown) => new Request('http://localhost/api/sync', { method: 'POST', body: JSON.stringify(body) })
beforeEach(() => {
  delete process.env.REDIS_URL; delete process.env.STACK_RECAP_REDIS_URL; delete process.env.stack_recap_REDIS_URL
  __clearSyncStoreForTests()
})

it('rejects duplicate player ids before creating ambiguous seats', async () => {
  const body = base(); body.players[1].id = 1
  expect((await create(request(body))).status).toBe(400)
})

it('rejects nonnumeric commander damage and fractional counters in the initial state', async () => {
  const body = base()
  Object.assign(body.players[0].cmdFrom, { 2: 'seven' })
  expect((await create(request(body))).status).toBe(400)
  body.players[0].cmdFrom = {}; body.players[0].energy = 1.5
  expect((await create(request(body))).status).toBe(400)
})

it('bounds request size even without a content-length header', async () => {
  expect((await create(request({ ...base(), padding: 'x'.repeat(40_000) }))).status).toBe(413)
})

it('rejects fractional deltas, invalid sources and invalid winners without advancing the cursor', async () => {
  const session = await (await create(request(base()))).json()
  for (const op of [
    { type: 'life', seatId: 1, delta: 0.5 },
    { type: 'life', seatId: 1, delta: 1e100 },
    { type: 'cmd_from', seatId: 1, sourceId: 99, delta: 1 },
    { type: 'end_game', winnerSeatId: 99 },
  ]) {
    const response = await append(request({ deviceId: 'host-secret', opId: JSON.stringify(op), op }), { params: Promise.resolve({ id: session.id }) })
    expect(response.status).toBe(400)
  }
  expect((await getSyncSession(session.id))?.snapshot.seq).toBe(0)
})

it('applies name moderation to live renames as well as initial player names', async () => {
  const session = await (await create(request(base()))).json()
  const response = await append(request({ deviceId: 'host-secret', opId: 'rename', op: { type: 'rename', seatId: 1, name: 'NiggerKing' } }), { params: Promise.resolve({ id: session.id }) })
  expect(response.status).toBe(422)
  expect((await getSyncSession(session.id))?.snapshot.players[0].name).toBe('Player 1')
})

it('rejects a malformed polling cursor instead of silently truncating it', async () => {
  const session = await (await create(request(base()))).json()
  for (const seq of ['1.5', '4oops', '9007199254740992']) {
    const response = await poll(new Request(`http://localhost/api/sync/${session.id}/since?seq=${seq}`), { params: Promise.resolve({ id: session.id }) })
    expect(response.status).toBe(400)
  }
})
