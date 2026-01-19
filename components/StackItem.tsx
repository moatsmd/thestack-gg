'use client'

import { useState } from 'react'
import type { StackItem } from '@/types/stack'
import { StackItemBadge } from '@/components/StackItemBadge'

interface StackItemProps {
  item: StackItem
  controllerName: string
  isTop: boolean
  isResolving: boolean
}

export function StackItem({ item, controllerName, isTop, isResolving }: StackItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className={`stack-item-card rounded-xl border border-white/10 bg-white dark:bg-[var(--surface-1)] ${
        isTop ? 'stack-item-top ring-2 ring-[var(--accent-1)]/40' : ''
      } ${isResolving ? 'stack-item-resolving' : ''}`}
      data-testid="stack-item"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <StackItemBadge type={item.type} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {item.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
          >
            {isExpanded ? 'Hide' : 'Details'}
          </button>
        </div>

        <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <p>Controller: {controllerName}</p>
          <p>
            Target:{' '}
            <span className={item.targetDescription ? '' : 'text-gray-400 dark:text-gray-500'}>
              {item.targetDescription || 'No target'}
            </span>
          </p>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
            {item.oracleText && (
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 whitespace-pre-wrap">
                {item.oracleText}
              </div>
            )}
            {item.imageUri && (
              <div className="w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <img
                  src={item.imageUri}
                  alt={item.name}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
