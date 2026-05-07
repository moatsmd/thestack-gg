'use client'

/**
 * Buy-links row for a Scryfall card.
 *
 * Renders TCGplayer / Card Kingdom / Cardmarket affiliate-tagged outbound
 * links and tracks every click via `trackAffiliateClick` so we can attribute
 * intent to specific surfaces (toolkit search, card modal, etc.).
 *
 * Affiliate IDs come from `lib/affiliate.ts` via env vars; if unset, links
 * still resolve to clean buy URLs.
 */

import { ScryfallCard } from '@/types/scryfall'
import { buyLinksFor } from '@/lib/affiliate'
import { trackAffiliateClick } from '@/lib/analytics'

interface BuyLinksProps {
  card: ScryfallCard
  /** Surface where the click happened — e.g. 'toolkit-search', 'card-modal'. */
  from: string
  className?: string
}

export function BuyLinks({ card, from, className = '' }: BuyLinksProps) {
  const links = buyLinksFor(card)
  if (links.length === 0) return null

  return (
    <div
      className={`border-t border-[hsl(40_30%_18%)] pt-3 ${className}`}
      data-testid="buy-links"
    >
      <h3 className="text-[10px] font-display tracking-[0.2em] uppercase text-[hsl(38_15%_60%)] mb-2">
        Buy
      </h3>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.retailer}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            data-testid={`buy-${link.retailer}`}
            onClick={() => trackAffiliateClick(link.retailer, card.name, { from })}
            className="px-3 py-1.5 panel hover-elevate text-xs font-display tracking-wide text-[hsl(42_75%_55%)] hover:text-[hsl(42_75%_65%)] transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  )
}
