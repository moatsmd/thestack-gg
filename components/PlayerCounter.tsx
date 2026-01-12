'use client'

import { useEffect, useState } from 'react'
import { CommanderDamage, ManaPool } from '@/types/game'

interface PlayerCounterProps {
  playerId: string
  playerName: string
  currentLife: number
  isSolo: boolean
  isCommander: boolean
  commanderDamage?: CommanderDamage[]
  poisonCounters?: number
  manaPool?: ManaPool
  onLifeChange: (playerId: string, amount: number) => void
  onOpenCommanderDamage: (playerId: string) => void
  onOpenPoisonCounter: (playerId: string) => void
  onOpenManaPool: (playerId: string) => void
  onNameChange: (playerId: string, name: string) => void
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
  onLifeChange,
  onOpenCommanderDamage,
  onOpenPoisonCounter,
  onOpenManaPool,
  onNameChange,
}: PlayerCounterProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(playerName)

  const maxCommanderDamage = commanderDamage.length > 0
    ? Math.max(...commanderDamage.map((entry) => entry.amount))
    : 0
  const commanderWarningLevel = maxCommanderDamage >= 21 ? 'danger' : maxCommanderDamage >= 18 ? 'warning' : 'none'

  const poisonWarningLevel = poisonCounters >= 10 ? 'danger' : poisonCounters >= 8 ? 'warning' : 'none'

  const totalMana = manaPool
    ? Object.values(manaPool).reduce((sum, amount) => sum + amount, 0)
    : 0

  useEffect(() => {
    if (!isEditingName) {
      setNameDraft(playerName)
    }
  }, [playerName, isEditingName])

  const handleIncrement = () => {
    onLifeChange(playerId, 1)
  }

  const handleDecrement = () => {
    onLifeChange(playerId, -1)
  }

  const handleOpenCommanderDamage = () => {
    if (isCommander) {
      onOpenCommanderDamage(playerId)
    }
  }

  const handleNameSubmit = () => {
    const trimmed = nameDraft.trim()
    const nextName = trimmed.length > 0 ? trimmed : playerName
    onNameChange(playerId, nextName)
    setNameDraft(nextName)
    setIsEditingName(false)
  }

  const lifeColorClass = currentLife < 0 ? 'text-red-600' : 'text-gray-900'
  const lifeSizeClass = isSolo ? 'text-9xl' : 'text-6xl'

  return (
    <div
      className="flex flex-col items-center justify-center h-full p-4"
      data-testid="player-card"
      onClick={handleOpenCommanderDamage}
      role={isCommander ? 'button' : undefined}
      tabIndex={isCommander ? 0 : undefined}
      onKeyDown={(event) => {
        if (!isCommander) {
          return
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpenCommanderDamage(playerId)
        }
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        {isEditingName ? (
          <input
            aria-label="Player name"
            value={nameDraft}
            onChange={(event) => setNameDraft(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            onBlur={handleNameSubmit}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                event.stopPropagation()
                handleNameSubmit()
              }
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-base font-semibold text-gray-700 focus:border-gray-500 focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              setNameDraft(playerName)
              setIsEditingName(true)
            }}
            className="text-xl font-semibold text-gray-600"
            aria-label="Edit player name"
          >
            {playerName}
          </button>
        )}
        {isCommander && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onOpenCommanderDamage(playerId)
            }}
            className="rounded-full border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-500"
            aria-label="Open commander damage"
          >
            CMD
          </button>
        )}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onOpenPoisonCounter(playerId)
          }}
          className="rounded-full border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-500"
          aria-label="Open poison counters"
        >
          ☠️
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onOpenManaPool(playerId)
          }}
          className="rounded-full border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-500"
          aria-label="Open mana pool"
        >
          💎
        </button>
      </div>

      {/* Life total */}
      <div className={`font-bold ${lifeSizeClass} ${lifeColorClass} mb-4`}>
        {currentLife}
      </div>

      {/* Commander damage badge */}
      {isCommander && maxCommanderDamage > 0 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onOpenCommanderDamage(playerId)
          }}
          className={`rounded-full px-4 py-2 text-sm font-semibold mb-4 cursor-pointer hover:opacity-80 transition ${
            commanderWarningLevel === 'danger'
              ? 'bg-red-100 text-red-700'
              : commanderWarningLevel === 'warning'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
          }`}
          data-testid="commander-damage-badge"
          aria-label="Open commander damage"
        >
          ⚔️ {maxCommanderDamage} CMD Damage (max)
        </button>
      )}

      {/* Poison counters badge */}
      {poisonCounters > 0 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onOpenPoisonCounter(playerId)
          }}
          className={`rounded-full px-4 py-2 text-sm font-semibold mb-4 cursor-pointer hover:opacity-80 transition ${
            poisonWarningLevel === 'danger'
              ? 'bg-red-100 text-red-700'
              : poisonWarningLevel === 'warning'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
          }`}
          data-testid="poison-badge"
          aria-label="Open poison counters"
        >
          ☠️ {poisonCounters} Poison
        </button>
      )}

      {/* Mana pool badge */}
      {totalMana > 0 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onOpenManaPool(playerId)
          }}
          className="rounded-full px-4 py-2 text-sm font-semibold mb-4 bg-purple-100 text-purple-700 cursor-pointer hover:opacity-80 transition"
          data-testid="mana-badge"
          aria-label="Open mana pool"
        >
          💎 {totalMana} Mana
        </button>
      )}

      {/* Controls */}
      <div className="flex gap-4 w-full max-w-md">
        <button
          onClick={(event) => {
            event.stopPropagation()
            handleDecrement()
          }}
          className="flex-1 bg-red-600 text-white text-4xl font-bold py-8 rounded-lg hover:bg-red-700 active:bg-red-800 transition min-h-tap"
          aria-label="-"
        >
          -
        </button>
        <button
          onClick={(event) => {
            event.stopPropagation()
            handleIncrement()
          }}
          className="flex-1 bg-green-600 text-white text-4xl font-bold py-8 rounded-lg hover:bg-green-700 active:bg-green-800 transition min-h-tap"
          aria-label="+"
        >
          +
        </button>
      </div>
    </div>
  )
}
