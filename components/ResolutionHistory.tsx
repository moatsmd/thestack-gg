'use client'

import { useState } from 'react'
import type { ResolvedItem, StackPlayer } from '@/types/stack'
import { StackItemBadge } from '@/components/StackItemBadge'

interface ResolutionHistoryProps {
  items: ResolvedItem[]
  players: StackPlayer[]
}

export function ResolutionHistory({ items, players }: ResolutionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const playersById = new Map(players.map((player) => [player.id, player.name]))

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Resolution History
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {items.length} resolved
          </p>
        </div>
        <span className="text-blue-600 dark:text-blue-300 font-semibold">
          {isOpen ? 'Hide' : 'Show'}
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 pb-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 pt-3">
              Nothing has resolved yet.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <StackItemBadge type={item.type} />
                    <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {playersById.get(item.controllerId) || 'Unknown'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
