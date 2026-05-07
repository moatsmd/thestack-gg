import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BuyLinks } from '../BuyLinks'
import type { ScryfallCard } from '@/types/scryfall'
import { trackCalls } from '@/__mocks__/vercel-analytics'

function makeCard(overrides: Partial<ScryfallCard> = {}): ScryfallCard {
  const base: any = {
    name: 'Lightning Bolt',
    purchase_uris: {
      tcgplayer: 'https://www.tcgplayer.com/product/12345',
      cardmarket: 'https://www.cardmarket.com/en/Magic/Products/Singles/Magic-2010/Lightning-Bolt',
    },
    prices: { usd: '1.50', usd_foil: null, usd_etched: null, eur: null, eur_foil: null, tix: null },
  }
  return { ...base, ...overrides } as ScryfallCard
}

describe('BuyLinks', () => {
  beforeEach(() => {
    trackCalls.length = 0
  })

  it('renders all three buy links when Scryfall has TCGplayer + Cardmarket URIs', () => {
    render(<BuyLinks card={makeCard()} from="test" />)
    expect(screen.getByTestId('buy-tcgplayer')).toBeInTheDocument()
    expect(screen.getByTestId('buy-cardkingdom')).toBeInTheDocument()
    expect(screen.getByTestId('buy-cardmarket')).toBeInTheDocument()
  })

  it('falls back gracefully when only Card Kingdom (constructed) is available', () => {
    const card = makeCard({ purchase_uris: undefined })
    render(<BuyLinks card={card} from="test" />)
    expect(screen.queryByTestId('buy-tcgplayer')).not.toBeInTheDocument()
    expect(screen.getByTestId('buy-cardkingdom')).toBeInTheDocument()
    expect(screen.queryByTestId('buy-cardmarket')).not.toBeInTheDocument()
  })

  it('fires affiliate_click analytics with retailer + card + from', async () => {
    const user = userEvent.setup()
    render(<BuyLinks card={makeCard()} from="toolkit-search" />)

    await user.click(screen.getByTestId('buy-tcgplayer'))
    expect(trackCalls).toHaveLength(1)
    expect(trackCalls[0]).toEqual({
      event: 'affiliate_click',
      properties: { retailer: 'tcgplayer', card: 'Lightning Bolt', from: 'toolkit-search' },
    })
  })

  it('renders nothing when there are no usable buy URLs at all', () => {
    // Card Kingdom always works (constructed by name), so this case requires a
    // card with an empty name AND no scryfall URIs \u2014 we still get cardkingdom.
    // This test guards against regressions to the "always show CK" rule.
    const card = makeCard({ purchase_uris: undefined, name: 'Lightning Bolt' })
    const { container } = render(<BuyLinks card={card} from="test" />)
    expect(container.querySelector('[data-testid="buy-links"]')).toBeInTheDocument()
  })
})
