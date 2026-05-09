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

beforeEach(() => {
  // Pin a deterministic deviceId in localStorage so opId/seat checks are
  // predictable across tests. Clear first, then plant our test id.
  __resetDeviceIdForTests()
  window.localStorage.clear()
  window.localStorage.setItem('thestack:device-id', TEST_DEVICE_ID)
  // jsdom does not expose `fetch` by default; install our own mock.
  originalFetch = (globalThis as { fetch?: typeof fetch }).fetch
  fetchMock = jest.fn()
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
    fetchMock.mockResolvedValueOnce(ok(created))

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
    fetchMock
      .mockResolvedValueOnce(ok(makeCreateResponse()))
      .mockResolvedValueOnce(ok({ envelope: { seq: 1 } }))

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

    expect(fetchMock).toHaveBeenCalledTimes(2)
    const opCall = fetchMock.mock.calls[1]
    expect(opCall[0]).toBe('/api/sync/sess_abc/op')
    const body = JSON.parse((opCall[1] as RequestInit).body as string)
    expect(body.deviceId).toBe(TEST_DEVICE_ID)
    expect(body.opId).toBe(`${TEST_DEVICE_ID}:0`)
    expect(body.op).toEqual({ type: 'life', seatId: 1, delta: -2 })
  })

  it('emit() generates monotonically increasing opIds for dedup', async () => {
    fetchMock
      .mockResolvedValueOnce(ok(makeCreateResponse()))
      .mockResolvedValueOnce(ok({ envelope: { seq: 1 } }))
      .mockResolvedValueOnce(ok({ envelope: { seq: 2 } }))
      .mockResolvedValueOnce(ok({ envelope: { seq: 3 } }))

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

    const opIds = fetchMock.mock.calls
      .slice(1)
      .map((c) => JSON.parse((c[1] as RequestInit).body as string).opId)
    expect(opIds).toEqual([
      `${TEST_DEVICE_ID}:0`,
      `${TEST_DEVICE_ID}:1`,
      `${TEST_DEVICE_ID}:2`,
    ])
  })

  it('schedules an exponential-backoff retry on network error', async () => {
    fetchMock
      .mockResolvedValueOnce(ok(makeCreateResponse()))
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(ok({ envelope: { seq: 1 } }))

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
    expect(fetchMock).toHaveBeenCalledTimes(3) // create + failed op + retry
  })

  it('drops op on 403/400 rejection without retrying', async () => {
    fetchMock
      .mockResolvedValueOnce(ok(makeCreateResponse()))
      .mockResolvedValueOnce(ok({ error: 'forbidden' }, 403))
      .mockResolvedValueOnce(ok({ envelope: { seq: 1 } }))

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
    expect(fetchMock).toHaveBeenCalledTimes(3) // create + 403 + 200
  })

  it('clears queue and marks ended on 409 game_ended', async () => {
    fetchMock
      .mockResolvedValueOnce(ok(makeCreateResponse()))
      .mockResolvedValueOnce(ok({ error: 'game_ended' }, 409))

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
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('teardown() clears state but does not delete server session', async () => {
    fetchMock.mockResolvedValueOnce(ok(makeCreateResponse()))

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
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
