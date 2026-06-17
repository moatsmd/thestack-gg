/**
 * Stable per-device identifier persisted to BOTH localStorage and a
 * long-lived first-party cookie.
 *
 * Why both? Mobile browsers (especially iOS Safari ITP) purge localStorage
 * for sites not visited in ~7 days, and PWA storage can be evicted under
 * memory pressure. Cookies are more durable for first-party visits and
 * survive ITP much better. If either side has the id, we re-hydrate the
 * other so future page loads see a consistent value.
 *
 * The id is NOT a user identity. Clearing site data, switching browsers,
 * or using a fresh private window all generate a new id (and so the device
 * looks new to any sync session it joins). For the pod-sync case, the host
 * has a "Free seat" escape hatch when a returning player's id is gone.
 *
 * SSR-safe: returns null when called server-side. Callers trigger a
 * client-side resolution on mount.
 */

const STORAGE_KEY = 'thestack:device-id'
const COOKIE_NAME = 'thestack_device_id'
// 2 years — comfortably longer than Safari's eviction window for visited
// first-party sites. Cookies on sites the user actively visits are not
// purged by ITP the way localStorage is.
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365 * 2

// Module-scope cache so that private-mode browsers (which throw on every
// localStorage write) still get a stable id for the lifetime of the JS
// context, instead of a brand-new uuid on every getDeviceId() call.
let inMemoryFallback: string | null = null

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

const readLocalStorage = (): string | null => {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    return v && typeof v === 'string' && v.length > 0 ? v : null
  } catch {
    return null
  }
}

const writeLocalStorage = (id: string): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // ignore — private mode / quota / blocked
  }
}

const readCookie = (): string | null => {
  try {
    const raw = document.cookie || ''
    // Cookie format: "thestack_device_id=<value>; other=...".
    const parts = raw.split(';')
    for (const part of parts) {
      const eq = part.indexOf('=')
      if (eq === -1) continue
      const name = part.slice(0, eq).trim()
      if (name === COOKIE_NAME) {
        const value = decodeURIComponent(part.slice(eq + 1).trim())
        return value.length > 0 ? value : null
      }
    }
    return null
  } catch {
    return null
  }
}

const writeCookie = (id: string): void => {
  try {
    // SameSite=Lax so QR-scan navigations from the host's phone (which
    // become top-level navigations to /tracker?join=...) still carry the
    // cookie. Secure flag added only on https.
    const secure =
      typeof window !== 'undefined' && window.location.protocol === 'https:'
        ? '; Secure'
        : ''
    document.cookie =
      `${COOKIE_NAME}=${encodeURIComponent(id)}` +
      `; Path=/; Max-Age=${COOKIE_MAX_AGE_SEC}; SameSite=Lax${secure}`
  } catch {
    // ignore
  }
}

/**
 * Get-or-create the device id. Returns null in non-browser environments
 * (SSR, tests without window). Safe to call repeatedly — value is cached
 * in localStorage AND a long-lived cookie.
 *
 * Recovery rules:
 *   - If localStorage has the id, use it (and back-fill the cookie).
 *   - Else if the cookie has the id, use it (and back-fill localStorage).
 *   - Else use the in-memory fallback if any (private mode stability).
 *   - Else generate a fresh id and write to all three.
 */
export const getDeviceId = (): string | null => {
  if (typeof window === 'undefined') return null

  const fromLs = readLocalStorage()
  if (fromLs) {
    // Heal the cookie side if it drifted.
    if (readCookie() !== fromLs) writeCookie(fromLs)
    inMemoryFallback = fromLs
    return fromLs
  }

  const fromCookie = readCookie()
  if (fromCookie) {
    // Heal the localStorage side.
    writeLocalStorage(fromCookie)
    inMemoryFallback = fromCookie
    return fromCookie
  }

  if (inMemoryFallback) {
    // Storage is blocked but we already minted one this session — reuse it.
    writeLocalStorage(inMemoryFallback)
    writeCookie(inMemoryFallback)
    return inMemoryFallback
  }

  const fresh = generate()
  inMemoryFallback = fresh
  writeLocalStorage(fresh)
  writeCookie(fresh)
  return fresh
}

/** Test-only helper. Clears every layer. */
export const __resetDeviceIdForTests = () => {
  inMemoryFallback = null
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
  try {
    document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`
  } catch {
    // ignore
  }
}
