/**
 * device-id — stable per-device identifier persisted in localStorage AND
 * a long-lived first-party cookie. The cookie is the durability backstop
 * for iOS Safari ITP, which purges localStorage after ~7 days of inactivity.
 */

import { getDeviceId, __resetDeviceIdForTests } from '../device-id'

const STORAGE_KEY = 'thestack:device-id'
const COOKIE_NAME = 'thestack_device_id'

const clearAllCookies = () => {
  for (const part of document.cookie.split(';')) {
    const eq = part.indexOf('=')
    const name = (eq === -1 ? part : part.slice(0, eq)).trim()
    if (!name) continue
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`
  }
}

const readCookie = (name: string): string | null => {
  for (const part of document.cookie.split(';')) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    const k = part.slice(0, eq).trim()
    if (k === name) return decodeURIComponent(part.slice(eq + 1).trim())
  }
  return null
}

beforeEach(() => {
  window.localStorage.clear()
  clearAllCookies()
  __resetDeviceIdForTests()
})

describe('getDeviceId', () => {
  it('generates and persists an id on first call', () => {
    const id = getDeviceId()
    expect(id).toBeTruthy()
    expect(typeof id).toBe('string')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(id)
  })

  it('returns the same id across calls', () => {
    const a = getDeviceId()
    const b = getDeviceId()
    expect(a).toBe(b)
  })

  it('returns the persisted id when present', () => {
    window.localStorage.setItem(STORAGE_KEY, 'preexisting-id')
    expect(getDeviceId()).toBe('preexisting-id')
  })

  it('regenerates after __resetDeviceIdForTests', () => {
    const a = getDeviceId()
    __resetDeviceIdForTests()
    const b = getDeviceId()
    expect(b).toBeTruthy()
    expect(b).not.toBe(a)
  })

  it('writes the id to a long-lived cookie as well as localStorage', () => {
    const id = getDeviceId()
    expect(readCookie(COOKIE_NAME)).toBe(id)
  })

  it('recovers the id from the cookie when localStorage is empty (ITP eviction case)', () => {
    // Simulate iOS Safari purging localStorage after 7 days while leaving
    // the first-party cookie intact.
    document.cookie = `${COOKIE_NAME}=cookie-only-id; Path=/; Max-Age=63072000; SameSite=Lax`
    window.localStorage.clear()
    __resetDeviceIdForTests()
    // After reset, the cookie remains; getDeviceId should re-use it.
    document.cookie = `${COOKIE_NAME}=cookie-only-id; Path=/; Max-Age=63072000; SameSite=Lax`

    const recovered = getDeviceId()
    expect(recovered).toBe('cookie-only-id')
    // And it should heal localStorage back.
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('cookie-only-id')
  })

  it('heals the cookie if localStorage has an id but cookie was cleared', () => {
    window.localStorage.setItem(STORAGE_KEY, 'ls-only-id')
    clearAllCookies()
    const id = getDeviceId()
    expect(id).toBe('ls-only-id')
    expect(readCookie(COOKIE_NAME)).toBe('ls-only-id')
  })

  it('returns a stable id within a session even when localStorage writes throw (private mode)', () => {
    // Simulate Safari private mode by making setItem throw on every write.
    const realSetItem = window.localStorage.setItem
    const realRemoveItem = window.localStorage.removeItem
    Object.defineProperty(window.localStorage, 'setItem', {
      configurable: true,
      writable: true,
      value: () => {
        throw new Error('QuotaExceeded')
      },
    })
    Object.defineProperty(window.localStorage, 'removeItem', {
      configurable: true,
      writable: true,
      value: () => {
        throw new Error('QuotaExceeded')
      },
    })
    try {
      __resetDeviceIdForTests()
      const a = getDeviceId()
      const b = getDeviceId()
      const c = getDeviceId()
      expect(a).toBeTruthy()
      expect(b).toBe(a)
      expect(c).toBe(a)
    } finally {
      Object.defineProperty(window.localStorage, 'setItem', {
        configurable: true,
        writable: true,
        value: realSetItem,
      })
      Object.defineProperty(window.localStorage, 'removeItem', {
        configurable: true,
        writable: true,
        value: realRemoveItem,
      })
    }
  })
})
