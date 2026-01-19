'use client'

import { Legality } from '@/types/scryfall'

interface CardLegalityDisplayProps {
  legalities: Record<string, Legality>
}

// Priority formats to show first
const PRIORITY_FORMATS = [
  'commander',
  'standard',
  'modern',
  'pioneer',
  'legacy',
  'vintage',
]

export function CardLegalityDisplay({ legalities }: CardLegalityDisplayProps) {
  // Sort formats: priority formats first, then alphabetically
  const sortedEntries = Object.entries(legalities).sort(([formatA], [formatB]) => {
    const priorityA = PRIORITY_FORMATS.indexOf(formatA)
    const priorityB = PRIORITY_FORMATS.indexOf(formatB)

    // If both are priority formats, sort by priority order
    if (priorityA !== -1 && priorityB !== -1) {
      return priorityA - priorityB
    }

    // Priority formats come first
    if (priorityA !== -1) return -1
    if (priorityB !== -1) return 1

    // Otherwise, sort alphabetically
    return formatA.localeCompare(formatB)
  })

  // Filter out not_legal formats to save space
  const legalEntries = sortedEntries.filter(([, status]) => status !== 'not_legal')

  if (legalEntries.length === 0) {
    return (
      <div className="text-[var(--muted)] text-sm">
        Not legal in any format
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {legalEntries.map(([format, status]) => (
        <div
          key={format}
          data-testid={`legality-${format}`}
          data-status={status}
          className={`rounded-full px-3 py-1 text-sm font-medium text-center ${getLegalityStyles(status)}`}
        >
          {formatName(format)}
        </div>
      ))}
    </div>
  )
}

function getLegalityStyles(status: Legality): string {
  switch (status) {
    case 'legal':
      return 'bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-100'
    case 'banned':
      return 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-100'
    case 'restricted':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-100'
    case 'not_legal':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
  }
}

function formatName(format: string): string {
  // Capitalize first letter and handle special cases
  const formatted = format
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return formatted
}
