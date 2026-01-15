import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CardModal } from '../CardModal'
import { ScryfallCard } from '@/types/scryfall'

const mockCard: ScryfallCard = {
  id: '1',
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
} as ScryfallCard

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
})
