export type ProviderId = 'printmtg' | 'printingproxies' | 'mpc'
export const PRICE_CHECKED = '2026-11-03'
export const PROVIDERS: { id: ProviderId; name: string; label: string; url: string; source: string; description: string; caveats: string[]; steps: string[] }[] = [
  { id: 'printmtg', name: 'PrintMTG', label: 'Deck list → order', url: 'https://printmtg.com/', source: 'https://printmtg.com/',
    description: 'Paste your list and choose the card versions in their builder.',
    caveats: ['Standard, non-foil estimate. Foils are not currently offered.', 'Confirm custom-back upload and reverse-face handling before committing to this route.', 'Shipping and tax are quoted at checkout. Custom orders have limited returns.'],
    steps: ['Import the deck-list file into PrintMTG.', 'Choose available set versions and check every front and reverse.', 'Confirm back support, quantities, shipping, tax, and final proof before payment.'] },
  { id: 'printingproxies', name: 'PrintingProxies', label: 'Deck list + back selection', url: 'https://www.printingproxies.com/', source: 'https://www.printingproxies.com/',
    description: 'A deck-list workflow with version selection and a card-back step.',
    caveats: ['Published standard-card tiers; upgrades may cost more.', 'Check whether your uploaded back is supported, and inspect double-faced cards individually.', 'U.S. fulfillment is advertised; confirm delivery dates and the final shipping quote.'],
    steps: ['Paste the deck list into the order builder.', 'Resolve missing cards, choose versions, and select backs in the provider’s back step.', 'Compare the cart against your manifest, including double-faced cards and upgrades.'] },
  { id: 'mpc', name: 'MakePlayingCards', label: 'Finished images → custom deck', url: 'https://www.makeplayingcards.com/design/custom-blank-card.html', source: 'https://www.makeplayingcards.com/design/custom-blank-card.html',
    description: 'More control over fronts, backs, and stock; more setup before checkout.',
    caveats: ['A card list alone is not a print file. Supply front images and assign each reverse.', 'Use 63 × 88 mm cards. S30 and S33 stock, capacity brackets, and finishes change the quote.', 'Follow the current bleed template and image-rights policy. Shipping and any import charges are separate.'],
    steps: ['Use MPCFill to select print-ready artwork, or prepare your own images using MPC’s template.', 'Configure 63 × 88 mm, deck capacity, stock, and finish. Assign backs using the manifest.', 'Check all proofs and the cart. MPCFill’s XML is created in MPCFill after art selection; this workshop’s CSV is a checklist.'] },
]
const TIERS: Record<Exclude<ProviderId, 'mpc'>, [number, number][]> = {
  printmtg: [[1000, 33], [500, 38], [200, 45], [100, 55], [75, 80], [50, 100], [30, 125], [10, 150], [2, 200]],
  printingproxies: [[200, 75], [50, 100], [10, 150], [1, 200]],
}
export function estimatePrinting(provider: ProviderId, count: number): number | null {
  if (provider === 'mpc' || !Number.isInteger(count) || count < 1) return null
  const tier = TIERS[provider].find(([min]) => count >= min)
  return tier ? tier[1] * count : null
}
export const dollars = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
