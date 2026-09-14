'use client'

import { useEffect, useRef, useState } from 'react'
import { TOKENS } from '@/lib/tokens-data'

type Counts = Record<string, number>
const KEY = 'thestack-token-tray-v1'
const names = new Set(TOKENS.map(token => token.name))

export function useTokenTray() {
  const [counts, setCounts] = useState<Counts>({})
  const current = useRef<Counts>({})
  const previous = useRef<Counts | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [ready, setReady] = useState(false)
  const [storageError, setStorageError] = useState(false)

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || 'null')
      const valid: Counts = {}
      if (data?.version === 1 && data.counts && typeof data.counts === 'object') {
        for (const [name, count] of Object.entries(data.counts)) {
          if (names.has(name) && typeof count === 'number' && Number.isInteger(count) && count > 0 && count <= 999) valid[name] = count
        }
      }
      current.current = valid
      setCounts(valid)
    } catch { setStorageError(true) }
    setReady(true)
  }, [])

  function save(next: Counts) {
    current.current = next
    setCounts(next)
    try { localStorage.setItem(KEY, JSON.stringify({ version: 1, counts: next })); setStorageError(false) }
    catch { setStorageError(true) }
  }

  function change(name: string, delta: number) {
    if (!ready || !names.has(name) || !Number.isInteger(delta)) return
    const next = { ...current.current }
    const count = Math.max(0, Math.min(999, (next[name] || 0) + delta))
    if (count) next[name] = count
    else delete next[name]
    previous.current = null
    setCanUndo(false)
    save(next)
  }

  function clear() {
    previous.current = { ...current.current }
    setCanUndo(true)
    save({})
  }

  function undoClear() {
    if (previous.current) save(previous.current)
    previous.current = null
    setCanUndo(false)
  }

  return { counts, ready, storageError, canUndo, change, clear, undoClear }
}
