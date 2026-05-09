/**
 * Stable per-device identifier persisted in localStorage.
 *
 * Used by Pod Sync to identify which seat each browser owns. The id is
 * generated once on first use and reused across sessions. It is NOT a user
 * identity — clearing site data, switching browsers, or using a private
 * window all generate a fresh id (and therefore the device looks new to
 * any sync session it joins).
 *
 * SSR-safe: returns null when called server-side or before hydration. The
 * caller is responsible for triggering a client-side resolution.
 */

const STORAGE_KEY = 'thestack:device-id'

const generate = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  // Fallback for jsdom-without-crypto environments. Not cryptographically
  // strong, but the id only needs to be unique-per-browser, not unguessable.
  return (
    Math.random().toString(36).slice(2, 10) +
    '-' +
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).slice(2, 10)
  )
}

/**
 * Get-or-create the device id. Returns null in non-browser environments
 * (SSR, tests without window). Safe to call repeatedly — value is cached
 * in localStorage.
 */
export const getDeviceId = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY)
    if (existing && typeof existing === 'string' && existing.length > 0) {
      return existing
    }
    const fresh = generate()
    window.localStorage.setItem(STORAGE_KEY, fresh)
    return fresh
  } catch {
    // localStorage can throw in private mode / quota / blocked contexts.
    // Return a session-scoped fallback so the app keeps working.
    return generate()
  }
}

/** Test-only helper. */
export const __resetDeviceIdForTests = () => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
