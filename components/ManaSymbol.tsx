'use client'

/**
 * Renders a single MTG mana / cost symbol using Scryfall's official SVGs.
 *
 * Scryfall serves every symbol at:
 *   https://svgs.scryfall.io/card-symbols/{SLUG}.svg
 *
 * The slug is the symbol code uppercased with the surrounding braces and
 * any inner slashes removed, e.g.:
 *   {B}     -> B
 *   {3}     -> 3
 *   {W/U}   -> WU      (hybrid)
 *   {2/W}   -> 2W      (mono-hybrid)
 *   {B/P}   -> BP      (Phyrexian)
 *   {T}     -> T       (tap)
 *   {Q}     -> Q       (untap)
 *   {X}     -> X
 *
 * Reference: https://scryfall.com/docs/api/card-symbols
 */

interface ManaSymbolProps {
  /** Raw Scryfall symbol token, including braces (e.g. "{B}", "{2/W}"). */
  symbol: string
  /** Pixel size; defaults to 1em so it tracks surrounding text. */
  size?: number | string
  className?: string
}

function symbolToSlug(symbol: string): string {
  // Strip the braces and slashes, uppercase the rest.
  return symbol.replace(/[{}/]/g, '').toUpperCase()
}

export function symbolUrl(symbol: string): string {
  const slug = symbolToSlug(symbol)
  return `https://svgs.scryfall.io/card-symbols/${slug}.svg`
}

export function ManaSymbol({ symbol, size = '1em', className = '' }: ManaSymbolProps) {
  const dim = typeof size === 'number' ? `${size}px` : size
  return (
    <img
      src={symbolUrl(symbol)}
      alt={symbol}
      title={symbol}
      width={dim}
      height={dim}
      className={`inline-block align-text-bottom rounded-full ${className}`}
      style={{ width: dim, height: dim }}
      loading="lazy"
      draggable={false}
      data-testid="mana-symbol"
    />
  )
}

/**
 * Renders a full mana cost string ("{2}{B}{B}") as a row of symbol icons.
 * Unknown / non-matching tokens are rendered as plain text so we never lose
 * information.
 */
interface ManaCostProps {
  cost: string | null | undefined
  size?: number | string
  className?: string
  'data-testid'?: string
}

export function ManaCost({
  cost,
  size = '1em',
  className = '',
  'data-testid': dataTestId,
}: ManaCostProps) {
  if (!cost) return null
  const tokens = cost.match(/\{[^}]+\}/g) ?? []
  if (tokens.length === 0) {
    return (
      <span className={className} data-testid={dataTestId}>
        {cost}
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center gap-[2px] ${className}`}
      data-testid={dataTestId}
    >
      {tokens.map((tok, i) => (
        <ManaSymbol key={`${tok}-${i}`} symbol={tok} size={size} />
      ))}
    </span>
  )
}
