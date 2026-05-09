/**
 * device-id — stable per-device identifier persisted in localStorage.
 */

import { getDeviceId, __resetDeviceIdForTests } from '../device-id'

const STORAGE_KEY = 'thestack:device-id'

beforeEach(() => {
  window.localStorage.clear()
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
})
