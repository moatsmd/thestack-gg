/**
 * Affiliate-link helpers.
 *
 * Affiliate IDs are read from public env vars so they're inlined at build
 * time. If an ID is empty, we fall back to a clean (un-tagged) buy URL —
 * the link still works, we just don't earn the commission. This means we
 * can ship affiliate-ready code TODAY and flip on revenue the moment the
 * partner program approves us, without any rebuild gymnastics.
 *
 * Sources:
 *   - TCGplayer affiliate program: https://partner.tcgplayer.com/
 *   - Cardmarket affiliate program: https://www.cardmarket.com/en/Magic/About/Partners
 *   - Card Kingdom affiliate program: https://www.cardkingdom.com/affiliates
 *
 * For TCGplayer + Cardmarket we have a direct purchase URL straight from
 * Scryfall. For Card Kingdom we construct a search URL by card name.
 */

import { ScryfallCard } from '@/types/scryfall'

const TCGPLAYER_AFFILIATE_ID = process.env.NEXT_PUBLIC_TCGPLAYER_AFFILIATE_ID ?? ''
const CARDMARKET_AFFILIATE_ID = process.env.NEXT_PUBLIC_CARDMARKET_AFFILIATE_ID ?? ''
const CARDKINGDOM_AFFILIATE_ID = process.env.NEXT_PUBLIC_CARDKINGDOM_AFFILIATE_ID ?? ''

/**
 * Append a query parameter to a URL string, preserving any existing query +
 * hash. Returns the input untouched if it isn't a valid URL.
 */
function appendQuery(rawUrl: string, key: string, value: string): string {
  if (!value) return rawUrl
  try {
    const url = new URL(rawUrl)
    url.searchParams.set(key, value)
    return url.toString()
  } catch {
    return rawUrl
  }
}

export function tcgplayerUrl(card: ScryfallCard): string | null {
  const base = card.purchase_uris?.tcgplayer
  if (!base) return null
  // TCGplayer's affiliate parameter is `partner` (also accepts `utm_source`).
  return appendQuery(base, 'partner', TCGPLAYER_AFFILIATE_ID)
}

export function cardmarketUrl(card: ScryfallCard): string | null {
  const base = card.purchase_uris?.cardmarket
  if (!base) return null
  // Cardmarket affiliate parameter is `utm_source` (their docs).
  return appendQuery(base, 'utm_source', CARDMARKET_AFFILIATE_ID)
}

/**
 * Card Kingdom doesn't ship a per-card URL via Scryfall, so we construct a
 * search URL by exact card name. Their affiliate program uses a `partner`
 * parameter on outbound links.
 */
export function cardkingdomUrl(card: ScryfallCard): string {
  const params = new URLSearchParams({ filter: card.name })
  if (CARDKINGDOM_AFFILIATE_ID) params.set('partner', CARDKINGDOM_AFFILIATE_ID)
  return `https://www.cardkingdom.com/catalog/search?${params.toString()}`
}

export type BuyOption = {
  retailer: 'tcgplayer' | 'cardkingdom' | 'cardmarket'
  label: string
  url: string
}

/**
 * Returns every available buy link for a card, preserving display priority:
 * TCGplayer (US) > Card Kingdom (US) > Cardmarket (EU).
 */
export function buyLinksFor(card: ScryfallCard): BuyOption[] {
  const out: BuyOption[] = []
  const tcg = tcgplayerUrl(card)
  if (tcg) out.push({ retailer: 'tcgplayer', label: 'TCGplayer', url: tcg })
  out.push({ retailer: 'cardkingdom', label: 'Card Kingdom', url: cardkingdomUrl(card) })
  const cm = cardmarketUrl(card)
  if (cm) out.push({ retailer: 'cardmarket', label: 'Cardmarket', url: cm })
  return out
}
