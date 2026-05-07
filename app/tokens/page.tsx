'use client'

import { motion } from 'framer-motion'
import { GoldRule } from '@/components/Fleuron'
import { TokenCard } from '@/components/TokenCard'
import { useTokens } from '@/hooks/useTokens'
import type { TokenColor, TokenType } from '@/types/tokens'

const COLORS: { color: TokenColor; label: string; swatch: string }[] = [
  { color: 'W', label: 'White', swatch: 'bg-[hsl(45_60%_85%)]' },
  { color: 'U', label: 'Blue', swatch: 'bg-[hsl(220_60%_60%)]' },
  { color: 'B', label: 'Black', swatch: 'bg-[hsl(0_0%_15%)]' },
  { color: 'R', label: 'Red', swatch: 'bg-[hsl(0_60%_50%)]' },
  { color: 'G', label: 'Green', swatch: 'bg-[hsl(140_50%_35%)]' },
  { color: 'C', label: 'Colorless', swatch: 'bg-[hsl(40_15%_70%)]' },
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
    <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6 md:pt-12">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center"><GoldRule /></div>
        <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)] mt-3">The Bestiary</p>
        <h1 className="font-display text-gold-gradient text-3xl md:text-5xl mt-3 tracking-wide">Tokens</h1>
        <p className="font-prose italic text-[hsl(38_30%_88%)]/80 mt-1">Common token types for Commander and competitive play.</p>
      </header>

      <div className="panel p-4 space-y-4">
        <input
          type="text"
          placeholder="Search tokens, abilities, or cards that make them…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-transparent border border-[hsl(40_30%_18%)] text-[hsl(38_30%_88%)] focus:outline-none focus:ring-2 focus:ring-[hsl(42_75%_55%)]"
          data-testid="token-search"
        />

        <div className="flex flex-wrap gap-2">
          {COLORS.map(({ color, label, swatch }) => {
            const active = selectedColors.includes(color)
            return (
              <button
                key={color}
                type="button"
                onClick={() => toggleColor(color)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-display tracking-wider border transition ${active ? 'bg-primary text-primary-foreground border-primary' : 'panel hover-elevate text-[hsl(38_15%_60%)]'}`}
                data-testid={`color-filter-${color}`}
                aria-pressed={active}
              >
                <span className={`w-3 h-3 rounded-full ${swatch} border border-[hsl(40_30%_18%)]`} />
                {label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {TYPES.map(({ type, label }) => {
            const active = selectedTypes.includes(type)
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`px-3 py-1 rounded-full text-xs font-display tracking-wider border transition ${active ? 'bg-primary text-primary-foreground border-primary' : 'panel hover-elevate text-[hsl(38_15%_60%)]'}`}
                data-testid={`type-filter-${type}`}
                aria-pressed={active}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-sm text-[hsl(38_15%_60%)] mt-4 mb-4">
        Showing {filteredTokens.length} token{filteredTokens.length !== 1 ? 's' : ''}
      </p>

      {filteredTokens.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTokens.map((token, i) => (
            <motion.div
              key={token.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
            >
              <TokenCard token={token} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div
          className="panel p-8 text-center text-[hsl(38_15%_60%)] mt-2"
          data-testid="tokens-empty-state"
        >
          <p className="font-display text-lg mb-1">No tokens found</p>
          <p className="font-prose">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  )
}
