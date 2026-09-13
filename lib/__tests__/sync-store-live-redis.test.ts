/** @jest-environment node */
import { createClient } from 'redis'
import { appendOp, claimSeat, createSyncSession, getOpsSince, getSyncSession } from '../sync-store'

let mockRedis: ReturnType<typeof createClient>
jest.mock('../redis', () => ({ getRedis: async () => mockRedis }))

// Explicitly opt in. This suite can only contact the isolated local test port,
// never environment-supplied production credentials or the usual Redis port.
const localRedis = process.env.RUN_LOCAL_REDIS_TESTS === '1' ? describe : describe.skip
localRedis('sync store against local Redis 7', () => {
  const created: { id: string; code: string }[] = []
  beforeAll(async () => {
    mockRedis = createClient({ url: 'redis://127.0.0.1:6387/15', socket: { connectTimeout: 2000, reconnectStrategy: false } })
    await mockRedis.connect()
  })
  afterAll(async () => {
    if (!mockRedis?.isOpen) return
    for (const session of created) {
      const keys = ['meta', 'snap', 'seats', 'ops'].map((kind) => `sync:${kind}:${session.id}`)
      keys.push(`sync:code:${session.code}`)
      for await (const key of mockRedis.scanIterator({ MATCH: `sync:receipt:${session.id}:*` })) keys.push(key)
      await mockRedis.del(keys)
    }
    await mockRedis.quit()
  })
  const create = async () => {
    const data = await createSyncSession({
      hostDeviceId: 'local-test-host', gameMode: { name: 'Commander', life: 40 }, customLife: 20, enabledCounters: ['cmd'],
      players: [1, 2, 3, 4, 5, 6].map((id) => ({ id, name: `Player ${id}`, life: 40, cmd: 0, cmdFrom: {}, poison: 0, mana: 0, energy: 0, experience: 0 })),
    })
    created.push(data.session)
    return data.session
  }

  it('preserves all 60 writes from six concurrent devices', async () => {
    const session = await create()
    await Promise.all([1, 2, 3, 4, 5, 6].map(async (seatId) => {
      expect((await claimSeat(session.id, seatId, `device-${seatId}`)).ok).toBe(true)
      for (let tick = 0; tick < 10; tick += 1) {
        const result = await appendOp({ sessionId: session.id, deviceId: `device-${seatId}`, opId: `tick-${tick}`, op: { type: 'life', seatId, delta: -1 } })
        expect(result.ok).toBe(true)
      }
    }))
    const current = await getSyncSession(session.id)
    expect(current?.snapshot.players.map((player) => player.life)).toEqual([30, 30, 30, 30, 30, 30])
    expect(current?.snapshot.seq).toBe(60)
    expect((await getOpsSince(session.id, 0))?.ops.map((op) => op.seq)).toEqual(Array.from({ length: 60 }, (_, i) => i + 1))
  })

  it('awards one seat to exactly one of six simultaneous claimants', async () => {
    const session = await create()
    const claims = await Promise.all([1, 2, 3, 4, 5, 6].map((device) => claimSeat(session.id, 2, `claimant-${device}`)))
    expect(claims.filter((result) => result.ok)).toHaveLength(1)
    expect(claims.filter((result) => !result.ok)).toHaveLength(5)
  })

  it('deduplicates simultaneous retries and retains the receipt after replay history rollover', async () => {
    const session = await create()
    const input = { sessionId: session.id, deviceId: 'local-test-host', opId: 'response-lost', op: { type: 'life' as const, seatId: 1, delta: -3 } }
    const results = await Promise.all(Array.from({ length: 8 }, () => appendOp(input)))
    expect(results.every((result) => result.ok)).toBe(true)
    await mockRedis.set(`sync:ops:${session.id}`, '[]', { KEEPTTL: true })
    expect((await appendOp(input)).ok).toBe(true)
    const recovered = await getOpsSince(session.id, 0)
    expect(recovered?.snapshot?.players[0].life).toBe(37)
    expect(recovered?.seq).toBe(1)
    const receiptKeys: string[] = []
    for await (const key of mockRedis.scanIterator({ MATCH: `sync:receipt:${session.id}:*` })) receiptKeys.push(key)
    expect(receiptKeys).toHaveLength(1)
    const ttl = await mockRedis.pTTL(receiptKeys[0])
    const sessionTtl = await mockRedis.pTTL(`sync:meta:${session.id}`)
    expect(ttl).toBeGreaterThan(86_300_000)
    expect(Math.abs(ttl - sessionTtl)).toBeLessThan(100)
  })
})
