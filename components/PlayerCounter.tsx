'use client'

import { useEffect, useState } from 'react'
import { CommanderDamage, ExtraCounterType, ManaPool, EXTRA_COUNTER_CONFIG } from '@/types/game'

interface PlayerCounterProps {
  playerId: string
  playerName: string
  currentLife: number
  isSolo: boolean
  isCommander: boolean
  commanderDamage?: CommanderDamage[]
  poisonCounters?: number
  manaPool?: ManaPool
  enabledCounters?: ExtraCounterType[]
  extraCounters?: Record<ExtraCounterType, number>
  onLifeChange: (playerId: string, amount: number) => void
  onOpenCommanderDamage: (playerId: string) => void
  onOpenPoisonCounter: (playerId: string) => void
  onOpenManaPool: (playerId: string) => void
  onNameChange: (playerId: string, name: string) => void
  onExtraCounterChange: (playerId: string, counter: ExtraCounterType, delta: number) => void
}

export function PlayerCounter({
  playerId,
  playerName,
  currentLife,
  isSolo,
  isCommander,
  commanderDamage = [],
  poisonCounters = 0,
  manaPool,
  enabledCounters = [],
  extraCounters,
  onLifeChange,
  onOpenCommanderDamage,
  onOpenPoisonCounter,
  onOpenManaPool,
  onNameChange,
  onExtraCounterChange,
}: PlayerCounterProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(playerName)

  const maxCommanderDamage = commanderDamage.length > 0
    ? Math.max(...commanderDamage.map((entry) => entry.amount))
    : 0
  const commanderWarningLevel = maxCommanderDamage >= 21 ? 'danger' : maxCommanderDamage >= 18 ? 'warning' : 'none'
  const poisonWarningLevel = poisonCounters >= 10 ? 'danger' : poisonCounters >= 8 ? 'warning' : 'none'
  const totalMana = manaPool ? Object.values(manaPool).reduce((sum, n) => sum + n, 0) : 0

  useEffect(() => {
    if (!isEditingName) setNameDraft(playerName)
  }, [playerName, isEditingName])

  const handleNameSubmit = () => {
    const trimmed = nameDraft.trim()
    const nextName = trimmed.length > 0 ? trimmed : playerName
    onNameChange(playerId, nextName)
    setNameDraft(nextName)
    setIsEditingName(false)
  }

  const lifeColorClass = currentLife < 0 ? 'text-red-600 dark:text-red-400' : 'text-[var(--ink)]'
  const lifeSizeClass = isSolo ? 'text-9xl' : 'text-6xl'

  return (
    <div
      className="arcane-panel mana-border flex flex-col items-center justify-center h-full p-4 rounded-2xl transition"
      data-testid="player-card"
    >
      {/* Name row */}
      <div className="flex items-center gap-2 mb-4">
        {isEditingName ? (
          <input
            aria-label="Player name"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); handleNameSubmit() }
            }}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-base font-semibold text-gray-700 focus:border-gray-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
        ) : (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setNameDraft(playerName); setIsEditingName(true) }}
            className="text-xl font-semibold text-[var(--muted)] hover:text-[var(--ink)]"
            aria-label="Edit player name"
          >
            {playerName}
          </button>
        )}
        {isCommander && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenCommanderDamage(playerId) }}
            className="rounded-full border border-white/10 px-2 py-1 text-xs font-semibold text-[var(--muted)]"
            aria-label="Open commander damage"
          >
            CMD
          </button>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenPoisonCounter(playerId) }}
          className="rounded-full border border-white/10 px-2 py-1 text-xs font-semibold text-[var(--muted)]"
          aria-label="Open poison counters"
        >
          ☠️
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenManaPool(playerId) }}
          className="rounded-full border border-white/10 px-2 py-1 text-xs font-semibold text-[var(--muted)]"
          aria-label="Open mana pool"
        >
          💎
        </button>
      </div>

      {/* Life total */}
      <div className={`font-bold ${lifeSizeClass} ${lifeColorClass} mb-4 drop-shadow-sm`}>
        {currentLife}
      </div>

      {/* Commander damage badge */}
      {isCommander && maxCommanderDamage > 0 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenCommanderDamage(playerId) }}
          className={`rounded-full px-4 py-2 text-sm font-semibold mb-4 cursor-pointer hover:opacity-80 transition ${
            commanderWarningLevel === 'danger'
              ? 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-100'
              : commanderWarningLevel === 'warning'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-100'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
          }`}
          data-testid="commander-damage-badge"
          aria-label="Open commander damage"
        >
          ⚔️ {maxCommanderDamage} CMD Damage (max)
        </button>
      )}

      {/* Poison badge */}
      {poisonCounters > 0 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenPoisonCounter(playerId) }}
          className={`rounded-full px-4 py-2 text-sm font-semibold mb-4 cursor-pointer hover:opacity-80 transition ${
            poisonWarningLevel === 'danger'
              ? 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-100'
              : poisonWarningLevel === 'warning'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-100'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
          }`}
          data-testid="poison-badge"
          aria-label="Open poison counters"
        >
          ☠️ {poisonCounters} Poison
        </button>
      )}

      {/* Mana badge */}
      {totalMana > 0 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenManaPool(playerId) }}
          className="rounded-full px-4 py-2 text-sm font-semibold mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-100 cursor-pointer hover:opacity-80 transition"
          data-testid="mana-badge"
          aria-label="Open mana pool"
        >
          💎 {totalMana} Mana
        </button>
      )}

      {/* Extra counter rows */}
      {enabledCounters.length > 0 && (
        <div
          className="w-full max-w-md space-y-1 mb-4"
          onClick={(e) => e.stopPropagation()}
        >
          {enabledCounters.map((counterType) => {
            const { symbol, label } = EXTRA_COUNTER_CONFIG[counterType]
            const value = extraCounters?.[counterType] ?? 0
            return (
              <div
                key={counterType}
                className="flex items-center justify-between gap-2 px-3 py-1 rounded-lg bg-[var(--surface-2)]"
                data-testid={`extra-counter-${counterType}`}
              >
                <span className="text-sm font-medium text-[var(--muted)]">
                  {symbol} {label}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onExtraCounterChange(playerId, counterType, -1)}
                    className="w-7 h-7 rounded-full bg-[var(--accent-3)] text-white font-bold hover:opacity-80 transition"
                    aria-label={`Decrease ${label}`}
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-bold text-[var(--ink)]">{value}</span>
                  <button
                    type="button"
                    onClick={() => onExtraCounterChange(playerId, counterType, 1)}
                    className="w-7 h-7 rounded-full bg-[var(--accent-2)] text-gray-900 font-bold hover:opacity-80 transition"
                    aria-label={`Increase ${label}`}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Life controls */}
      <div className="flex gap-4 w-full max-w-md">
        <button
          onClick={(e) => { e.stopPropagation(); onLifeChange(playerId, -1) }}
          className="flex-1 bg-[var(--accent-3)] text-white text-4xl font-bold py-8 rounded-lg hover:bg-[var(--accent-3)]/90 active:bg-[var(--accent-3)] transition min-h-tap"
          aria-label="-"
        >
          -
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onLifeChange(playerId, 1) }}
          className="flex-1 bg-[var(--accent-2)] text-gray-900 text-4xl font-bold py-8 rounded-lg hover:bg-[var(--accent-2)]/90 active:bg-[var(--accent-2)] transition min-h-tap"
          aria-label="+"
        >
          +
        </button>
      </div>
    </div>
  )
}
