'use client'

import Link from 'next/link'
import { KeywordDefinition } from '@/lib/keywords-data'

interface KeywordCardProps {
  keyword: KeywordDefinition
}

const typeBadgeColor: Record<KeywordDefinition['type'], string> = {
  ability: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  action: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  mechanic: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
}

const tierDot: Record<KeywordDefinition['tier'], { dot: string; label: string }> = {
  evergreen: { dot: 'bg-green-500', label: 'Evergreen' },
  returning: { dot: 'bg-blue-500', label: 'Returning' },
  retired: { dot: 'bg-gray-400', label: 'Retired' },
}

export function KeywordCard({ keyword }: KeywordCardProps) {
  const { dot, label } = tierDot[keyword.tier]

  return (
    <div
      className="bg-white dark:bg-[var(--surface-1)] border border-white/10 rounded-lg p-4 shadow-sm hover:shadow-md transition"
      data-testid="keyword-card"
    >
      {/* Name, type badge, tier dot */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-[var(--ink)]">{keyword.keyword}</h3>
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`}
            title={label}
            role="img"
            aria-label={`Tier: ${label}`}
            data-testid="tier-badge"
          />
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-semibold uppercase ${typeBadgeColor[keyword.type]}`}
        >
          {keyword.type}
        </span>
      </div>

      {/* Definition */}
      <p className="text-[var(--muted)] mb-2">{keyword.definition}</p>

      {/* Reminder Text */}
      {keyword.reminder && (
        <p className="text-sm text-[var(--muted)] italic mb-2">({keyword.reminder})</p>
      )}

      {/* Example and Introduced */}
      <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)] mb-2">
        {keyword.example && (
          <div>
            <span className="font-semibold">Example: </span>
            <span>{keyword.example}</span>
          </div>
        )}
        {keyword.introduced && (
          <div>
            <span className="font-semibold">Introduced: </span>
            <span>{keyword.introduced}</span>
          </div>
        )}
      </div>

      {/* Scryfall link */}
      {keyword.scryfallQuery && (
        <Link
          href={`/toolkit?q=${encodeURIComponent(keyword.scryfallQuery)}`}
          className="text-xs text-[var(--accent-2)] hover:underline"
          data-testid="scryfall-link"
        >
          See cards →
        </Link>
      )}
    </div>
  )
}
