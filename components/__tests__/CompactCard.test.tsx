import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompactCard } from '../CompactCard'
import { ScryfallCard } from '@/types/scryfall'

const mockCard: ScryfallCard = {
  id: '1',
  name: 'Lightning Bolt',
  type_line: 'Instant',
  mana_cost: '{R}',
  oracle_text: 'Lightning Bolt deals 3 damage to any target.',
  image_uris: {
    small: 'https://example.com/small.jpg',
    normal: 'https://example.com/normal.jpg',
    large: 'https://example.com/large.jpg',
    png: 'https://example.com/card.png',
    art_crop: 'https://example.com/art.jpg',
    border_crop: 'https://example.com/border.jpg',
  },
  set_name: 'Alpha',
  set: 'lea',
  rarity: 'common',
  legalities: {},
  prices: { usd: '1.50' },
} as ScryfallCard

describe('CompactCard', () => {
  it('renders card name and image', () => {
    render(<CompactCard card={mockCard} onClick={() => {}} />)

    expect(screen.getByText('Lightning Bolt')).toBeInTheDocument()
    expect(screen.getByAltText('Lightning Bolt')).toBeInTheDocument()
    expect(screen.getByAltText('Lightning Bolt')).toHaveAttribute('src', mockCard.image_uris?.small)
  })

  it('displays mana cost', () => {
    render(<CompactCard card={mockCard} onClick={() => {}} />)

    expect(screen.getByText('{R}')).toBeInTheDocument()
  })

  it('displays type line', () => {
    render(<CompactCard card={mockCard} onClick={() => {}} />)

    expect(screen.getByText('Instant')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()

    render(<CompactCard card={mockCard} onClick={handleClick} />)

    await user.click(screen.getByTestId('compact-card'))

    expect(handleClick).toHaveBeenCalledTimes(1)
    expect(handleClick).toHaveBeenCalledWith(mockCard)
  })

  it('shows placeholder when no image available', () => {
    const cardWithoutImage = { ...mockCard, image_uris: undefined }

    render(<CompactCard card={cardWithoutImage} onClick={() => {}} />)

    expect(screen.getByText('No image')).toBeInTheDocument()
  })

  it('displays DFC indicator for multi-faced cards', () => {
    const doubleFacedCard: ScryfallCard = {
      ...mockCard,
      card_faces: [
        {
          object: 'card_face',
          name: 'Front Face',
          type_line: 'Creature — Human',
          mana_cost: '{1}{U}',
          image_uris: {
            small: 'https://example.com/front-small.jpg',
            normal: 'https://example.com/front-normal.jpg',
            large: 'https://example.com/front-large.jpg',
            png: 'https://example.com/front.png',
            art_crop: 'https://example.com/front-art.jpg',
            border_crop: 'https://example.com/front-border.jpg',
          },
        },
        {
          object: 'card_face',
          name: 'Back Face',
          type_line: 'Creature — Werewolf',
          mana_cost: '',
          image_uris: {
            small: 'https://example.com/back-small.jpg',
            normal: 'https://example.com/back-normal.jpg',
            large: 'https://example.com/back-large.jpg',
            png: 'https://example.com/back.png',
            art_crop: 'https://example.com/back-art.jpg',
            border_crop: 'https://example.com/back-border.jpg',
          },
        },
      ],
      image_uris: undefined, // Multi-faced cards don't have top-level image_uris
    } as ScryfallCard

    render(<CompactCard card={doubleFacedCard} onClick={() => {}} />)

    // Should show DFC indicator
    expect(screen.getByText('DFC')).toBeInTheDocument()

    // Should display first face data
    expect(screen.getByText('Front Face')).toBeInTheDocument()
    expect(screen.getByText('{1}{U}')).toBeInTheDocument()
    expect(screen.getByText('Creature — Human')).toBeInTheDocument()

    // Should use first face image
    const image = screen.getByAltText('Front Face')
    expect(image).toHaveAttribute('src', 'https://example.com/front-small.jpg')
  })
})
