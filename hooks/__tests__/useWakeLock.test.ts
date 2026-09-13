import { act, renderHook } from '@testing-library/react'
import { useWakeLock } from '../useWakeLock'

function sentinel() {
  const events = new EventTarget()
  const lock = {
    released: false,
    type: 'screen',
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    release: jest.fn(async () => {
      lock.released = true
      events.dispatchEvent(new Event('release'))
    }),
  }
  return lock
}

describe('useWakeLock', () => {
  const request = jest.fn()

  beforeEach(() => {
    request.mockReset()
    Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request } })
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
  })

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'wakeLock')
    Reflect.deleteProperty(document, 'visibilityState')
  })

  async function visibility(state: 'visible' | 'hidden') {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: state })
    await act(async () => document.dispatchEvent(new Event('visibilitychange')))
  }

  it('reacquires the screen lock after the browser releases it while asleep', async () => {
    const first = sentinel()
    request.mockResolvedValueOnce(first).mockResolvedValueOnce(sentinel())
    const { result } = renderHook(() => useWakeLock())
    await act(async () => result.current.request())
    expect(result.current.isActive).toBe(true)

    await visibility('hidden')
    await act(async () => first.release())
    expect(result.current.isActive).toBe(false)
    expect(result.current.isEnabled).toBe(true)
    await visibility('visible')

    expect(request).toHaveBeenCalledTimes(2)
    expect(result.current.isActive).toBe(true)
  })

  it('does not reacquire when the player explicitly turns it off', async () => {
    request.mockResolvedValue(sentinel())
    const { result } = renderHook(() => useWakeLock())
    await act(async () => result.current.request())
    await act(async () => result.current.release())
    await visibility('visible')
    expect(request).toHaveBeenCalledTimes(1)
    expect(result.current.isActive).toBe(false)
    expect(result.current.isEnabled).toBe(false)
  })

  it('lets the player turn the preference off while the browser has suspended the lock', async () => {
    const lock = sentinel()
    request.mockResolvedValue(lock)
    const { result } = renderHook(() => useWakeLock())
    await act(async () => result.current.request())
    await visibility('hidden')
    await act(async () => lock.release())
    await act(async () => result.current.toggle())
    await visibility('visible')
    expect(request).toHaveBeenCalledTimes(1)
    expect(result.current.isEnabled).toBe(false)
  })

  it('does not create duplicate locks for requests made before the first one settles', async () => {
    request.mockResolvedValue(sentinel())
    const { result } = renderHook(() => useWakeLock())
    await act(async () => {
      await Promise.all([result.current.request(), result.current.request()])
    })
    expect(request).toHaveBeenCalledTimes(1)
  })

  it('releases a pending lock that arrives after the player turns it off', async () => {
    const lock = sentinel()
    let finish!: (value: typeof lock) => void
    request.mockReturnValue(new Promise((resolve) => { finish = resolve }))
    const { result } = renderHook(() => useWakeLock())
    let pending!: Promise<void>
    act(() => { pending = result.current.request() })
    await act(async () => result.current.release())
    await act(async () => { finish(lock); await pending })
    expect(lock.release).toHaveBeenCalledTimes(1)
    expect(result.current.isActive).toBe(false)
  })

  it('releases a pending lock that arrives after unmount', async () => {
    const lock = sentinel()
    let finish!: (value: typeof lock) => void
    request.mockReturnValue(new Promise((resolve) => { finish = resolve }))
    const { result, unmount } = renderHook(() => useWakeLock())
    let pending!: Promise<void>
    act(() => { pending = result.current.request() })
    unmount()
    await act(async () => { finish(lock); await pending })
    expect(lock.release).toHaveBeenCalledTimes(1)
  })

  it('does not let a cancelled request overwrite a newer active lock', async () => {
    const oldLock = sentinel()
    const newLock = sentinel()
    let finish!: (value: typeof oldLock) => void
    request.mockReturnValueOnce(new Promise((resolve) => { finish = resolve })).mockResolvedValueOnce(newLock)
    const { result } = renderHook(() => useWakeLock())
    let pending!: Promise<void>
    act(() => { pending = result.current.request() })
    await act(async () => result.current.release())
    await act(async () => result.current.request())
    await act(async () => { finish(oldLock); await pending })
    expect(oldLock.release).toHaveBeenCalledTimes(1)
    expect(newLock.release).not.toHaveBeenCalled()
    expect(result.current.isActive).toBe(true)
    await act(async () => result.current.release())
    expect(newLock.release).toHaveBeenCalledTimes(1)
  })

  it('retries a temporarily denied request when the page returns to the foreground', async () => {
    request.mockRejectedValueOnce(new Error('Low battery')).mockResolvedValueOnce(sentinel())
    const { result } = renderHook(() => useWakeLock())
    await act(async () => result.current.request())
    expect(result.current.isActive).toBe(false)
    await visibility('visible')
    expect(result.current.isActive).toBe(true)
  })
})
