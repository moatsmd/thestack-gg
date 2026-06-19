/**
 * last-pod-seat — small localStorage memo that lets the JoinModal show
 * "looks like you were here before — try seat X" when the device id has
 * rotated but localStorage survived ITP eviction.
 */

import {
  rememberLastPodSeat,
  readLastPodSeat,
  clearLastPodSeat,
} from '../last-pod-seat'

beforeEach(() => {
  window.localStorage.clear()
})

describe('last-pod-seat', () => {
  it('round-trips a memo through write + read', () => {
    rememberLastPodSeat({ sessionId: 'sess_a', code: 'ABC123', seatId: 2 })
    const got = readLastPodSeat()
    expect(got).toBeTruthy()
    expect(got?.sessionId).toBe('sess_a')
    expect(got?.code).toBe('ABC123')
    expect(got?.seatId).toBe(2)
    expect(typeof got?.at).toBe('number')
  })

  it('returns null when nothing is stored', () => {
    expect(readLastPodSeat()).toBeNull()
  })

  it('returns null when the stored payload is malformed', () => {
    window.localStorage.setItem('thestack:last-pod-seat', '{not json')
    expect(readLastPodSeat()).toBeNull()
  })

  it('returns null when missing fields', () => {
    window.localStorage.setItem(
      'thestack:last-pod-seat',
      JSON.stringify({ sessionId: 'x' }),
    )
    expect(readLastPodSeat()).toBeNull()
  })

  it('expires entries older than 30 hours', () => {
    const oldAt = Date.now() - 31 * 60 * 60 * 1000
    window.localStorage.setItem(
      'thestack:last-pod-seat',
      JSON.stringify({
        sessionId: 'sess_a',
        code: 'ABC123',
        seatId: 2,
        at: oldAt,
      }),
    )
    expect(readLastPodSeat()).toBeNull()
  })

  it('clearLastPodSeat removes the memo', () => {
    rememberLastPodSeat({ sessionId: 'sess_a', code: 'ABC123', seatId: 2 })
    expect(readLastPodSeat()).not.toBeNull()
    clearLastPodSeat()
    expect(readLastPodSeat()).toBeNull()
  })
})
