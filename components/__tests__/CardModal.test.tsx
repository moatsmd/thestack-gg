import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CardModal } from '../CardModal'
import { ScryfallCard } from '@/types/scryfall'

const mockCard: ScryfallCard = {
  object: 'card',
  id: '1',
  lang: 'en',
  released_at: '1993-08-05',
  uri: 'https://api.scryfall.com/cards/1',
  scryfall_uri: 'https://scryfall.com/card/lea/1',
  layout: 'normal',
  highres_image: true,
  image_status: 'highres_scan',
  cmc: 1,
  color_identity: ['R'],
  keywords: [],
  games: ['paper'],
  reserved: false,
  foil: false,
  nonfoil: true,
  finishes: ['nonfoil'],
  oversized: false,
  promo: false,
  reprint: false,
  variation: false,
  set_id: 'lea',
  set_type: 'core',
  set_uri: 'https://api.scryfall.com/sets/lea',
  set_search_uri: 'https://api.scryfall.com/cards/search?q=set:lea',
  scryfall_set_uri: 'https://scryfall.com/sets/lea',
  rulings_uri: 'https://api.scryfall.com/cards/1/rulings',
  prints_search_uri: 'https://api.scryfall.com/cards/search?q=Lightning+Bolt',
  collector_number: '1',
  digital: false,
  border_color: 'black',
  frame: '1993',
  full_art: false,
  textless: false,
  booster: true,
  story_spotlight: false,
  related_uris: {},
  name: 'Lightning Bolt',
  type_line: 'Instant',
  mana_cost: '{R}',
  oracle_text: 'Lightning Bolt deals 3 damage to any target.',
  set: 'lea',
  set_name: 'Limited Edition Alpha',
  rarity: 'common',
  prices: {
    usd: '1.50',
    usd_foil: '2.00',
    eur: '1.30',
  },
  image_uris: {
    small: 'https://example.com/small.jpg',
    normal: 'https://example.com/normal.jpg',
    large: 'https://example.com/large.jpg',
    png: 'https://example.com/card.png',
    art_crop: 'https://example.com/art_crop.jpg',
    border_crop: 'https://example.com/border_crop.jpg',
  },
  legalities: {
    commander: 'legal',
    standard: 'not_legal',
  },
}

describe('CardModal', () => {
  it('renders modal when open', () => {
    render(<CardModal card={mockCard} isOpen={true} onClose={() => {}} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Lightning Bolt')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<CardModal card={mockCard} isOpen={false} onClose={() => {}} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()

    render(<CardModal card={mockCard} isOpen={true} onClose={handleClose} />)

    await user.click(screen.getByRole('button', { name: /close/i }))

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop clicked', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()

    render(<CardModal card={mockCard} isOpen={true} onClose={handleClose} />)

    await user.click(screen.getByTestId('modal-backdrop'))

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('does not close when card content clicked', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()

    render(<CardModal card={mockCard} isOpen={true} onClose={handleClose} />)

    await user.click(screen.getByTestId('modal-content'))

    expect(handleClose).not.toHaveBeenCalled()
  })

  it('calls onClose when Escape key pressed', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()

    render(<CardModal card={mockCard} isOpen={true} onClose={handleClose} />)

    await user.keyboard('{Escape}')

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('prevents body scroll when modal is open', () => {
    const { rerender, unmount } = render(<CardModal card={mockCard} isOpen={true} onClose={() => {}} />)

    // Body scroll should be prevented
    expect(document.body.style.overflow).toBe('hidden')

    // Close modal
    rerender(<CardModal card={mockCard} isOpen={false} onClose={() => {}} />)

    // Body scroll should be restored
    expect(document.body.style.overflow).toBe('')

    // Cleanup - remount and unmount to test cleanup function
    rerender(<CardModal card={mockCard} isOpen={true} onClose={() => {}} />)
    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    // Body scroll should be restored on unmount
    expect(document.body.style.overflow).toBe('')
  })
})
