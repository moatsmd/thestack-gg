'use client'

/**
 * Per-browser viewer id.
 *
 * Stored in localStorage so a returning visitor can see "Your pods" on the
 * tracker home and seamlessly attach new recaps to pods they created
 * earlier — without requiring sign-up.
 *
 * NOT auth. Anyone with the id can claim those pods. That's by design for
 * v1: the same trust level as recap links. If we ever add accounts we'll
 * migrate this into a real user id.
 *
 * Safe in SSR: `getOrCreateViewerId()` returns null if `window` is undefined,
 * so callers can guard with `useEffect` and avoid hydration mismatches.
 */

const KEY = 'thestack:viewerId'

const generate = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  }
  // Browser without crypto.randomUUID (very old). Two Math.random pulls give
  // ~104 bits of entropy — enough for our purposes.
  return (
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  )
}

/** Read the viewer id from localStorage, creating one if missing. */
export function getOrCreateViewerId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const existing = window.localStorage.getItem(KEY)
    if (existing && existing.length > 0) return existing
    const fresh = generate()
    window.localStorage.setItem(KEY, fresh)
    return fresh
  } catch {
    // localStorage can throw in private mode / quota — degrade gracefully.
    return null
  }
}

/** Read the viewer id without creating one. Useful for "is this a returning visitor?". */
export function readViewerId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(KEY)
  } catch {
    return null
  }
}
