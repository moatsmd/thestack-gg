'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GoldRule } from '@/components/Fleuron'
import { KeywordCard } from '@/components/KeywordCard'
import { useKeywords } from '@/hooks/useKeywords'
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

  const tierConfig: { tier: KeywordTier; label: string; testId: string }[] = [
    { tier: 'evergreen', label: 'Evergreen', testId: 'filter-tier-evergreen' },
    { tier: 'returning', label: 'Returning', testId: 'filter-tier-returning' },
    { tier: 'retired', label: 'Retired', testId: 'filter-tier-retired' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6 md:pt-12">
      <header className="text-center mb-8" data-testid="glossary-header">
        <div className="flex items-center justify-center"><GoldRule /></div>
        <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)] mt-3">Codex of Keywords</p>
        <h1 className="font-display text-gold-gradient text-3xl md:text-5xl mt-3 tracking-wide">Glossary</h1>
        <p className="font-prose italic text-[hsl(38_30%_88%)]/80 mt-1">Reminder text, rules text, and a name to remember.</p>
      </header>

      <div className="panel p-4 space-y-4">
        <input
          id="keyword-search"
          type="text"
          placeholder="Search keywords..."
          value={debouncedQuery}
          onChange={(e) => setDebouncedQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-transparent border border-[hsl(40_30%_18%)] text-[hsl(38_30%_88%)] focus:outline-none focus:ring-2 focus:ring-[hsl(42_75%_55%)]"
          data-testid="keyword-search"
          aria-label="Search keywords"
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setType('all')}
            className={`px-3 py-1 rounded-full text-xs font-display tracking-wider border transition ${selectedType === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'panel hover-elevate text-[hsl(38_15%_60%)]'}`}
            data-testid="filter-all"
          >
            All
          </button>
          {(['ability', 'action', 'mechanic'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1 rounded-full text-xs font-display tracking-wider border transition ${selectedType === t ? 'bg-primary text-primary-foreground border-primary' : 'panel hover-elevate text-[hsl(38_15%_60%)]'}`}
              data-testid={`filter-${t}`}
            >
              {t === 'ability' ? 'Abilities' : t === 'action' ? 'Actions' : 'Mechanics'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {tierConfig.map(({ tier, label, testId }) => {
            const active = selectedTiers.includes(tier)
            return (
              <button
                key={tier}
                onClick={() => toggleTier(tier)}
                className={`px-3 py-1 rounded-full text-xs font-display tracking-wider border transition ${active ? 'bg-primary text-primary-foreground border-primary' : 'panel hover-elevate text-[hsl(38_15%_60%)]'}`}
                data-testid={testId}
                aria-pressed={active}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-sm text-[hsl(38_15%_60%)] mt-4 mb-4">
        Showing {filteredKeywords.length} keyword{filteredKeywords.length !== 1 ? 's' : ''}
      </p>

      {filteredKeywords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="keywords-grid">
          {filteredKeywords.map((keyword, i) => (
            <motion.div
              key={keyword.keyword}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.015, 0.3) }}
            >
              <KeywordCard keyword={keyword} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="panel p-8 text-center text-[hsl(38_15%_60%)] mt-2" data-testid="empty-state">
          <p className="font-display text-lg mb-1">No keywords found</p>
          <p className="font-prose">Try adjusting your search or filter.</p>
        </div>
      )}
    </div>
  )
}
