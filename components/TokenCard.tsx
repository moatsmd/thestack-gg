'use client'

import Link from 'next/link'
import { TokenDefinition, TokenColor } from '@/types/tokens'

interface TokenCardProps {
  token: TokenDefinition
  onAdd?: () => void
}

const colorSwatch: Record<TokenColor, string> = {
  W: 'bg-[hsl(45_60%_85%)]',
  U: 'bg-[hsl(220_60%_60%)]',
  B: 'bg-[hsl(0_0%_15%)]',
  R: 'bg-[hsl(0_60%_50%)]',
  G: 'bg-[hsl(140_50%_35%)]',
  C: 'bg-[hsl(40_15%_70%)]',
}

export function TokenCard({ token, onAdd }: TokenCardProps) {
  return (
    <article className="panel codex-glow p-5" data-testid="token-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-xl tracking-wide text-foreground">{token.name}</h3>
          <div className="font-prose italic text-foreground/80 text-sm mt-0.5">{token.typeLine}</div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {token.colors.map((c) => (
            <span
              key={c}
              className={`w-4 h-4 rounded-full ${colorSwatch[c]} border border-border`}
              title={c}
            />
          ))}
        </div>
      </div>

      {token.power !== undefined && token.toughness !== undefined && (
        <div className="mt-3 flex items-center gap-3">
          <span className="panel-elevated px-2 py-0.5 font-display text-base tracking-wider text-primary">
            {token.power}/{token.toughness}
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{token.type}</span>
        </div>
      )}

      {token.abilities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {token.abilities.map((ability, i) => (
            <span
              key={i}
              className="text-sm leading-relaxed px-3 py-2 rounded-md bg-[hsl(42_75%_55%/0.10)] text-primary border border-[hsl(42_75%_55%/0.25)]"
            >
              {ability}
            </span>
          ))}
        </div>
      )}

      {onAdd && <button type="button" onClick={onAdd} className="mt-4 min-h-11 px-4 border border-primary/40 text-primary hover-elevate" aria-label={`Add ${token.name} to your tray`}>+ Add to tray</button>}
      {token.madeBy.length > 0 && (
        <div className="mt-4 text-xs">
          <span className="font-display tracking-[0.18em] uppercase text-[10px] text-muted-foreground">Made by</span>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
            {token.madeBy.slice(0, 3).map((card) => (
              <Link
                key={card}
                href={`/toolkit?q=${encodeURIComponent(card)}`}
                className="inline-flex min-h-11 items-center text-primary underline underline-offset-4"
              >
                {card}
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
