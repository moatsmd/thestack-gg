'use client'

import { ScryfallRuling } from '@/types/scryfall'
import { ErrorBanner } from './ErrorBanner'

interface CardRulingsProps {
  rulings: ScryfallRuling[]
  isLoading: boolean
  error: string | null
}

export function CardRulings({ rulings, isLoading, error }: CardRulingsProps) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Official Rulings</h3>

      {error && <ErrorBanner message={error} />}

      {isLoading && (
        <div className="text-sm text-gray-600 dark:text-gray-300">Loading rulings...</div>
      )}

      {!isLoading && !error && rulings.length === 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-300">No rulings available.</div>
      )}

      {!isLoading && !error && rulings.length > 0 && (
        <ul className="space-y-3">
          {rulings.map((ruling) => (
            <li key={`${ruling.oracle_id}-${ruling.published_at}`} className="space-y-1">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {ruling.published_at}
              </div>
              <div className="text-sm text-gray-800 dark:text-gray-200">{ruling.comment}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
