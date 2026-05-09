/**
 * useSync hook — write-path tests.
 *
 * Covers:
 *   - createSession POSTs to /api/sync and stores the resulting session.
 *   - emit() queues an op and POSTs to /api/sync/{id}/op with the deviceId
 *     and a unique opId.
 *   - opId monotonically increments per device, providing dedup.
 *   - Network failure schedules an exponential-backoff retry.
 *   - 403/400 server rejection drops the op and continues.
 *   - 409 (game_ended) clears the queue and sets status='ended'.
 *   - Authority: emit() is a no-op when no session is active.
 */

import { act, renderHook, waitFor } from '@testing-library/react'
import { useSync } from '../use-sync'
import { __resetDeviceIdForTests } from '../device-id'
import type { SyncOp } from '@/types/sync'

const TEST_DEVICE_ID = 'test-device-aaaaaaaa'

let fetchMock: jest.Mock
let originalFetch: typeof globalThis.fetch | undefined

/**
 * Routed fetch mock. Tests register per-route handler queues via
 * `whenCreate(...)`, `whenOp(...)`, or `whenSince(...)`. Each queue is
 * consumed in order; once empty, a sensible default is used so the 1.5s
 * polling loop doesn't disrupt assertions on write-path counts.
 */
type Resp = Response | Promise<Response> | (() => Response | Promise<Response>)
let createQueue: Resp[] = []
let opQueue: Resp[] = []
let sinceQueue: Resp[] = []
let byCodeQueue: Resp[] = []
let seatQueue: Resp[] = []

const toResponse = async (r: Resp): Promise<Response> => {
  const v = typeof r === 'function' ? r() : r
  return v instanceof Promise ? v : Promise.resolve(v)
}

async function routedFetch(url: string, init?: RequestInit): Promise<Response> {
  if (typeof url !== 'string') url = String(url)
  const method = (init?.method ?? 'GET').toUpperCase()

  if (url === '/api/sync' && method === 'POST') {
    if (createQueue.length > 0) return toResponse(createQueue.shift()!)
    return { ok: false, status: 500, json: async () => ({}) } as unknown as Response
  }
  if (url.includes('/op') && method === 'POST') {
    if (opQueue.length > 0) return toResponse(opQueue.shift()!)
    return { ok: true, status: 200, json: async () => ({ envelope: { seq: 0 } }) } as unknown as Response
  }
  if (url.includes('/since')) {
    if (sinceQueue.length > 0) return toResponse(sinceQueue.shift()!)
    return { ok: true, status: 200, json: async () => ({ ops: [], seq: 0 }) } as unknown as Response
  }
  if (url.includes('/api/sync/by-code/')) {
    if (byCodeQueue.length > 0) return toResponse(byCodeQueue.shift()!)
    return { ok: false, status: 404, json: async () => ({}) } as unknown as Response
  }
  if (url.includes('/seat') && method === 'POST') {
    if (seatQueue.length > 0) return toResponse(seatQueue.shift()!)
    return { ok: true, status: 200, json: async () => ({ seats: [] }) } as unknown as Response
  }
  return { ok: true, status: 200, json: async () => ({}) } as unknown as Response
}

const whenCreate = (...rs: Resp[]) => createQueue.push(...rs)
const whenOp = (...rs: Resp[]) => opQueue.push(...rs)
const whenSince = (...rs: Resp[]) => sinceQueue.push(...rs)
const whenByCode = (...rs: Resp[]) => byCodeQueue.push(...rs)
const whenSeat = (...rs: Resp[]) => seatQueue.push(...rs)

beforeEach(() => {
  // Pin a deterministic deviceId in localStorage so opId/seat checks are
  // predictable across tests. Clear first, then plant our test id.
  __resetDeviceIdForTests()
  window.localStorage.clear()
  window.localStorage.setItem('thestack:device-id', TEST_DEVICE_ID)
  createQueue = []
  opQueue = []
  sinceQueue = []
  byCodeQueue = []
  seatQueue = []
  // jsdom does not expose `fetch` by default; install our own mock.
  originalFetch = (globalThis as { fetch?: typeof fetch }).fetch
  fetchMock = jest.fn(routedFetch as unknown as (...args: unknown[]) => unknown)
  ;(globalThis as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
  if (originalFetch) {
    ;(globalThis as { fetch: typeof fetch }).fetch = originalFetch
  } else {
    delete (globalThis as { fetch?: typeof fetch }).fetch
  }
})

const ok = (body: unknown, status = 200): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as unknown as Response

/** Count fetch calls, ignoring the periodic `/since` poll. */
const writeCalls = () =>
  fetchMock.mock.calls.filter((c) => !String(c[0]).includes('/since'))

function makeCreateResponse() {
  return {
    id: 'sess_abc',
    code: 'ABC123',
    joinUrl: 'https://thestack.gg/tracker?join=ABC123',
    session: {
      id: 'sess_abc',
      code: 'ABC123',
      hostDeviceId: TEST_DEVICE_ID,
      createdAt: 1,
      seq: 0,
    },
    snapshot: {
      seq: 0,
      players: [],
      gameMode: { name: 'Commander', life: 40 },
      customLife: 20,
      enabledCounters: ['cmd', 'poison', 'mana'] as const,
    },
    seats: [
      { seatId: 1, ownerDeviceId: TEST_DEVICE_ID, name: 'P1' },
      { seatId: 2, ownerDeviceId: null, name: 'P2' },
    ],
    expiresInMs: 86_400_000,
  }
}

const sampleInput = () => ({
  players: [
    { id: 1, name: 'P1', life: 40, cmd: 0, cmdFrom: {}, poison: 0, mana: 0, energy: 0, experience: 0 },
    { id: 2, name: 'P2', life: 40, cmd: 0, cmdFrom: {}, poison: 0, mana: 0, energy: 0, experience: 0 },
  ],
  gameMode: { name: 'Commander', life: 40 },
  customLife: 20,
  enabledCounters: ['cmd', 'poison', 'mana'] as ReturnType<typeof Array.of>,
})

describe('useSync', () => {
  it('resolves deviceId from localStorage on mount', async () => {
    const { result } = renderHook(() => useSync())
    await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))
    expect(result.current.status).toBe('idle')
    expect(result.current.session).toBeNull()
  })

  it('createSession POSTs to /api/sync and stores session', async () => {
    const created = makeCreateResponse()
    whenCreate(ok(created))

    const { result } = renderHook(() => useSync())
    await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))

    await act(async () => {
      await result.current.createSession({
        players: sampleInput().players,
        gameMode: sampleInput().gameMode,
        customLife: 20,
        enabledCounters: ['cmd', 'poison', 'mana'],
      })
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/sync',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    )
    expect(body.hostDeviceId).toBe(TEST_DEVICE_ID)
    expect(body.players).toHaveLength(2)

    expect(result.current.status).toBe('active')
    expect(result.current.session?.id).toBe('sess_abc')
    expect(result.current.session?.code).toBe('ABC123')
    expect(result.current.joinUrl).toBe(
      'https://thestack.gg/tracker?join=ABC123',
    )
    expect(result.current.isHost).toBe(true)
  })

  it('emit() is a no-op when no session is active', async () => {
    const { result } = renderHook(() => useSync())
    await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))

    act(() => {
      result.current.emit({ type: 'life', seatId: 1, delta: -1 } as SyncOp)
    })

    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.current.pendingCount).toBe(0)
  })

  it('emit() POSTs an op with deviceId + opId and clears pendingCount on success', async () => {
    whenCreate(ok(makeCreateResponse()))
    whenOp(ok({ envelope: { seq: 1 } }))

    const { result } = renderHook(() => useSync())
    await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))
    await act(async () => {
      await result.current.createSession({
        players: sampleInput().players,
        gameMode: sampleInput().gameMode,
        customLife: 20,
        enabledCounters: ['cmd', 'poison', 'mana'],
      })
    })

    await act(async () => {
      result.current.emit({ type: 'life', seatId: 1, delta: -2 } as SyncOp)
      // Drain runs synchronously up to the fetch promise; let microtasks
      // settle to advance the queue.
      await Promise.resolve()
      await Promise.resolve()
    })

    await waitFor(() => expect(result.current.pendingCount).toBe(0))

    expect(writeCalls()).toHaveLength(2)
    const opCall = writeCalls()[1]
    expect(opCall[0]).toBe('/api/sync/sess_abc/op')
    const body = JSON.parse((opCall[1] as RequestInit).body as string)
    expect(body.deviceId).toBe(TEST_DEVICE_ID)
    expect(body.opId).toBe(`${TEST_DEVICE_ID}:0`)
    expect(body.op).toEqual({ type: 'life', seatId: 1, delta: -2 })
  })

  it('emit() generates monotonically increasing opIds for dedup', async () => {
    whenCreate(ok(makeCreateResponse()))
    whenOp(
      ok({ envelope: { seq: 1 } }),
      ok({ envelope: { seq: 2 } }),
      ok({ envelope: { seq: 3 } }),
    )

    const { result } = renderHook(() => useSync())
    await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))
    await act(async () => {
      await result.current.createSession({
        players: sampleInput().players,
        gameMode: sampleInput().gameMode,
        customLife: 20,
        enabledCounters: ['cmd', 'poison', 'mana'],
      })
    })

    await act(async () => {
      result.current.emit({ type: 'life', seatId: 1, delta: -1 } as SyncOp)
      result.current.emit({ type: 'life', seatId: 1, delta: -1 } as SyncOp)
      result.current.emit({ type: 'life', seatId: 1, delta: -1 } as SyncOp)
      // Let the serial queue drain.
      for (let i = 0; i < 10; i++) await Promise.resolve()
    })

    await waitFor(() => expect(result.current.pendingCount).toBe(0))

    const opIds = writeCalls()
      .slice(1)
      .map((c) => JSON.parse((c[1] as RequestInit).body as string).opId)
    expect(opIds).toEqual([
      `${TEST_DEVICE_ID}:0`,
      `${TEST_DEVICE_ID}:1`,
      `${TEST_DEVICE_ID}:2`,
    ])
  })

  it('schedules an exponential-backoff retry on network error', async () => {
    whenCreate(ok(makeCreateResponse()))
    whenOp(
      () => Promise.reject(new Error('network down')),
      ok({ envelope: { seq: 1 } }),
    )

    const { result } = renderHook(() => useSync())
    await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))
    await act(async () => {
      await result.current.createSession({
        players: sampleInput().players,
        gameMode: sampleInput().gameMode,
        customLife: 20,
        enabledCounters: ['cmd', 'poison', 'mana'],
      })
    })

    await act(async () => {
      result.current.emit({ type: 'life', seatId: 1, delta: -1 } as SyncOp)
      for (let i = 0; i < 5; i++) await Promise.resolve()
    })

    await waitFor(() => expect(result.current.status).toBe('offline'))
    expect(result.current.pendingCount).toBe(1)

    // Advance past the first backoff (500ms).
    await act(async () => {
      jest.advanceTimersByTime(600)
      for (let i = 0; i < 5; i++) await Promise.resolve()
    })

    await waitFor(() => expect(result.current.pendingCount).toBe(0))
    expect(result.current.status).toBe('active')
    expect(writeCalls()).toHaveLength(3) // create + failed op + retry
  })

  it('drops op on 403/400 rejection without retrying', async () => {
    whenCreate(ok(makeCreateResponse()))
    whenOp(
      ok({ error: 'forbidden' }, 403),
      ok({ envelope: { seq: 1 } }),
    )

    const { result } = renderHook(() => useSync())
    await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))
    await act(async () => {
      await result.current.createSession({
        players: sampleInput().players,
        gameMode: sampleInput().gameMode,
        customLife: 20,
        enabledCounters: ['cmd', 'poison', 'mana'],
      })
    })

    await act(async () => {
      // First op forbidden, second op accepted. The forbidden one should be
      // dropped without a retry.
      result.current.emit({ type: 'life', seatId: 99, delta: -1 } as SyncOp)
      result.current.emit({ type: 'life', seatId: 1, delta: -1 } as SyncOp)
      for (let i = 0; i < 10; i++) await Promise.resolve()
    })

    await waitFor(() => expect(result.current.pendingCount).toBe(0))
    expect(result.current.status).toBe('active')
    expect(writeCalls()).toHaveLength(3) // create + 403 + 200
  })

  it('clears queue and marks ended on 409 game_ended', async () => {
    whenCreate(ok(makeCreateResponse()))
    whenOp(ok({ error: 'game_ended' }, 409))

    const { result } = renderHook(() => useSync())
    await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))
    await act(async () => {
      await result.current.createSession({
        players: sampleInput().players,
        gameMode: sampleInput().gameMode,
        customLife: 20,
        enabledCounters: ['cmd', 'poison', 'mana'],
      })
    })

    await act(async () => {
      result.current.emit({ type: 'life', seatId: 1, delta: -1 } as SyncOp)
      result.current.emit({ type: 'life', seatId: 1, delta: -1 } as SyncOp)
      for (let i = 0; i < 5; i++) await Promise.resolve()
    })

    await waitFor(() => expect(result.current.status).toBe('ended'))
    expect(result.current.pendingCount).toBe(0)
    // No further fetches after the 409 — second op was dropped from the queue.
    expect(writeCalls()).toHaveLength(2)
  })

  it('teardown() clears state but does not delete server session', async () => {
    whenCreate(ok(makeCreateResponse()))

    const { result } = renderHook(() => useSync())
    await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))
    await act(async () => {
      await result.current.createSession({
        players: sampleInput().players,
        gameMode: sampleInput().gameMode,
        customLife: 20,
        enabledCounters: ['cmd', 'poison', 'mana'],
      })
    })
    expect(result.current.status).toBe('active')

    act(() => {
      result.current.teardown()
    })

    expect(result.current.status).toBe('idle')
    expect(result.current.session).toBeNull()
    expect(result.current.pendingCount).toBe(0)
    // Only the create call — teardown is local-only.
    expect(writeCalls()).toHaveLength(1)
  })

  // ──── Read-path / polling tests (PR #21) ───────────────────────────
  describe('polling / remote ops', () => {
    const sinceCalls = () =>
      fetchMock.mock.calls.filter((c) => String(c[0]).includes('/since'))

    it('starts polling /since after createSession at 1.5s cadence', async () => {
      whenCreate(ok(makeCreateResponse()))
      const { result } = renderHook(() => useSync())
      await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))
      await act(async () => {
        await result.current.createSession({
          players: sampleInput().players,
          gameMode: sampleInput().gameMode,
          customLife: 20,
          enabledCounters: ['cmd', 'poison', 'mana'],
        })
      })

      // First poll fires immediately on activation.
      await waitFor(() => expect(sinceCalls().length).toBeGreaterThanOrEqual(1))
      const firstUrl = String(sinceCalls()[0][0])
      expect(firstUrl).toMatch(
        /^\/api\/sync\/sess_abc\/since\?seq=\d+$/,
      )

      // After advancing 1.6s, a second poll should have fired.
      await act(async () => {
        jest.advanceTimersByTime(1_600)
        for (let i = 0; i < 5; i++) await Promise.resolve()
      })
      await waitFor(() => expect(sinceCalls().length).toBeGreaterThanOrEqual(2))
    })

    it('applies remote ops to snapshot and notifies subscribeRemoteOps', async () => {
      whenCreate(ok(makeCreateResponse()))
      // First /since call returns one remote life op authored by another device.
      whenSince(
        ok({
          seq: 1,
          ops: [
            {
              seq: 1,
              opId: 'other-device-aaaa:0',
              deviceId: 'other-device-aaaa',
              ts: 100,
              op: { type: 'life', seatId: 1, delta: -3 },
            },
          ],
        }),
      )

      const { result } = renderHook(() => useSync())
      await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))

      const remoteCalls: string[] = []
      act(() => {
        result.current.subscribeRemoteOps((env) => {
          remoteCalls.push(`${env.op.type}:${env.deviceId}:${env.seq}`)
        })
      })

      await act(async () => {
        await result.current.createSession({
          players: [
            {
              id: 1,
              name: 'P1',
              life: 40,
              cmd: 0,
              cmdFrom: {},
              poison: 0,
              mana: 0,
              energy: 0,
              experience: 0,
            },
          ],
          gameMode: { name: 'Commander', life: 40 },
          customLife: 20,
          enabledCounters: ['cmd', 'poison', 'mana'],
        })
      })
      // Seed snapshot.players so applySyncOp has a player to mutate (the
      // server returns an empty snapshot in our fixture; populate it).
      await waitFor(() => expect(result.current.snapshot).toBeTruthy())
      // Drive the poll.
      await act(async () => {
        for (let i = 0; i < 10; i++) await Promise.resolve()
      })

      await waitFor(() => expect(remoteCalls.length).toBe(1))
      expect(remoteCalls[0]).toBe('life:other-device-aaaa:1')
      // Snapshot reflected the op (no auto-create of player, but seq advanced).
      expect(result.current.appliedSeq).toBe(1)
    })

    it('does NOT notify subscribeRemoteOps for ops authored by this device', async () => {
      whenCreate(ok(makeCreateResponse()))
      whenSince(
        ok({
          seq: 5,
          ops: [
            {
              seq: 5,
              opId: `${TEST_DEVICE_ID}:0`,
              deviceId: TEST_DEVICE_ID,
              ts: 100,
              op: { type: 'life', seatId: 1, delta: -1 },
            },
          ],
        }),
      )

      const { result } = renderHook(() => useSync())
      await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))
      const remoteCalls: string[] = []
      act(() => {
        result.current.subscribeRemoteOps(() => remoteCalls.push('x'))
      })
      await act(async () => {
        await result.current.createSession({
          players: sampleInput().players,
          gameMode: sampleInput().gameMode,
          customLife: 20,
          enabledCounters: ['cmd', 'poison', 'mana'],
        })
      })
      await act(async () => {
        for (let i = 0; i < 10; i++) await Promise.resolve()
      })
      await waitFor(() => expect(result.current.appliedSeq).toBe(5))
      expect(remoteCalls).toHaveLength(0)
    })

    it('marks status=ended on remote end_game', async () => {
      whenCreate(ok(makeCreateResponse()))
      whenSince(
        ok({
          seq: 1,
          ops: [
            {
              seq: 1,
              opId: 'other:0',
              deviceId: 'other',
              ts: 100,
              op: { type: 'end_game' },
            },
          ],
        }),
      )

      const { result } = renderHook(() => useSync())
      await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))
      await act(async () => {
        await result.current.createSession({
          players: sampleInput().players,
          gameMode: sampleInput().gameMode,
          customLife: 20,
          enabledCounters: ['cmd', 'poison', 'mana'],
        })
      })
      await act(async () => {
        for (let i = 0; i < 10; i++) await Promise.resolve()
      })
      await waitFor(() => expect(result.current.status).toBe('ended'))
    })

    it('marks status=offline on /since 5xx, recovers when next poll succeeds', async () => {
      whenCreate(ok(makeCreateResponse()))
      whenSince(ok({ error: 'boom' }, 500), ok({ ops: [], seq: 0 }))

      const { result } = renderHook(() => useSync())
      await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))
      await act(async () => {
        await result.current.createSession({
          players: sampleInput().players,
          gameMode: sampleInput().gameMode,
          customLife: 20,
          enabledCounters: ['cmd', 'poison', 'mana'],
        })
      })
      await waitFor(() => expect(result.current.status).toBe('offline'))

      await act(async () => {
        jest.advanceTimersByTime(1_600)
        for (let i = 0; i < 5; i++) await Promise.resolve()
      })
      await waitFor(() => expect(result.current.status).toBe('active'))
    })

    it('teardown stops polling', async () => {
      whenCreate(ok(makeCreateResponse()))
      const { result } = renderHook(() => useSync())
      await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))
      await act(async () => {
        await result.current.createSession({
          players: sampleInput().players,
          gameMode: sampleInput().gameMode,
          customLife: 20,
          enabledCounters: ['cmd', 'poison', 'mana'],
        })
      })
      await waitFor(() => expect(sinceCalls().length).toBeGreaterThanOrEqual(1))
      const before = sinceCalls().length

      act(() => {
        result.current.teardown()
      })
      // Advance several intervals — no new /since fetches.
      await act(async () => {
        jest.advanceTimersByTime(5_000)
        for (let i = 0; i < 10; i++) await Promise.resolve()
      })
      expect(sinceCalls().length).toBe(before)
    })
  })

  describe('joinSession / claimSeat', () => {
    const sinceCalls = () =>
      fetchMock.mock.calls.filter((c) => String(c[0]).includes('/since'))

    function makeJoinResponse(overrides: Partial<ReturnType<typeof makeCreateResponse>> = {}) {
      const base = makeCreateResponse()
      return {
        id: base.id,
        session: base.session,
        snapshot: { ...base.snapshot, seq: 7 },
        seats: [
          { seatId: 1, ownerDeviceId: 'host-device', name: 'Host' },
          { seatId: 2, ownerDeviceId: null, name: 'P2' },
          { seatId: 3, ownerDeviceId: null, name: 'P3' },
        ],
        ...overrides,
      }
    }

    it('joinSession resolves a code via /api/sync/by-code, hydrates state, and starts polling', async () => {
      const join = makeJoinResponse()
      whenByCode(ok(join))
      const { result } = renderHook(() => useSync())
      await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))

      let returned: unknown = undefined
      await act(async () => {
        returned = await result.current.joinSession('abc-123')
      })

      // Hit the by-code route with normalized (uppercase, alphanumeric-only) code.
      expect(fetchMock).toHaveBeenCalledWith('/api/sync/by-code/ABC123')
      expect(returned).not.toBeNull()
      expect(result.current.session?.id).toBe('sess_abc')
      expect(result.current.seats).toHaveLength(3)
      expect(result.current.snapshot?.seq).toBe(7)
      expect(result.current.appliedSeq).toBe(7)
      expect(result.current.status).toBe('active')
      // joinUrl is derived from window.location.origin + ?join=CODE
      expect(result.current.joinUrl).toContain('?join=ABC123')

      // Polling should be running.
      await act(async () => {
        jest.advanceTimersByTime(1_500)
        for (let i = 0; i < 5; i++) await Promise.resolve()
      })
      expect(sinceCalls().length).toBeGreaterThanOrEqual(1)
    })

    it('joinSession returns null on 404 and does not start polling', async () => {
      whenByCode(ok({}, 404))
      const { result } = renderHook(() => useSync())
      await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))

      let returned: unknown = 'sentinel'
      await act(async () => {
        returned = await result.current.joinSession('NOPE99')
      })
      expect(returned).toBeNull()
      expect(result.current.session).toBeNull()
      expect(result.current.status).toBe('idle')

      await act(async () => {
        jest.advanceTimersByTime(3_000)
        for (let i = 0; i < 5; i++) await Promise.resolve()
      })
      expect(sinceCalls().length).toBe(0)
    })

    it('joinSession returns null on empty/garbage code without hitting the network', async () => {
      const { result } = renderHook(() => useSync())
      await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))

      let returned: unknown = 'sentinel'
      await act(async () => {
        returned = await result.current.joinSession('---')
      })
      expect(returned).toBeNull()
      // No by-code fetch should have fired.
      const byCodeCalls = fetchMock.mock.calls.filter((c) =>
        String(c[0]).includes('/api/sync/by-code/'),
      )
      expect(byCodeCalls).toHaveLength(0)
    })

    it('claimSeat POSTs deviceId+seatId and mirrors returned seats into state', async () => {
      whenByCode(ok(makeJoinResponse()))
      const updatedSeats = [
        { seatId: 1, ownerDeviceId: 'host-device', name: 'Host' },
        { seatId: 2, ownerDeviceId: TEST_DEVICE_ID, name: 'P2' },
        { seatId: 3, ownerDeviceId: null, name: 'P3' },
      ]
      whenSeat(ok({ seats: updatedSeats }))

      const { result } = renderHook(() => useSync())
      await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))

      await act(async () => {
        await result.current.joinSession('ABC123')
      })

      let claimed: unknown = undefined
      await act(async () => {
        claimed = await result.current.claimSeat(2)
      })

      expect(claimed).toEqual(updatedSeats)
      expect(result.current.seats).toEqual(updatedSeats)

      // Verify POST shape.
      const seatCall = fetchMock.mock.calls.find((c) =>
        String(c[0]).includes('/api/sync/sess_abc/seat'),
      )
      expect(seatCall).toBeDefined()
      const [, init] = seatCall as [string, RequestInit]
      expect((init.method ?? 'GET').toUpperCase()).toBe('POST')
      const body = JSON.parse(init.body as string)
      expect(body).toEqual({ deviceId: TEST_DEVICE_ID, seatId: 2 })
    })

    it('claimSeat returns null when no session is active', async () => {
      const { result } = renderHook(() => useSync())
      await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))

      let claimed: unknown = 'sentinel'
      await act(async () => {
        claimed = await result.current.claimSeat(1)
      })
      expect(claimed).toBeNull()
      const seatCalls = fetchMock.mock.calls.filter((c) =>
        String(c[0]).includes('/seat'),
      )
      expect(seatCalls).toHaveLength(0)
    })
  })
})
