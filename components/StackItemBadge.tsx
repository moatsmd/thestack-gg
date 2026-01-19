'use client'

import type { StackItemType } from '@/types/stack'

const TYPE_STYLES: Record<StackItemType, { label: string; className: string }> = {
  spell: {
    label: 'Spell',
    className: 'bg-blue-600/90 text-white',
  },
  activated: {
    label: 'Activated',
    className: 'bg-amber-500/90 text-gray-900',
  },
  triggered: {
    label: 'Triggered',
    className: 'bg-emerald-600/90 text-white',
  },
}

interface StackItemBadgeProps {
  type: StackItemType
}

export function StackItemBadge({ type }: StackItemBadgeProps) {
  const style = TYPE_STYLES[type]

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold tracking-wide ${style.className}`}>
      {style.label}
    </span>
  )
}
