'use client'

import { KeywordDefinition } from '@/lib/keywords-data'

interface KeywordCardProps {
  keyword: KeywordDefinition
}

export function KeywordCard({ keyword }: KeywordCardProps) {
  const typeBadgeColor = {
    ability: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    action: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    mechanic: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
  }

  return (
    <div
      className="bg-white dark:bg-[var(--surface-1)] border border-white/10 rounded-lg p-4 shadow-sm hover:shadow-md transition"
      data-testid="keyword-card"
    >
      {/* Keyword Name and Type Badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-lg font-bold text-[var(--ink)]">{keyword.keyword}</h3>
        <span
          className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
            typeBadgeColor[keyword.type]
          }`}
        >
          {keyword.type}
        </span>
      </div>

      {/* Definition */}
      <p className="text-[var(--muted)] mb-2">{keyword.definition}</p>

      {/* Reminder Text */}
      {keyword.reminder && (
        <p className="text-sm text-[var(--muted)] italic mb-2">
          ({keyword.reminder})
        </p>
      )}

      {/* Example and Introduced */}
      <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
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
    </div>
  )
}
