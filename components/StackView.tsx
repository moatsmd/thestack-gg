'use client'

import type { StackItem, StackPlayer } from '@/types/stack'
import { StackItem } from '@/components/StackItem'

interface StackViewProps {
  items: StackItem[]
  players: StackPlayer[]
  resolvingId?: string | null
}

export function StackView({ items, players, resolvingId }: StackViewProps) {
  const playersById = new Map(players.map((player) => [player.id, player.name]))
  const ordered = [...items].reverse()

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/40 p-6 text-center text-gray-500 dark:text-gray-400">
        Stack is empty. Add a spell or ability to start.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {ordered.map((item, index) => (
        <StackItem
          key={item.id}
          item={item}
          controllerName={playersById.get(item.controllerId) || 'Unknown'}
          isTop={index === 0}
          isResolving={Boolean(resolvingId && item.id === resolvingId)}
        />
      ))}
    </div>
  )
}
