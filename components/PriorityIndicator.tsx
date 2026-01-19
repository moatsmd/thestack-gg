'use client'

import type { StackPlayer } from '@/types/stack'

interface PriorityIndicatorProps {
  players: StackPlayer[]
  priorityPlayerId: string
  onPass: () => void
}

export function PriorityIndicator({ players, priorityPlayerId, onPass }: PriorityIndicatorProps) {
  if (players.length <= 1) {
    return null
  }

  const currentPlayer = players.find((player) => player.id === priorityPlayerId)

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Priority</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          {currentPlayer?.name || 'Unknown'}
        </p>
      </div>
      <button
        type="button"
        onClick={onPass}
        className="min-h-tap px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
      >
        Pass
      </button>
    </div>
  )
}
