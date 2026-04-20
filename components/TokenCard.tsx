'use client'

import Link from 'next/link'
import { TokenDefinition, TokenColor } from '@/types/tokens'

interface TokenCardProps {
  token: TokenDefinition
}

const colorPip: Record<TokenColor, { bg: string; label: string }> = {
  W: { bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200', label: 'W' },
  U: { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200', label: 'U' },
  B: { bg: 'bg-gray-800 text-gray-100 dark:bg-gray-900 dark:text-gray-100', label: 'B' },
  R: { bg: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200', label: 'R' },
  G: { bg: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200', label: 'G' },
  C: { bg: 'bg-[var(--surface-2)] text-[var(--muted)]', label: 'C' },
}

export function TokenCard({ token }: TokenCardProps) {
  return (
    <div
      className="bg-white dark:bg-[var(--surface-1)] border border-white/10 rounded-lg p-4 shadow-sm hover:shadow-md transition"
      data-testid="token-card"
    >
      {/* Name + color pips */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-lg font-bold text-[var(--ink)]">{token.name}</h3>
        <div className="flex gap-1">
          {token.colors.map((c) => (
            <span
              key={c}
              className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${colorPip[c].bg}`}
            >
              {colorPip[c].label}
            </span>
          ))}
        </div>
      </div>

      {/* Type line and P/T */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-[var(--muted)]">{token.typeLine}</p>
        {token.power !== undefined && token.toughness !== undefined && (
          <span className="text-sm font-bold text-[var(--ink)] ml-2">
            {token.power}/{token.toughness}
          </span>
        )}
      </div>

      {/* Abilities */}
      {token.abilities.length > 0 && (
        <div className="mb-3">
          {token.abilities.map((ability, i) => (
            <p key={i} className="text-sm text-[var(--muted)] italic">
              {ability}
            </p>
          ))}
        </div>
      )}

      {/* Made by */}
      <div>
        <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider mb-1">
          Made by
        </p>
        <div className="flex flex-wrap gap-1">
          {token.madeBy.slice(0, 3).map((card) => (
            <Link
              key={card}
              href={`/toolkit?q=${encodeURIComponent(card)}`}
              className="text-xs text-[var(--accent-2)] hover:underline"
            >
              {card}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
