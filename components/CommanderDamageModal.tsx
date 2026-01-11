'use client'

import { useState } from 'react'
import { CommanderDamage } from '@/types/game'

interface OpponentInfo {
  id: string
  name: string
  commanderName?: string
}

interface CommanderDamageModalProps {
  isOpen: boolean
  playerName: string
  opponents: OpponentInfo[]
  commanderDamage: CommanderDamage[]
  onChange: (fromPlayerId: string, delta: number) => void
  onCommanderNameChange: (playerId: string, commanderName: string) => void
  onClose: () => void
}

export function CommanderDamageModal({
  isOpen,
  playerName,
  opponents,
  commanderDamage,
  onChange,
  onCommanderNameChange,
  onClose,
}: CommanderDamageModalProps) {
  const [editingCommanderId, setEditingCommanderId] = useState<string | null>(null)
  const [editCommanderName, setEditCommanderName] = useState('')

  if (!isOpen) {
    return null
  }

  const damageMap = new Map(commanderDamage.map((entry) => [entry.fromPlayerId, entry.amount]))
  const totalDamage = commanderDamage.reduce((sum, entry) => sum + entry.amount, 0)
  const warningLevel = totalDamage >= 21 ? 'danger' : totalDamage >= 18 ? 'warning' : 'none'

  const handleDecrease = (fromPlayerId: string, currentAmount: number) => {
    if (currentAmount <= 0) {
      return
    }
    onChange(fromPlayerId, -1)
  }

  const handleStartEditCommander = (playerId: string, currentName: string) => {
    setEditingCommanderId(playerId)
    setEditCommanderName(currentName)
  }

  const handleSaveCommanderName = (playerId: string) => {
    const trimmed = editCommanderName.trim()
    if (trimmed && trimmed !== 'Commander') {
      onCommanderNameChange(playerId, trimmed)
    } else if (!trimmed) {
      onCommanderNameChange(playerId, '')
    }
    setEditingCommanderId(null)
    setEditCommanderName('')
  }

  const handleCancelEditCommander = () => {
    setEditingCommanderId(null)
    setEditCommanderName('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-lg">
        <div className="flex items-start justify-between border-b border-gray-200 px-4 py-3">
          <div className="text-lg font-semibold text-gray-900">{playerName}&apos;s Commander Damage</div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 rounded-md px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
            aria-label="Close commander damage"
          >
            Close
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">
          <div
            data-testid="commander-total"
            data-warning-level={warningLevel}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${
              warningLevel === 'danger'
                ? 'bg-red-100 text-red-700'
                : warningLevel === 'warning'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            Total: {totalDamage}
          </div>

          <div className="space-y-3">
            {opponents.map((opponent) => {
              const amount = damageMap.get(opponent.id) ?? 0
              const commanderLabel = opponent.commanderName ?? 'Commander'
              const isEditingThisCommander = editingCommanderId === opponent.id

              return (
                <div
                  key={opponent.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      From {opponent.name}&apos;s{' '}
                      {isEditingThisCommander ? (
                        <input
                          type="text"
                          value={editCommanderName}
                          onChange={(e) => setEditCommanderName(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onBlur={() => handleSaveCommanderName(opponent.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              e.stopPropagation()
                              handleSaveCommanderName(opponent.id)
                            } else if (e.key === 'Escape') {
                              e.preventDefault()
                              e.stopPropagation()
                              handleCancelEditCommander()
                            }
                          }}
                          autoFocus
                          className="inline-block w-32 rounded border border-gray-300 px-2 py-1 text-sm"
                          placeholder="Commander"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartEditCommander(opponent.id, commanderLabel)}
                          className="inline-block rounded px-1 hover:bg-gray-100"
                        >
                          {commanderLabel}
                        </button>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{amount}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDecrease(opponent.id, amount)}
                      className="min-h-tap min-w-tap rounded-md bg-gray-200 px-3 py-2 text-lg font-bold text-gray-700 hover:bg-gray-300"
                      aria-label={`Decrease damage from ${opponent.name}`}
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange(opponent.id, 1)}
                      className="min-h-tap min-w-tap rounded-md bg-gray-900 px-3 py-2 text-lg font-bold text-white hover:bg-gray-800"
                      aria-label={`Increase damage from ${opponent.name}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
