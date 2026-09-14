'use client'

import { motion } from 'framer-motion'
import { GoldRule } from '@/components/Fleuron'
import { TokenCard } from '@/components/TokenCard'
import { useTokens } from '@/hooks/useTokens'
import { useTokenTray } from '@/hooks/useTokenTray'
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
  const tray = useTokenTray()
  const resetFilters = () => { setQuery(''); selectedColors.forEach(toggleColor); selectedTypes.forEach(toggleType) }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6 md:pt-12">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center"><GoldRule /></div>
        <p className="font-display tracking-[0.16em] uppercase text-xs text-muted-foreground mt-3">The Bestiary</p>
        <h1 className="font-display text-gold-gradient text-3xl md:text-5xl mt-3 tracking-wide">Tokens</h1>
        <p className="font-prose text-lg text-muted-foreground mt-3">Find the token. Keep the count. Stay in the game.</p>
      </header>

      <section className="panel p-5 md:p-6 mb-6" aria-label="Your token tray">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-xl">Your token tray</h2>{Object.keys(tray.counts).length > 0 && <button type="button" onClick={tray.clear} className="min-h-11 px-3 text-sm underline text-muted-foreground">Clear tray</button>}</div>
        <p className="text-sm text-muted-foreground mt-2">Saved in this browser. Quantities only; keep tapped tokens separate on your table.</p>
        {Object.keys(tray.counts).length === 0 ? <p className="font-prose text-lg py-4">Add a token from the reference below to start counting.</p> : <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4">{Object.entries(tray.counts).map(([name, count]) => <li key={name} className="panel-elevated p-4"><h3 className="font-display text-base mb-3">{name}</h3><div className="flex items-center justify-between gap-3"><button className="panel min-h-11 min-w-11 text-xl" onClick={() => tray.change(name, -1)} aria-label={`Remove one ${name}`}>−</button><output className="text-3xl font-display tabular-nums" aria-label={`${name} count`}>{count}</output><button className="panel min-h-11 min-w-11 text-xl" disabled={count >= 999} onClick={() => tray.change(name, 1)} aria-label={`Add one ${name}`}>+</button></div></li>)}</ul>}
        {tray.canUndo && <button className="min-h-11 text-primary underline" onClick={tray.undoClear}>Undo clear tray</button>}
        {tray.storageError && <p role="status" className="text-sm text-primary mt-3">Browser storage is unavailable. Your counts will last until you leave this page.</p>}
      </section>

      <h2 className="font-display text-2xl mb-2">Token reference</h2>
      <p className="text-muted-foreground mb-4">A curated selection of common tokens. Tokens with the same name can differ; check the card that creates yours.</p>

      <div className="panel p-4 space-y-4">
        <input
          type="text"
          aria-label="Search tokens"
          placeholder="Search tokens, abilities, or cards that make them…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-transparent border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(42_75%_55%)]"
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
                className={`min-h-11 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-display tracking-wider border transition ${active ? 'bg-primary text-primary-foreground border-primary' : 'panel hover-elevate text-muted-foreground'}`}
                data-testid={`color-filter-${color}`}
                aria-pressed={active}
              >
                <span className={`w-3 h-3 rounded-full ${swatch} border border-border`} />
                {label}
              </button>
            )
          })}
        </div>
        {(query || selectedColors.length > 0 || selectedTypes.length > 0) && <button className="min-h-11 text-primary underline text-sm" onClick={resetFilters}>Clear search & filters</button>}

        <div className="flex flex-wrap gap-2">
          {TYPES.map(({ type, label }) => {
            const active = selectedTypes.includes(type)
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`min-h-11 px-3 py-1 rounded-full text-xs font-display tracking-wider border transition ${active ? 'bg-primary text-primary-foreground border-primary' : 'panel hover-elevate text-muted-foreground'}`}
                data-testid={`type-filter-${type}`}
                aria-pressed={active}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <p role="status" className="text-sm text-muted-foreground mt-4 mb-4">
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
              <TokenCard token={token} onAdd={tray.ready ? () => tray.change(token.name, 1) : undefined} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div
          className="panel p-8 text-center text-muted-foreground mt-2"
          data-testid="tokens-empty-state"
        >
          <p className="font-display text-lg mb-1">No tokens found</p>
          <p className="font-prose">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  )
}
