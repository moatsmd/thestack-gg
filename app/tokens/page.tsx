'use client'

import { TokenCard } from '@/components/TokenCard'
import { useTokens } from '@/hooks/useTokens'
import type { TokenColor, TokenType } from '@/types/tokens'

const COLORS: { color: TokenColor; label: string; pip: string }[] = [
  { color: 'W', label: 'White', pip: 'bg-yellow-200 text-yellow-900' },
  { color: 'U', label: 'Blue', pip: 'bg-blue-200 text-blue-900' },
  { color: 'B', label: 'Black', pip: 'bg-gray-800 text-gray-100' },
  { color: 'R', label: 'Red', pip: 'bg-red-200 text-red-900' },
  { color: 'G', label: 'Green', pip: 'bg-green-200 text-green-900' },
  { color: 'C', label: 'Colorless', pip: 'bg-[var(--surface-2)] text-[var(--muted)]' },
]

const TYPES: { type: TokenType; label: string }[] = [
  { type: 'creature', label: 'Creature' },
  { type: 'artifact', label: 'Artifact' },
  { type: 'enchantment', label: 'Enchantment' },
  { type: 'emblem', label: 'Emblem' },
]

export default function TokensPage() {
  const { filteredTokens, query, selectedColors, selectedTypes, setQuery, toggleColor, toggleType } = useTokens()

  return (
    <div className="min-h-screen arcane-shell text-[var(--ink)] transition-colors">
      <div className="container mx-auto px-4 py-8">

        <header className="arcane-panel mana-border rounded-2xl p-6 mb-6">
          <p className="text-xs uppercase tracking-[0.5em] text-[var(--muted)]">Reference</p>
          <h1 className="mt-2 text-3xl font-bold text-[var(--ink)]">Tokens</h1>
          <p className="mt-1 text-[var(--muted)]">Common token types for Commander and competitive play.</p>
        </header>

        {/* Search + Filters */}
        <div className="mb-6 space-y-4 arcane-panel mana-border rounded-2xl p-6">
          <input
            type="text"
            placeholder="Search tokens, abilities, or cards that make them..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2 border border-white/10 rounded-lg bg-[var(--surface-1)] text-[var(--ink)] focus:ring-2 focus:ring-[var(--accent-2)] focus:border-transparent"
            data-testid="token-search"
          />

          {/* Color filter */}
          <div className="flex flex-wrap gap-2">
            {COLORS.map(({ color, label, pip }) => (
              <button
                key={color}
                type="button"
                onClick={() => toggleColor(color)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                  selectedColors.includes(color)
                    ? pip
                    : 'bg-[var(--surface-2)] text-[var(--muted)] hover:bg-[var(--surface-1)]'
                }`}
                data-testid={`color-filter-${color}`}
                aria-pressed={selectedColors.includes(color)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex flex-wrap gap-2">
            {TYPES.map(({ type, label }) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                  selectedTypes.includes(type)
                    ? 'bg-[var(--accent-1)] text-white'
                    : 'bg-[var(--surface-2)] text-[var(--muted)] hover:bg-[var(--surface-1)]'
                }`}
                data-testid={`type-filter-${type}`}
                aria-pressed={selectedTypes.includes(type)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-[var(--muted)] mb-4">
          Showing {filteredTokens.length} token{filteredTokens.length !== 1 ? 's' : ''}
        </p>

        {filteredTokens.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTokens.map((token) => (
              <TokenCard key={token.name} token={token} />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-12 text-[var(--muted)]"
            data-testid="tokens-empty-state"
          >
            <p className="text-lg font-semibold mb-2">No tokens found</p>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
