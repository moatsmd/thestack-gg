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
    <div className="rounded-lg border border-white/10 bg-white dark:bg-[var(--surface-1)] p-4 shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-[var(--ink)]">Official Rulings</h3>

      {error && <ErrorBanner message={error} />}

      {isLoading && (
        <div className="text-sm text-[var(--muted)]">Loading rulings...</div>
      )}

      {!isLoading && !error && rulings.length === 0 && (
        <div className="text-sm text-[var(--muted)]">No rulings available.</div>
      )}

      {!isLoading && !error && rulings.length > 0 && (
        <ul className="space-y-3">
          {rulings.map((ruling) => (
            <li key={`${ruling.oracle_id}-${ruling.published_at}`} className="space-y-1">
              <div className="text-xs font-semibold text-[var(--muted)]">
                {ruling.published_at}
              </div>
              <div className="text-sm text-[var(--ink)]">{ruling.comment}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
