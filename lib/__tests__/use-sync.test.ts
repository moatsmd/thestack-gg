/**
 * useSync hook — write-path tests.
 *
 * Covers:
 *   - createSession POSTs to /api/sync and stores the resulting session.
 *   - emit() queues an op and POSTs to /api/sync/{id}/op with the deviceId
 *     and a unique opId.
 *   - opIds remain unique across reloads and remain stable when retrying.
 *   - Network failure schedules an exponential-backoff retry.
 *   - 403/400 server rejection drops the op and continues.
 *   - 409 (game_ended) clears the queue and sets status='ended'.
 *   - Authority: emit() is a no-op when no session is active.
 */

import { act, renderHook, waitFor } from '@testing-library/react'
import { useSync } from '../use-sync'
import { __resetDeviceIdForTests } from '../device-id'
import type { SyncCounter, SyncOp, SyncPlayer } from '@/types/sync'

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
  if (url.includes('/seat') && (method === 'POST' || method === 'DELETE')) {
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
      players: [] as SyncPlayer[],
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
  enabledCounters: ['cmd', 'poison', 'mana'] as SyncCounter[],
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
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
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
      `${window.location.origin}/tracker?join=ABC123`,
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
    expect(body.opId).toEqual(expect.any(String))
    expect(body.op).toEqual({ type: 'life', seatId: 1, delta: -2 })
  })

  it('emit() generates unique opIds for dedup', async () => {
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
    expect(new Set(opIds).size).toBe(3)
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
      expect(fetchMock).toHaveBeenCalledWith('/api/sync/by-code/ABC123', expect.objectContaining({
        cache: 'no-store', headers: { 'X-Sync-Device-Id': TEST_DEVICE_ID },
      }))
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

  describe('releaseSeat', () => {
    it('DELETEs /api/sync/{id}/seat with deviceId+seatId and mirrors returned seats', async () => {
      whenByCode(
        ok({
          id: 'sess_abc',
          session: makeCreateResponse().session,
          snapshot: { ...makeCreateResponse().snapshot, seq: 0 },
          seats: [
            { seatId: 1, ownerDeviceId: TEST_DEVICE_ID, name: 'Host' },
            { seatId: 2, ownerDeviceId: 'other-device', name: 'P2' },
          ],
        }),
      )
      const releasedSeats = [
        { seatId: 1, ownerDeviceId: TEST_DEVICE_ID, name: 'Host' },
        { seatId: 2, ownerDeviceId: null, name: 'P2' },
      ]
      whenSeat(ok({ seats: releasedSeats }))

      const { result } = renderHook(() => useSync())
      await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))
      await act(async () => {
        await result.current.joinSession('ABC123')
      })

      let released: unknown = undefined
      await act(async () => {
        released = await result.current.releaseSeat(2)
      })

      expect(released).toEqual(releasedSeats)
      expect(result.current.seats).toEqual(releasedSeats)

      const releaseCall = fetchMock.mock.calls.find(
        (c) =>
          String(c[0]).includes('/api/sync/sess_abc/seat') &&
          ((c[1] as RequestInit)?.method ?? '').toUpperCase() === 'DELETE',
      )
      expect(releaseCall).toBeDefined()
      const [, init] = releaseCall as [string, RequestInit]
      const body = JSON.parse(init.body as string)
      expect(body).toEqual({ deviceId: TEST_DEVICE_ID, seatId: 2 })
    })

    it('returns null when the server rejects (e.g. non-host trying to release)', async () => {
      whenByCode(
        ok({
          id: 'sess_abc',
          session: makeCreateResponse().session,
          snapshot: { ...makeCreateResponse().snapshot, seq: 0 },
          seats: [
            { seatId: 1, ownerDeviceId: 'host-device', name: 'Host' },
            { seatId: 2, ownerDeviceId: TEST_DEVICE_ID, name: 'P2' },
          ],
        }),
      )
      whenSeat(ok({ error: 'host_only' }, 403))

      const { result } = renderHook(() => useSync())
      await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))
      await act(async () => {
        await result.current.joinSession('ABC123')
      })

      let released: unknown = 'sentinel'
      await act(async () => {
        released = await result.current.releaseSeat(1)
      })
      expect(released).toBeNull()
    })

    it('returns null with no network call when no session is active', async () => {
      const { result } = renderHook(() => useSync())
      await waitFor(() => expect(result.current.deviceId).toBe(TEST_DEVICE_ID))

      let released: unknown = 'sentinel'
      await act(async () => {
        released = await result.current.releaseSeat(1)
      })
      expect(released).toBeNull()
      const seatCalls = fetchMock.mock.calls.filter((c) =>
        String(c[0]).includes('/seat'),
      )
      expect(seatCalls).toHaveLength(0)
    })
  })
})

describe('sleep and reload recovery', () => {
  const create = async (result: { current: ReturnType<typeof useSync> }) => {
    whenCreate(ok(makeCreateResponse()))
    await act(async () => { await result.current.createSession(sampleInput()) })
  }
  const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve() }
  const opBodies = () => fetchMock.mock.calls
    .filter((c) => String(c[0]).endsWith('/op'))
    .map((c) => JSON.parse((c[1] as RequestInit).body as string))

  it('does not reuse operation IDs after a page reload', async () => {
    const first = renderHook(() => useSync())
    await create(first.result)
    await act(async () => { first.result.current.emit({ type: 'life', seatId: 1, delta: -1 }); await flush() })
    first.unmount()
    const second = renderHook(() => useSync())
    whenByCode(ok(makeCreateResponse()))
    await act(async () => { await second.result.current.joinSession('ABC123') })
    await act(async () => { second.result.current.emit({ type: 'life', seatId: 1, delta: -2 }); await flush() })
    expect(opBodies()).toHaveLength(2)
    expect(opBodies()[0].opId).not.toBe(opBodies()[1].opId)
  })

  it('keeps an outbox across unmount and retries the same op when resuming the same player', async () => {
    const first = renderHook(() => useSync())
    await create(first.result)
    whenOp(() => Promise.reject(new Error('offline')))
    await act(async () => { first.result.current.emit({ type: 'life', seatId: 1, delta: -2 }); await flush() })
    expect(first.result.current.pendingCount).toBe(1)
    first.unmount()
    const second = renderHook(() => useSync())
    expect(second.result.current.savedSession?.session.code).toBe('ABC123')
    expect(second.result.current.savedSession?.pendingCount).toBe(1)
    whenByCode(ok(makeCreateResponse()), ok(makeCreateResponse()))
    await act(async () => { await second.result.current.resumeSession() })
    expect(opBodies()).toHaveLength(2)
    expect(opBodies()[1]).toEqual(opBodies()[0])
    expect(second.result.current.seats[0].ownerDeviceId).toBe(TEST_DEVICE_ID)
    expect(second.result.current.pendingCount).toBe(0)
  })

  it('ignores a create response arriving after the user leaves', async () => {
    let finish!: (response: Response) => void
    whenCreate(new Promise<Response>((resolve) => { finish = resolve }))
    const { result } = renderHook(() => useSync())
    let creation!: Promise<unknown>
    act(() => { creation = result.current.createSession(sampleInput()) })
    act(() => result.current.teardown())
    await act(async () => { finish(ok(makeCreateResponse())); await creation })
    expect(result.current.session).toBeNull()
    expect(result.current.status).toBe('idle')
  })

  it('ignores an in-flight poll after teardown', async () => {
    let finish!: (response: Response) => void
    whenSince(new Promise<Response>((resolve) => { finish = resolve }))
    const { result } = renderHook(() => useSync())
    const remote = jest.fn()
    act(() => { result.current.subscribeRemoteOps(remote) })
    await create(result)
    act(() => result.current.teardown())
    await act(async () => {
      finish(ok({ seq: 1, ops: [{ seq: 1, opId: 'remote-1', deviceId: 'other', ts: 1, op: { type: 'end_game' } }] }))
      await flush()
    })
    expect(remote).not.toHaveBeenCalled()
    expect(result.current.status).toBe('idle')
    expect(result.current.appliedSeq).toBe(0)
  })

  it('coalesces focus and visibility signals while a read is in flight', async () => {
    let finish!: (response: Response) => void
    whenSince(new Promise<Response>((resolve) => { finish = resolve }))
    const { result } = renderHook(() => useSync())
    await create(result)
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'))
      window.dispatchEvent(new Event('focus'))
      window.dispatchEvent(new Event('online'))
      await flush()
    })
    expect(fetchMock.mock.calls.filter((c) => String(c[0]).includes('/since'))).toHaveLength(1)
    await act(async () => { finish(ok({ ops: [], seq: 0 })); await flush() })
  })

  it('immediately retries queued changes when the phone wakes', async () => {
    const { result } = renderHook(() => useSync())
    await create(result)
    whenOp(() => Promise.reject(new Error('offline')), ok({ envelope: { seq: 1 } }))
    await act(async () => { result.current.emit({ type: 'life', seatId: 1, delta: -2 }); await flush() })
    expect(result.current.pendingCount).toBe(1)
    await act(async () => { document.dispatchEvent(new Event('visibilitychange')); await flush() })
    expect(result.current.pendingCount).toBe(0)
    expect(opBodies()).toHaveLength(2)
  })

  it('projects pending changes and rolls back a rejected write with a visible error', async () => {
    const created = makeCreateResponse()
    created.snapshot.players = sampleInput().players
    whenCreate(ok(created))
    let finish!: (response: Response) => void
    whenOp(new Promise<Response>((resolve) => { finish = resolve }))
    const { result } = renderHook(() => useSync())
    await act(async () => { await result.current.createSession(sampleInput()) })
    act(() => result.current.emit({ type: 'life', seatId: 1, delta: -2 }))
    expect(result.current.snapshot?.players[0].life).toBe(38)
    await act(async () => { finish(ok({ error: 'forbidden' }, 403)); await flush() })
    expect(result.current.snapshot?.players[0].life).toBe(40)
    expect(result.current.error).toMatch(/not saved|permission|seat/i)
  })
})

// JSON recovery is untrusted local storage. Invalid entries must never reach the reducer.
describe('recovery storage validation', () => {
  it('ignores an outbox operation with invalid numeric fields', () => {
    window.localStorage.setItem('thestack:sync-recovery:v1', JSON.stringify({
      version: 1, deviceId: TEST_DEVICE_ID, session: makeCreateResponse().session,
      seats: makeCreateResponse().seats, savedAt: Date.now(),
      queue: [{ opId: 'broken', attempts: 0, op: { type: 'life', seatId: 1, delta: 'bad' } }],
    }))
    const { result } = renderHook(() => useSync())
    expect(result.current.savedSession).toBeNull()
  })
})

describe('authoritative recovery and reconciliation', () => {
  const flush = async () => { for (let i = 0; i < 25; i++) await Promise.resolve() }
  const withPlayers = () => ({ ...makeCreateResponse(), snapshot: { ...makeCreateResponse().snapshot, players: sampleInput().players } })

  it('does not double-apply a saved operation whose acknowledgement was lost', async () => {
    const initial = withPlayers()
    const first = renderHook(() => useSync())
    whenCreate(ok(initial))
    whenOp(() => Promise.reject(new Error('ack lost')))
    await act(async () => { await first.result.current.createSession(sampleInput()) })
    await act(async () => { first.result.current.emit({ type: 'life', seatId: 1, delta: -2 }); await flush() })
    const sent = fetchMock.mock.calls.find((c) => String(c[0]).endsWith('/op'))!
    const body = JSON.parse((sent[1] as RequestInit).body as string)
    first.unmount()
    const accepted = withPlayers()
    accepted.snapshot.players[0].life = 38
    accepted.snapshot.seq = 1
    whenByCode(ok(accepted))
    whenOp(ok({ envelope: { seq: 1, ...body }, snapshot: accepted.snapshot }))
    const second = renderHook(() => useSync())
    let resumed: Awaited<ReturnType<typeof second.result.current.resumeSession>> = null
    await act(async () => { resumed = await second.result.current.resumeSession() })
    expect(resumed!.snapshot.players[0].life).toBe(38)
    expect(second.result.current.snapshot?.players[0].life).toBe(38)
    expect(second.result.current.pendingCount).toBe(0)
  })

  it('keeps rejected acknowledgement recovery available until reconnect succeeds', async () => {
    const first = renderHook(() => useSync())
    whenCreate(ok(withPlayers()))
    await act(async () => { await first.result.current.createSession(sampleInput()) })
    whenOp(() => Promise.reject(new Error('offline')))
    await act(async () => { first.result.current.emit({ type: 'life', seatId: 1, delta: -2 }); await flush() })
    first.unmount()
    whenByCode(ok(withPlayers()))
    whenOp(() => Promise.reject(new Error('still offline')))
    const second = renderHook(() => useSync())
    await act(async () => { expect(await second.result.current.resumeSession()).toBeNull() })
    expect(second.result.current.session).toBeNull()
    expect(second.result.current.savedSession?.pendingCount).toBe(1)
    expect(second.result.current.error).toMatch(/queued/)
    const accepted = withPlayers()
    accepted.snapshot.players[0].life = 38
    accepted.snapshot.seq = 1
    whenByCode(ok(withPlayers()))
    whenOp(ok({ snapshot: accepted.snapshot }))
    await act(async () => { expect(await second.result.current.resumeSession()).not.toBeNull() })
    expect(second.result.current.snapshot?.players[0].life).toBe(38)
  })

  it('replaces a truncated-history snapshot and refreshes seat ownership', async () => {
    whenCreate(ok(withPlayers()))
    const { result } = renderHook(() => useSync())
    await act(async () => { await result.current.createSession(sampleInput()); await flush() })
    const updated = withPlayers()
    updated.snapshot.players[0].life = 9
    updated.snapshot.seq = 2000
    updated.seats[1].ownerDeviceId = 'other-device'
    whenSince(ok({ ops: [], seq: 2000, snapshot: updated.snapshot, seats: updated.seats }))
    await act(async () => { await result.current.reconnect() })
    expect(result.current.snapshot?.players[0].life).toBe(9)
    expect(result.current.appliedSeq).toBe(2000)
    expect(result.current.seats[1].ownerDeviceId).toBe('other-device')
  })

  it('does not report connected while write failures remain despite a healthy read', async () => {
    whenCreate(ok(withPlayers()))
    const { result } = renderHook(() => useSync())
    await act(async () => { await result.current.createSession(sampleInput()); await flush() })
    whenOp(() => Promise.reject(new Error('write failure')), () => Promise.reject(new Error('write failure')))
    await act(async () => { result.current.emit({ type: 'life', seatId: 1, delta: -2 }); await flush() })
    await act(async () => { await result.current.reconnect() })
    expect(result.current.status).toBe('offline')
    expect(result.current.pendingCount).toBe(1)
    expect(result.current.snapshot?.players[0].life).toBe(38)
  })

  it('forgets recovery on explicit leave and stops an expired outbox from retrying', async () => {
    whenCreate(ok(withPlayers()))
    const { result, unmount } = renderHook(() => useSync())
    await act(async () => { await result.current.createSession(sampleInput()); await flush() })
    whenOp(ok({ error: 'not_found' }, 404))
    await act(async () => { result.current.emit({ type: 'life', seatId: 1, delta: -2 }); await flush() })
    expect(result.current.status).toBe('ended')
    expect(result.current.pendingCount).toBe(0)
    expect(result.current.savedSession).toBeNull()
    act(() => result.current.teardown())
    unmount()
    const next = renderHook(() => useSync())
    expect(next.result.current.savedSession).toBeNull()
  })
})

describe('concurrent response ordering', () => {
  const flush = async () => { for (let i = 0; i < 25; i++) await Promise.resolve() }
  it('does not let an old poll undo a seat claim', async () => {
    let finish!: (response: Response) => void
    whenCreate(ok(makeCreateResponse()))
    whenSince(new Promise<Response>((resolve) => { finish = resolve }))
    const { result } = renderHook(() => useSync())
    await act(async () => { await result.current.createSession(sampleInput()) })
    const updated = makeCreateResponse().seats.map((seat) => ({ ...seat, ownerDeviceId: seat.seatId === 2 ? TEST_DEVICE_ID : null }))
    whenSeat(ok({ seats: updated }))
    await act(async () => { await result.current.claimSeat(2) })
    await act(async () => { finish(ok({ ops: [], seq: 0, seats: makeCreateResponse().seats })); await flush() })
    expect(result.current.seats[1].ownerDeviceId).toBe(TEST_DEVICE_ID)
  })

  it('never resurrects an ended game when an earlier write finally succeeds', async () => {
    let finish!: (response: Response) => void
    whenCreate(ok(makeCreateResponse()))
    const { result } = renderHook(() => useSync())
    await act(async () => { await result.current.createSession(sampleInput()); await flush() })
    whenOp(new Promise<Response>((resolve) => { finish = resolve }))
    act(() => result.current.emit({ type: 'life', seatId: 1, delta: -2 }))
    whenSince(ok({ ops: [{ seq: 2, opId: 'end', deviceId: 'host', ts: 1, op: { type: 'end_game' } }], seq: 2 }))
    await act(async () => { jest.advanceTimersByTime(1500); await flush() })
    expect(result.current.status).toBe('ended')
    await act(async () => { finish(ok({ snapshot: makeCreateResponse().snapshot })); await flush() })
    expect(result.current.status).toBe('ended')
    expect(result.current.savedSession).toBeNull()
  })
})

it('does not revive an expired table when a previous write succeeds', async () => {
  let finish!: (response: Response) => void
  whenCreate(ok(makeCreateResponse()))
  const { result } = renderHook(() => useSync())
  await act(async () => { await result.current.createSession(sampleInput()) })
  whenOp(new Promise<Response>((resolve) => { finish = resolve }))
  act(() => result.current.emit({ type: 'life', seatId: 1, delta: -2 }))
  whenSince(ok({ error: 'not_found' }, 404))
  await act(async () => {
    jest.advanceTimersByTime(1500)
    for (let i = 0; i < 25; i++) await Promise.resolve()
  })
  expect(result.current.status).toBe('ended')
  await act(async () => {
    finish(ok({ snapshot: makeCreateResponse().snapshot }))
    for (let i = 0; i < 25; i++) await Promise.resolve()
  })
  expect(result.current.status).toBe('ended')
  expect(result.current.savedSession).toBeNull()
})

it.each([413, 422])('rolls back an unretryable HTTP %s response instead of queuing forever', async (status) => {
  whenCreate(ok({ ...makeCreateResponse(), snapshot: { ...makeCreateResponse().snapshot, players: sampleInput().players } }))
  const { result } = renderHook(() => useSync())
  await act(async () => { await result.current.createSession(sampleInput()) })
  whenOp(ok({ error: 'invalid_name' }, status))
  await act(async () => {
    result.current.emit({ type: 'rename', seatId: 1, name: 'Rejected name' })
    for (let i = 0; i < 25; i++) await Promise.resolve()
  })
  expect(result.current.pendingCount).toBe(0)
  expect(result.current.snapshot?.players[0].name).toBe('P1')
  expect(result.current.error).toMatch(/not saved/i)
})

describe('flush acknowledgement contract', () => {
  it('waits for the end-game acknowledgement before reporting safe navigation', async () => {
    whenCreate(ok(makeCreateResponse()))
    const { result } = renderHook(() => useSync())
    await act(async () => { await result.current.createSession(sampleInput()) })
    let finish!: (response: Response) => void
    whenOp(new Promise<Response>((resolve) => { finish = resolve }))
    let finished = false
    let flushed!: Promise<boolean>
    act(() => {
      result.current.emit({ type: 'end_game', winnerSeatId: 1 })
      flushed = result.current.flush().then((safe) => { finished = safe; return safe })
    })
    await act(async () => { for (let i = 0; i < 10; i++) await Promise.resolve() })
    expect(finished).toBe(false)
    const snapshot = { ...makeCreateResponse().snapshot, seq: 1, endedAt: Date.now(), winnerSeatId: 1 }
    await act(async () => { finish(ok({ snapshot })); expect(await flushed).toBe(true) })
    expect(result.current.status).toBe('ended')
    expect(result.current.pendingCount).toBe(0)
  })

  it('returns false and preserves pending end-game operations when offline', async () => {
    whenCreate(ok(makeCreateResponse()))
    const { result } = renderHook(() => useSync())
    await act(async () => { await result.current.createSession(sampleInput()) })
    whenOp(() => Promise.reject(new Error('offline')))
    await act(async () => {
      result.current.emit({ type: 'end_game' })
      expect(await result.current.flush()).toBe(false)
    })
    expect(result.current.pendingCount).toBe(1)
    expect(result.current.savedSession?.pendingCount).toBe(1)
  })

  it('returns false for permanently rejected writes even after their outbox is cleared', async () => {
    whenCreate(ok(makeCreateResponse()))
    const { result } = renderHook(() => useSync())
    await act(async () => { await result.current.createSession(sampleInput()) })
    whenOp(ok({ error: 'host_only' }, 403))
    await act(async () => {
      result.current.emit({ type: 'end_game' })
      expect(await result.current.flush()).toBe(false)
    })
    expect(result.current.pendingCount).toBe(0)
    await act(async () => { expect(await result.current.flush()).toBe(false) })
  })
})

it('reuses a pending end-game operation when the finish action is retried', async () => {
  whenCreate(ok(makeCreateResponse()))
  const { result } = renderHook(() => useSync())
  await act(async () => { await result.current.createSession(sampleInput()) })
  whenOp(() => Promise.reject(new Error('offline')))
  await act(async () => {
    result.current.emit({ type: 'end_game', winnerSeatId: 1 })
    expect(await result.current.flush()).toBe(false)
  })
  whenOp(ok({ snapshot: { ...makeCreateResponse().snapshot, seq: 1, endedAt: Date.now(), winnerSeatId: 1 } }))
  await act(async () => {
    result.current.emit({ type: 'end_game', winnerSeatId: 1 })
    expect(await result.current.flush()).toBe(true)
  })
  const writes = fetchMock.mock.calls.filter((call) => String(call[0]).endsWith('/op'))
    .map((call) => JSON.parse((call[1] as RequestInit).body as string))
  expect(writes).toHaveLength(2)
  expect(writes[0].opId).toBe(writes[1].opId)
  expect(result.current.status).toBe('ended')
})

it.each(['http://0.0.0.0:3227/tracker?join=ABC123', 'https://unrelated.example/tracker?join=ABC123'])(
  'builds invite links from the browser origin when the server returns %s', async (joinUrl) => {
    whenCreate(ok({ ...makeCreateResponse(), joinUrl }))
    const { result } = renderHook(() => useSync())
    let created: Awaited<ReturnType<typeof result.current.createSession>> = null
    await act(async () => { created = await result.current.createSession(sampleInput()) })
    const reachableUrl = `${window.location.origin}/tracker?join=ABC123`
    expect(result.current.joinUrl).toBe(reachableUrl)
    expect(created!.joinUrl).toBe(reachableUrl)
  },
)
