import {
  createSyncSession,
  getSyncSession,
  getOpsSince,
  appendOp,
  claimSeat,
  getIdByCode,
  __clearSyncStoreForTests,
} from '../sync-store'
import type { SyncPlayer } from '@/types/sync'

beforeEach(() => {
  delete process.env.REDIS_URL
  delete process.env.STACK_RECAP_REDIS_URL
  delete process.env.stack_recap_REDIS_URL
  __clearSyncStoreForTests()
})

const samplePlayers = (n = 4): SyncPlayer[] =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `Player ${i + 1}`,
    life: 40,
    cmd: 0,
    cmdFrom: {},
    poison: 0,
    mana: 0,
    energy: 0,
    experience: 0,
  }))

const baseInput = (hostDeviceId = 'host-A') => ({
  hostDeviceId,
  players: samplePlayers(),
  gameMode: { name: 'Commander 40', life: 40 },
  customLife: 20,
  enabledCounters: ['cmd', 'poison'] as const,
})

describe('sync-store', () => {
  describe('create', () => {
    it('assigns a 12-char id and 6-char code', async () => {
      const r = await createSyncSession({ ...baseInput(), enabledCounters: ['cmd'] })
      expect(r.session.id).toMatch(/^[a-f0-9]{12}$/)
      expect(r.session.code).toMatch(/^[A-Z2-9]{6}$/)
      expect(r.snapshot.seq).toBe(0)
      expect(r.snapshot.players).toHaveLength(4)
      expect(r.seats).toHaveLength(4)
      expect(r.seats.every((s) => s.ownerDeviceId === null)).toBe(true)
    })

    it('round-trips through getSyncSession + by-code lookup', async () => {
      const r = await createSyncSession({ ...baseInput(), enabledCounters: ['cmd'] })
      const got = await getSyncSession(r.session.id)
      expect(got?.session.id).toBe(r.session.id)
      const idByCode = await getIdByCode(r.session.code)
      expect(idByCode).toBe(r.session.id)
    })

    it('normalizes code lookup (case + dashes)', async () => {
      const r = await createSyncSession({ ...baseInput(), enabledCounters: ['cmd'] })
      const formatted = `${r.session.code.slice(0, 3)}-${r.session.code.slice(3)}`
      const id = await getIdByCode(formatted.toLowerCase())
      expect(id).toBe(r.session.id)
    })
  })

  describe('claimSeat', () => {
    it('lets a device claim an unclaimed seat', async () => {
      const r = await createSyncSession({ ...baseInput(), enabledCounters: ['cmd'] })
      const result = await claimSeat(r.session.id, 2, 'device-B')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.seats.find((s) => s.seatId === 2)?.ownerDeviceId).toBe('device-B')
      }
    })

    it('rejects claiming a seat owned by another device', async () => {
      const r = await createSyncSession({ ...baseInput(), enabledCounters: ['cmd'] })
      await claimSeat(r.session.id, 2, 'device-B')
      const result = await claimSeat(r.session.id, 2, 'device-C')
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error).toBe('seat_taken')
    })

    it('lets a device move from one seat to another (releases prior)', async () => {
      const r = await createSyncSession({ ...baseInput(), enabledCounters: ['cmd'] })
      await claimSeat(r.session.id, 2, 'device-B')
      const result = await claimSeat(r.session.id, 3, 'device-B')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.seats.find((s) => s.seatId === 2)?.ownerDeviceId).toBeNull()
        expect(result.seats.find((s) => s.seatId === 3)?.ownerDeviceId).toBe('device-B')
      }
    })
  })

  describe('appendOp — life', () => {
    it('host can mutate any unclaimed seat', async () => {
      const r = await createSyncSession({ ...baseInput(), enabledCounters: ['cmd'] })
      const result = await appendOp({
        sessionId: r.session.id,
        deviceId: 'host-A',
        opId: 'host-A:1',
        op: { type: 'life', seatId: 2, delta: -5 },
      })
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.snapshot.players.find((p) => p.id === 2)?.life).toBe(35)
        expect(result.snapshot.seq).toBe(1)
      }
    })

    it('rejects life op on seat owned by another device', async () => {
      const r = await createSyncSession({ ...baseInput(), enabledCounters: ['cmd'] })
      await claimSeat(r.session.id, 2, 'device-B')
      const result = await appendOp({
        sessionId: r.session.id,
        deviceId: 'host-A',
        opId: 'host-A:2',
        op: { type: 'life', seatId: 2, delta: -1 },
      })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error).toBe('not_seat_owner')
    })

    it('owner can mutate own seat', async () => {
      const r = await createSyncSession({ ...baseInput(), enabledCounters: ['cmd'] })
      await claimSeat(r.session.id, 2, 'device-B')
      const result = await appendOp({
        sessionId: r.session.id,
        deviceId: 'device-B',
        opId: 'device-B:1',
        op: { type: 'life', seatId: 2, delta: -3 },
      })
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.snapshot.players.find((p) => p.id === 2)?.life).toBe(37)
      }
    })

    it('idempotent on duplicate opId', async () => {
      const r = await createSyncSession({ ...baseInput(), enabledCounters: ['cmd'] })
      await appendOp({
        sessionId: r.session.id,
        deviceId: 'host-A',
        opId: 'host-A:1',
        op: { type: 'life', seatId: 1, delta: -1 },
      })
      const r2 = await appendOp({
        sessionId: r.session.id,
        deviceId: 'host-A',
        opId: 'host-A:1',
        op: { type: 'life', seatId: 1, delta: -1 },
      })
      expect(r2.ok).toBe(true)
      // seq should not advance on the duplicate
      const post = await getSyncSession(r.session.id)
      expect(post?.snapshot.seq).toBe(1)
      expect(post?.snapshot.players.find((p) => p.id === 1)?.life).toBe(39)
    })
  })

  describe('appendOp — cmd_from', () => {
    it('cmd_from updates per-source map and recomputes max, leaves life alone', async () => {
      const r = await createSyncSession({ ...baseInput(), enabledCounters: ['cmd'] })
      const result = await appendOp({
        sessionId: r.session.id,
        deviceId: 'host-A',
        opId: 'host-A:1',
        op: { type: 'cmd_from', seatId: 2, sourceId: 3, delta: 7 },
      })
      expect(result.ok).toBe(true)
      if (result.ok) {
        const p = result.snapshot.players.find((x) => x.id === 2)!
        expect(p.cmdFrom?.[3]).toBe(7)
        // CMD damage and life are tracked independently in the local tracker
        // and we mirror that here — life is not auto-mutated.
        expect(p.life).toBe(40)
        expect(p.cmd).toBe(7)
      }
    })

    it('lethal at 21 from a single source', async () => {
      const r = await createSyncSession({ ...baseInput(), enabledCounters: ['cmd'] })
      await appendOp({
        sessionId: r.session.id,
        deviceId: 'host-A',
        opId: 'host-A:1',
        op: { type: 'cmd_from', seatId: 2, sourceId: 3, delta: 21 },
      })
      const post = await getSyncSession(r.session.id)
      const p = post?.snapshot.players.find((x) => x.id === 2)!
      expect(p.cmd).toBe(21)
      expect(p.cmdFrom?.[3]).toBe(21)
    })
  })

  describe('appendOp — host-only', () => {
    it('reset rejects non-host', async () => {
      const r = await createSyncSession({ ...baseInput(), enabledCounters: ['cmd'] })
      await claimSeat(r.session.id, 2, 'device-B')
      const result = await appendOp({
        sessionId: r.session.id,
        deviceId: 'device-B',
        opId: 'device-B:1',
        op: { type: 'reset' },
      })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error).toBe('host_only')
    })

    it('reset zeros counters and restores starting life', async () => {
      const r = await createSyncSession({ ...baseInput(), enabledCounters: ['cmd'] })
      await appendOp({
        sessionId: r.session.id,
        deviceId: 'host-A',
        opId: 'host-A:1',
        op: { type: 'life', seatId: 1, delta: -10 },
      })
      await appendOp({
        sessionId: r.session.id,
        deviceId: 'host-A',
        opId: 'host-A:2',
        op: { type: 'reset' },
      })
      const post = await getSyncSession(r.session.id)
      expect(post?.snapshot.players.every((p) => p.life === 40)).toBe(true)
    })

    it('end_game freezes further writes', async () => {
      const r = await createSyncSession({ ...baseInput(), enabledCounters: ['cmd'] })
      await appendOp({
        sessionId: r.session.id,
        deviceId: 'host-A',
        opId: 'host-A:1',
        op: { type: 'end_game', winnerSeatId: 1 },
      })
      const result = await appendOp({
        sessionId: r.session.id,
        deviceId: 'host-A',
        opId: 'host-A:2',
        op: { type: 'life', seatId: 1, delta: -1 },
      })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error).toBe('game_ended')
    })
  })

  describe('rename', () => {
    it('renames own seat (trims and caps at 32 chars)', async () => {
      const r = await createSyncSession({ ...baseInput(), enabledCounters: ['cmd'] })
      await claimSeat(r.session.id, 2, 'device-B')
      const result = await appendOp({
        sessionId: r.session.id,
        deviceId: 'device-B',
        opId: 'device-B:1',
        op: { type: 'rename', seatId: 2, name: '   Jess   ' },
      })
      expect(result.ok).toBe(true)
      if (result.ok) {
        const p = result.snapshot.players.find((x) => x.id === 2)!
        expect(p.name).toBe('Jess')
      }
    })

    it('rejects renaming someone else\u2019s seat', async () => {
      const r = await createSyncSession({ ...baseInput(), enabledCounters: ['cmd'] })
      await claimSeat(r.session.id, 2, 'device-B')
      const result = await appendOp({
        sessionId: r.session.id,
        deviceId: 'device-C',
        opId: 'device-C:1',
        op: { type: 'rename', seatId: 2, name: 'Hacker' },
      })
      expect(result.ok).toBe(false)
    })
  })

  describe('getOpsSince', () => {
    it('returns only ops with seq > sinceSeq', async () => {
      const r = await createSyncSession({ ...baseInput(), enabledCounters: ['cmd'] })
      for (let i = 0; i < 5; i++) {
        await appendOp({
          sessionId: r.session.id,
          deviceId: 'host-A',
          opId: `host-A:${i}`,
          op: { type: 'life', seatId: 1, delta: -1 },
        })
      }
      const sinceTwo = await getOpsSince(r.session.id, 2)
      expect(sinceTwo?.ops).toHaveLength(3)
      expect(sinceTwo?.ops[0].seq).toBe(3)
      expect(sinceTwo?.seq).toBe(5)

      const sinceCurrent = await getOpsSince(r.session.id, 5)
      expect(sinceCurrent?.ops).toHaveLength(0)
    })
  })
})
