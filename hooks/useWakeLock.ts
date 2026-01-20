'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseWakeLockReturn {
  isSupported: boolean
  isActive: boolean
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
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  // Check if Wake Lock API is supported
  useEffect(() => {
    setIsSupported('wakeLock' in navigator)
  }, [])

  // Re-acquire wake lock when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isActive && !wakeLockRef.current) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
          wakeLockRef.current.addEventListener('release', () => {
            wakeLockRef.current = null
          })
        } catch {
          // Wake lock request failed (e.g., low battery)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isActive])

  const request = useCallback(async () => {
    if (!isSupported) return

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
      wakeLockRef.current.addEventListener('release', () => {
        wakeLockRef.current = null
        setIsActive(false)
      })
      setIsActive(true)
    } catch {
      // Wake lock request failed
      setIsActive(false)
    }
  }, [isSupported])

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release()
        wakeLockRef.current = null
        setIsActive(false)
      } catch {
        // Release failed
      }
    }
  }, [])

  const toggle = useCallback(async () => {
    if (isActive) {
      await release()
    } else {
      await request()
    }
  }, [isActive, request, release])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {})
      }
    }
  }, [])

  return {
    isSupported,
    isActive,
    request,
    release,
    toggle,
  }
}
