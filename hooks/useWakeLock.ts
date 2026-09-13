'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseWakeLockReturn {
  isSupported: boolean
  isActive: boolean
  isEnabled: boolean
  request: () => Promise<void>
  release: () => Promise<void>
  toggle: () => Promise<void>
}

/**
 * Hook for Screen Wake Lock API
 * Prevents the screen from dimming or locking while active
 * Useful for game tracking where users need to see the screen
 */
export function useWakeLock(): UseWakeLockReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const desiredRef = useRef(false)
  const mountedRef = useRef(false)
  const generationRef = useRef(0)
  const pendingRef = useRef<Promise<void> | null>(null)

  const acquire = useCallback(async () => {
    if (!mountedRef.current || !desiredRef.current || !('wakeLock' in navigator)) return
    if (document.visibilityState !== 'visible' || wakeLockRef.current) return
    if (pendingRef.current) return pendingRef.current

    const generation = generationRef.current
    const pending = (async () => {
      try {
        const lock = await navigator.wakeLock.request('screen')
        // Requests can settle after a toggle, route change, or screen lock.
        if (!mountedRef.current || !desiredRef.current || generation !== generationRef.current || document.visibilityState !== 'visible') {
          await lock.release()
          return
        }
        if (lock.released) return
        wakeLockRef.current = lock
        lock.addEventListener('release', () => {
          if (wakeLockRef.current !== lock) return
          wakeLockRef.current = null
          if (mountedRef.current) setIsActive(false)
        })
        setIsActive(true)
      } catch {
        // Keep the user's preference so a foreground return can retry a
        // temporary denial (for example, the device's battery policy).
        if (mountedRef.current && generation === generationRef.current) setIsActive(false)
      }
    })()
    pendingRef.current = pending
    await pending
    if (pendingRef.current === pending) pendingRef.current = null
  }, [])

  // The preference survives automatic release; actual lock status does not.
  useEffect(() => {
    mountedRef.current = true
    setIsSupported('wakeLock' in navigator)
    const handleVisibilityChange = () => { void acquire() }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      mountedRef.current = false
      desiredRef.current = false
      generationRef.current += 1
      pendingRef.current = null
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      const lock = wakeLockRef.current
      wakeLockRef.current = null
      if (lock) void lock.release().catch(() => {})
    }
  }, [acquire])

  const request = useCallback(async () => {
    if (!mountedRef.current || !('wakeLock' in navigator)) return
    desiredRef.current = true
    setIsEnabled(true)
    await acquire()
  }, [acquire])

  const release = useCallback(async () => {
    desiredRef.current = false
    generationRef.current += 1
    pendingRef.current = null
    const lock = wakeLockRef.current
    wakeLockRef.current = null
    if (mountedRef.current) {
      setIsEnabled(false)
      setIsActive(false)
    }
    if (lock) await lock.release().catch(() => {})
  }, [])

  const toggle = useCallback(async () => {
    if (desiredRef.current) {
      await release()
    } else {
      await request()
    }
  }, [request, release])

  return {
    isSupported,
    isActive,
    isEnabled,
    request,
    release,
    toggle,
  }
}
