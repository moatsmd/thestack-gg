/**
 * Remember the (sessionId, code, seatId) of the last pod-sync session the
 * current device participated in. Used to surface a "looks like you were
 * in this pod before \u2014 try seat X?" hint when a returning user lands on
 * /tracker?join=CODE but their device id has rotated (iOS Safari ITP
 * eviction etc.) so the server no longer maps them to their old seat.
 *
 * Storage is best-effort localStorage; we never throw. SSR-safe.
 */

const STORAGE_KEY = 'thestack:last-pod-seat'

export type LastPodSeat = {
  sessionId: string
  code: string
  seatId: number
  /** ms since epoch \u2014 used to age out stale memos. */
  at: number
}

// Memos older than this are ignored. Server sessions TTL at 24h, so 30h\n// gives a small grace window for a delayed rejoin while still rejecting\n// truly stale state.
const MAX_AGE_MS = 30 * 60 * 60 * 1000

export const rememberLastPodSeat = (memo: Omit<LastPodSeat, 'at'>): void => {
  if (typeof window === 'undefined') return
  try {
    const payload: LastPodSeat = { ...memo, at: Date.now() }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore
  }
}

export const readLastPodSeat = (): LastPodSeat | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<LastPodSeat>
    if (
      typeof parsed.sessionId !== 'string' ||
      typeof parsed.code !== 'string' ||
      typeof parsed.seatId !== 'number' ||
      typeof parsed.at !== 'number'
    ) {
      return null
    }
    if (Date.now() - parsed.at > MAX_AGE_MS) return null
    return parsed as LastPodSeat
  } catch {
    return null
  }
}

export const clearLastPodSeat = (): void => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
