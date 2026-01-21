'use client'

import { useState } from 'react'
import { GameState, GameType } from '@/types/game'

interface GameSetupProps {
  onStartGame: (gameState: GameState) => void
}

export function GameSetup({ onStartGame }: GameSetupProps) {
  const [setupStep, setSetupStep] = useState<'mode' | 'solo-type' | 'multi-players' | 'multi-type'>('mode')
  const [playerCount, setPlayerCount] = useState(2)

  const stepIndex = setupStep === 'mode'
    ? 1
    : setupStep === 'solo-type' || setupStep === 'multi-players'
      ? 2
      : 3

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3].map((step) => (
        <span
          key={step}
          className={`h-3 w-3 rotate-45 border border-white/30 ${
            step <= stepIndex ? 'bg-[var(--accent-1)]' : 'bg-transparent'
          }`}
        />
      ))}
    </div>
  )

  const createGameState = (mode: 'solo' | 'multiplayer', gameType: GameType, playerCount: number): GameState => {
    const startingLife = gameType === 'standard' ? 20 : gameType === 'commander' ? 40 : 20

    const players = Array.from({ length: playerCount }, (_, i) => ({
      id: `player-${i + 1}`,
      name: mode === 'solo' ? 'You' : `Player ${i + 1}`,
      currentLife: startingLife,
      lifeHistory: [],
    }))

    return {
      mode,
      gameType,
      startingLife,
      players,
      createdAt: new Date(),
    }
  }

  const handleSoloMode = (gameType: GameType) => {
    const gameState = createGameState('solo', gameType, 1)
    onStartGame(gameState)
  }

  const handleMultiplayerStart = (gameType: GameType) => {
    const gameState = createGameState('multiplayer', gameType, playerCount)
    onStartGame(gameState)
  }

  if (setupStep === 'mode') {
    return (
      <div className="min-h-screen arcane-shell text-[var(--ink)] px-4 py-10">

        <div className="mx-auto flex max-w-xl flex-col gap-6">
          <header className="arcane-panel mana-border rounded-3xl px-6 py-8 text-center">
            <p className="text-xs uppercase tracking-[0.5em] text-[var(--muted)]">Life tracker</p>
            <h1 className="mt-3 text-4xl font-semibold text-[var(--ink)]">Choose a Mode</h1>
            <div className="frame-divider mt-4 w-20 mx-auto" />
            <div className="mt-4">
              <StepIndicator />
            </div>
            <p className="mt-4 text-[var(--muted)]">
              Track your life totals solo or manage a full table with commander support.
            </p>
          </header>

          <div className="space-y-4">
            <button
              onClick={() => setSetupStep('solo-type')}
              className="w-full arcane-panel mana-border rounded-2xl px-6 py-6 text-left hover:bg-white/5 transition min-h-tap"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Solo</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">Track My Life</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Best for quick testing or goldfishing.
              </p>
            </button>

            <button
              onClick={() => setSetupStep('multi-players')}
              className="w-full arcane-panel mana-border rounded-2xl px-6 py-6 text-left hover:bg-white/5 transition min-h-tap"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Multiplayer</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">Track Game (2–4)</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Manage a full pod with commander tools.
              </p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (setupStep === 'solo-type') {
    return (
      <div className="min-h-screen arcane-shell text-[var(--ink)] px-4 py-10">

        <div className="mx-auto flex max-w-xl flex-col gap-6">
          <header className="arcane-panel mana-border rounded-3xl px-6 py-8 text-center">
            <p className="text-xs uppercase tracking-[0.5em] text-[var(--muted)]">Solo</p>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--ink)]">Select Game Mode</h2>
            <div className="frame-divider mt-4 w-20 mx-auto" />
            <div className="mt-4">
              <StepIndicator />
            </div>
          </header>

          <div className="space-y-4">
            <button
              onClick={() => handleSoloMode('standard')}
              className="w-full arcane-panel mana-border rounded-2xl px-6 py-5 text-left hover:bg-white/5 transition min-h-tap"
            >
              <p className="text-sm font-semibold text-[var(--ink)]">Standard</p>
              <p className="text-xs text-[var(--muted)]">20 life</p>
            </button>

            <button
              onClick={() => handleSoloMode('commander')}
              className="w-full arcane-panel mana-border rounded-2xl px-6 py-5 text-left hover:bg-white/5 transition min-h-tap"
            >
              <p className="text-sm font-semibold text-[var(--ink)]">Commander</p>
              <p className="text-xs text-[var(--muted)]">40 life</p>
            </button>

            <button
              onClick={() => handleSoloMode('custom')}
              className="w-full arcane-panel mana-border rounded-2xl px-6 py-5 text-left hover:bg-white/5 transition min-h-tap"
            >
              <p className="text-sm font-semibold text-[var(--ink)]">Custom</p>
              <p className="text-xs text-[var(--muted)]">Pick your own totals</p>
            </button>
          </div>

          <button
            onClick={() => setSetupStep('mode')}
            className="self-center min-h-tap rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/5 transition"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  if (setupStep === 'multi-players') {
    return (
      <div className="min-h-screen arcane-shell text-[var(--ink)] px-4 py-10">

        <div className="mx-auto flex max-w-xl flex-col gap-6">
          <header className="arcane-panel mana-border rounded-3xl px-6 py-8 text-center">
            <p className="text-xs uppercase tracking-[0.5em] text-[var(--muted)]">Multiplayer</p>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--ink)]">How Many Players?</h2>
            <div className="frame-divider mt-4 w-20 mx-auto" />
            <div className="mt-4">
              <StepIndicator />
            </div>
          </header>

          <div className="space-y-4">
            {[2, 3, 4].map((count) => (
              <button
                key={count}
                onClick={() => {
                  setPlayerCount(count)
                  setSetupStep('multi-type')
                }}
                className="w-full arcane-panel mana-border rounded-2xl px-6 py-5 text-left hover:bg-white/5 transition min-h-tap"
              >
                <p className="text-sm font-semibold text-[var(--ink)]">{count} Players</p>
                <p className="text-xs text-[var(--muted)]">Shared tracker on one device</p>
              </button>
            ))}
          </div>

          <button
            onClick={() => setSetupStep('mode')}
            className="self-center min-h-tap rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/5 transition"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  if (setupStep === 'multi-type') {
    return (
      <div className="min-h-screen arcane-shell text-[var(--ink)] px-4 py-10">

        <div className="mx-auto flex max-w-xl flex-col gap-6">
          <header className="arcane-panel mana-border rounded-3xl px-6 py-8 text-center">
            <p className="text-xs uppercase tracking-[0.5em] text-[var(--muted)]">Multiplayer</p>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--ink)]">Select Game Mode</h2>
            <div className="frame-divider mt-4 w-20 mx-auto" />
            <div className="mt-4">
              <StepIndicator />
            </div>
          </header>

          <div className="space-y-4">
            <button
              onClick={() => handleMultiplayerStart('standard')}
              className="w-full arcane-panel mana-border rounded-2xl px-6 py-5 text-left hover:bg-white/5 transition min-h-tap"
            >
              <p className="text-sm font-semibold text-[var(--ink)]">Standard</p>
              <p className="text-xs text-[var(--muted)]">20 life</p>
            </button>

            <button
              onClick={() => handleMultiplayerStart('commander')}
              className="w-full arcane-panel mana-border rounded-2xl px-6 py-5 text-left hover:bg-white/5 transition min-h-tap"
            >
              <p className="text-sm font-semibold text-[var(--ink)]">Commander</p>
              <p className="text-xs text-[var(--muted)]">40 life</p>
            </button>

            <button
              onClick={() => handleMultiplayerStart('custom')}
              className="w-full arcane-panel mana-border rounded-2xl px-6 py-5 text-left hover:bg-white/5 transition min-h-tap"
            >
              <p className="text-sm font-semibold text-[var(--ink)]">Custom</p>
              <p className="text-xs text-[var(--muted)]">Pick your own totals</p>
            </button>
          </div>

          <button
            onClick={() => setSetupStep('multi-players')}
            className="self-center min-h-tap rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/5 transition"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  return null
}
