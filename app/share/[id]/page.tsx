'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import type { GameState } from '@/types/game'

const POLL_INTERVAL_MS = 1000

export default function SharedGamePage() {
  const params = useParams<{ id: string }>()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading')
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true
    let interval: number | null = null

    const fetchState = async () => {
      try {
        const response = await fetch(`/api/share/${params.id}`, { cache: 'no-store' })
        if (response.status === 404) {
          if (isMounted) {
            setStatus('missing')
          }
          return
        }
        if (!response.ok) {
          return
        }
        const data = await response.json()
        if (isMounted) {
          setGameState(data.state as GameState)
          setLastUpdated(data.updatedAt)
          setStatus('ready')
        }
      } catch {
        if (isMounted) {
          setStatus('loading')
        }
      }
    }

    fetchState()
    interval = window.setInterval(fetchState, POLL_INTERVAL_MS)

    return () => {
      isMounted = false
      if (interval) {
        window.clearInterval(interval)
      }
    }
  }, [params.id])

  if (status === 'missing') {
    return (
      <div className="min-h-screen arcane-shell text-[var(--ink)] flex items-center justify-center px-4">
        <div className="arcane-panel mana-border rounded-2xl p-6 text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Session ended</p>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Share link expired</h1>
          <p className="text-sm text-[var(--muted)]">
            Ask the host to share a new game state.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'loading' || !gameState) {
    return (
      <div className="min-h-screen arcane-shell text-[var(--ink)] flex items-center justify-center px-4">
        <div className="arcane-panel mana-border rounded-2xl p-6 text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Loading</p>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Syncing game state</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen arcane-shell text-[var(--ink)] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="arcane-panel mana-border rounded-3xl px-6 py-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Live view</p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--ink)]">
            Shared Game State
          </h1>
          <div className="frame-divider mt-3 w-20" />
          <p className="mt-3 text-sm text-[var(--muted)]">
            This view updates every second. Only the host can edit.
          </p>
          {lastUpdated && (
            <p className="mt-2 text-xs text-[var(--muted)]">
              Last update: {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {gameState.players.map((player) => (
            <div
              key={player.id}
              className="arcane-panel mana-border rounded-2xl p-6 text-center"
            >
              <p className="text-sm text-[var(--muted)]">{player.name}</p>
              <p className="mt-3 text-5xl font-semibold text-[var(--ink)]">
                {player.currentLife}
              </p>
              {gameState.gameType === 'commander' && (
                <p className="mt-2 text-xs text-[var(--muted)]">Commander</p>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
