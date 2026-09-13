/** @jest-environment node */
import { appendOp, claimSeat, createSyncSession, getOpsSince, getSyncSession, releaseSeat } from '../sync-store'

// A deterministic Redis boundary: concurrent reads see the same pre-write
// state, while each EVAL compares and commits all four keys atomically.
const mockValues = new Map<string, string>()
const mockRedis = {
  get: jest.fn(async (key: string) => mockValues.get(key) ?? null),
  set: jest.fn(async (key: string, value: string) => { mockValues.set(key, value); return 'OK' }),
  mGet: jest.fn(async (keys: string[]) => keys.map((key) => mockValues.get(key) ?? null)),
  eval: jest.fn(async (_script: string, options: { keys: string[]; arguments: string[] }) => {
    const { keys, arguments: args } = options
    const stateKeys = keys.slice(0, 4)
    if (stateKeys.some((key, i) => mockValues.get(key) !== args[i])) return 0
    stateKeys.forEach((key, i) => mockValues.set(key, args[4 + i]))
    if (keys[4]) mockValues.set(keys[4], args[8])
    return 1
  }),
}
jest.mock('../redis', () => ({ getRedis: async () => mockRedis }))

const create = () => createSyncSession({
  hostDeviceId: 'host', gameMode: { name: 'Commander', life: 40 }, customLife: 20, enabledCounters: ['cmd'],
  players: [1, 2, 3, 4].map((id) => ({ id, name: `Player ${id}`, life: 40, cmd: 0, cmdFrom: {}, poison: 0, mana: 0, energy: 0, experience: 0 })),
})
beforeEach(() => { mockValues.clear(); jest.clearAllMocks() })

it('preserves simultaneous edits on different seats with unique consecutive sequences', async () => {
  const { session } = await create()
  const results = await Promise.all([1, 2, 3, 4].map((seatId) => appendOp({
    sessionId: session.id, deviceId: 'host', opId: `op-${seatId}`, op: { type: 'life', seatId, delta: -1 },
  })))
  expect(results.every((result) => result.ok)).toBe(true)
  const current = await getSyncSession(session.id)
  expect(current?.snapshot.players.map((player) => player.life)).toEqual([39, 39, 39, 39])
  expect((await getOpsSince(session.id, 0))?.ops.map((op) => op.seq)).toEqual([1, 2, 3, 4])
})

it('allows only one winner when two devices simultaneously claim a seat', async () => {
  const { session } = await create()
  const claims = await Promise.all(['a', 'b'].map((deviceId) => claimSeat(session.id, 2, deviceId)))
  expect(claims.filter((result) => result.ok)).toHaveLength(1)
  expect(claims.filter((result) => !result.ok)).toHaveLength(1)
})

it('persists renamed seats and returns claims and releases even without new game ops', async () => {
  const { session } = await create()
  await appendOp({ sessionId: session.id, deviceId: 'host', opId: 'rename', op: { type: 'rename', seatId: 2, name: 'Jess' } })
  expect((await getSyncSession(session.id))?.seats[1].name).toBe('Jess')
  await claimSeat(session.id, 2, 'a')
  expect((await getOpsSince(session.id, 1))?.seats[1].ownerDeviceId).toBe('a')
  await releaseSeat(session.id, 2, 'host')
  expect((await getOpsSince(session.id, 1))?.seats[1].ownerDeviceId).toBeNull()
})

it('returns a canonical snapshot when the polling cursor is outside retained history', async () => {
  const { session } = await create()
  await appendOp({ sessionId: session.id, deviceId: 'host', opId: 'life', op: { type: 'life', seatId: 1, delta: -3 } })
  mockValues.set(`sync:ops:${session.id}`, '[]')
  const recovery = await getOpsSince(session.id, 0)
  expect(recovery?.snapshot?.players[0].life).toBe(37)
  expect(recovery?.snapshot?.seq).toBe(1)
  expect(recovery?.ops).toEqual([])
})

it('does not repeat an accepted offline write after its op leaves the polling history', async () => {
  const { session } = await create()
  const input = { sessionId: session.id, deviceId: 'host', opId: 'lost-response', op: { type: 'life' as const, seatId: 1, delta: -3 } }
  await appendOp(input)
  // A busy table has since trimmed this op from its bounded replay log.
  mockValues.set(`sync:ops:${session.id}`, '[]')
  const retry = await appendOp(input)
  expect(retry.ok).toBe(true)
  const current = await getSyncSession(session.id)
  expect(current?.snapshot.players[0].life).toBe(37)
  expect(current?.snapshot.seq).toBe(1)
})
