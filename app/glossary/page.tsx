'use client'

import { useState, useEffect } from 'react'
import { GlossaryHeader } from '@/components/GlossaryHeader'
import { KeywordCard } from '@/components/KeywordCard'
import { useKeywords } from '@/hooks/useKeywords'
import { KeywordDefinition } from '@/lib/keywords-data'
import type { KeywordTier } from '@/hooks/useKeywords'

export default function GlossaryPage() {
  const { filteredKeywords, query, selectedType, selectedTiers, setQuery, setType, toggleTier } = useKeywords()
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(debouncedQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [debouncedQuery, setQuery])

  const tierConfig: { tier: KeywordTier; label: string; activeClass: string; testId: string }[] = [
    { tier: 'evergreen', label: 'Evergreen', activeClass: 'bg-green-600 text-white', testId: 'filter-tier-evergreen' },
    { tier: 'returning', label: 'Returning', activeClass: 'bg-blue-600 text-white', testId: 'filter-tier-returning' },
    { tier: 'retired', label: 'Retired', activeClass: 'bg-[var(--muted)] text-white', testId: 'filter-tier-retired' },
  ]

  return (
    <div className="min-h-screen arcane-shell text-[var(--ink)] transition-colors">
      <GlossaryHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 space-y-4 arcane-panel mana-border rounded-2xl p-6">
          {/* Search Input */}
          <div>
            <label htmlFor="keyword-search" className="sr-only">
              Search keywords
            </label>
            <input
              id="keyword-search"
              type="text"
              placeholder="Search keywords..."
              value={debouncedQuery}
              onChange={(e) => setDebouncedQuery(e.target.value)}
              className="w-full px-4 py-2 border border-white/10 rounded-lg bg-[var(--surface-1)] text-[var(--ink)] focus:ring-2 focus:ring-[var(--accent-2)] focus:border-transparent"
              data-testid="keyword-search"
            />
          </div>

          {/* Type Filter Row */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setType('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                selectedType === 'all'
                  ? 'bg-[var(--accent-2)] text-gray-900'
                  : 'bg-[var(--surface-2)] text-[var(--muted)] hover:bg-[var(--surface-1)]'
              }`}
              data-testid="filter-all"
            >
              All
            </button>
            {(['ability', 'action', 'mechanic'] as const).map((t) => {
              const activeColors = { ability: 'bg-blue-600 text-white', action: 'bg-green-600 text-white', mechanic: 'bg-purple-600 text-white' }
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    selectedType === t
                      ? activeColors[t]
                      : 'bg-[var(--surface-2)] text-[var(--muted)] hover:bg-[var(--surface-1)]'
                  }`}
                  data-testid={`filter-${t}`}
                >
                  {t === 'ability' ? 'Abilities' : t === 'action' ? 'Actions' : 'Mechanics'}
                </button>
              )
            })}
          </div>

          {/* Tier Filter Row */}
          <div className="flex flex-wrap gap-2">
            {tierConfig.map(({ tier, label, activeClass, testId }) => (
              <button
                key={tier}
                onClick={() => toggleTier(tier)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedTiers.includes(tier)
                    ? activeClass
                    : 'bg-[var(--surface-2)] text-[var(--muted)] hover:bg-[var(--surface-1)]'
                }`}
                data-testid={testId}
                aria-pressed={selectedTiers.includes(tier)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-[var(--muted)] mb-4">
          Showing {filteredKeywords.length} keyword{filteredKeywords.length !== 1 ? 's' : ''}
        </p>

        {/* Keywords Grid */}
        {filteredKeywords.length > 0 ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            data-testid="keywords-grid"
          >
            {filteredKeywords.map((keyword) => (
              <KeywordCard key={keyword.keyword} keyword={keyword} />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-12 text-[var(--muted)]"
            data-testid="empty-state"
          >
            <p className="text-lg font-semibold mb-2">No keywords found</p>
            <p>Try adjusting your search or filter</p>
          </div>
        )}
      </main>
    </div>
  )
}
