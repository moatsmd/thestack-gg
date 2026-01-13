import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CardDisplay } from '../CardDisplay'
import { ScryfallCard } from '@/types/scryfall'

describe('CardDisplay', () => {
  const mockCard: ScryfallCard = {
    object: 'card',
    id: 'test-id',
    name: 'Sol Ring',
    mana_cost: '{1}',
    cmc: 1,
    type_line: 'Artifact',
    oracle_text: '{T}: Add {C}{C}.',
    colors: [],
    color_identity: [],
    keywords: [],
    legalities: {
      commander: 'legal',
      standard: 'not_legal',
      modern: 'legal',
    },
    games: [],
    reserved: false,
    foil: true,
    nonfoil: true,
    finishes: [],
    oversized: false,
    promo: false,
    reprint: true,
    variation: false,
    set_id: 'test-set-id',
    set: 'cmr',
    set_name: 'Commander Legends',
    set_type: 'masters',
    set_uri: 'https://api.scryfall.com/sets/test',
    set_search_uri: 'https://api.scryfall.com/cards/search?order=set&q=e%3Atest',
    scryfall_set_uri: 'https://scryfall.com/sets/test',
    rulings_uri: 'https://api.scryfall.com/cards/test/rulings',
    prints_search_uri: 'https://api.scryfall.com/cards/search?order=released&q=test',
    collector_number: '237',
    digital: false,
    rarity: 'uncommon',
    border_color: 'black',
    frame: '2015',
    full_art: false,
    textless: false,
    booster: true,
    story_spotlight: false,
    prices: {
      usd: '1.50',
      usd_foil: '2.00',
      eur: '1.30',
    },
    related_uris: {},
    image_uris: {
      small: 'https://example.com/small.jpg',
      normal: 'https://example.com/normal.jpg',
      large: 'https://example.com/large.jpg',
      png: 'https://example.com/card.png',
      art_crop: 'https://example.com/art_crop.jpg',
      border_crop: 'https://example.com/border_crop.jpg',
    },
    lang: 'en',
    released_at: '2020-11-20',
    uri: 'https://api.scryfall.com/cards/test',
    scryfall_uri: 'https://scryfall.com/card/test',
    layout: 'normal',
    highres_image: true,
    image_status: 'highres_scan',
  }

  it('renders card image', () => {
    render(<CardDisplay card={mockCard} />)

    const image = screen.getByTestId('card-image')
    expect(image).toHaveAttribute('src', 'https://example.com/normal.jpg')
    expect(image).toHaveAttribute('alt', 'Sol Ring')
  })

  it('renders card header with name, mana cost, and type line', () => {
    render(<CardDisplay card={mockCard} />)

    expect(screen.getByTestId('card-name')).toHaveTextContent('Sol Ring')
    expect(screen.getByTestId('card-mana-cost')).toHaveTextContent('{1}')
    expect(screen.getByTestId('card-type-line')).toHaveTextContent('Artifact')
  })

  it('renders oracle text', () => {
    render(<CardDisplay card={mockCard} />)

    expect(screen.getByTestId('card-oracle-text')).toHaveTextContent('{T}: Add {C}{C}.')
  })

  it('renders card metadata', () => {
    render(<CardDisplay card={mockCard} />)

    const metadata = screen.getByTestId('card-metadata')
    expect(metadata).toHaveTextContent('Set: Commander Legends (CMR)')
    expect(screen.getByTestId('card-rarity')).toHaveTextContent('uncommon')
    expect(screen.getByTestId('card-price')).toHaveTextContent('Price: $1.50')
  })

  it('displays legality badges', () => {
    render(<CardDisplay card={mockCard} />)

    expect(screen.getByText('Format Legality')).toBeInTheDocument()
    expect(screen.getByTestId('legality-commander')).toBeInTheDocument()
    expect(screen.getByTestId('legality-modern')).toBeInTheDocument()
  })

  it('opens fullscreen modal when image is clicked', async () => {
    const user = userEvent.setup()
    render(<CardDisplay card={mockCard} />)

    const imageButton = screen.getByRole('button', { name: /expand card image/i })
    await user.click(imageButton)

    expect(screen.getByTestId('card-image-modal')).toBeInTheDocument()
  })

  it('closes fullscreen modal when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<CardDisplay card={mockCard} />)

    // Open modal
    const imageButton = screen.getByRole('button', { name: /expand card image/i })
    await user.click(imageButton)

    // Close modal
    const closeButton = screen.getByRole('button', { name: /close fullscreen image/i })
    await user.click(closeButton)

    expect(screen.queryByTestId('card-image-modal')).not.toBeInTheDocument()
  })

  it('closes fullscreen modal when backdrop is clicked', async () => {
    const user = userEvent.setup()
    render(<CardDisplay card={mockCard} />)

    // Open modal
    const imageButton = screen.getByRole('button', { name: /expand card image/i })
    await user.click(imageButton)

    // Click backdrop
    const modal = screen.getByTestId('card-image-modal')
    await user.click(modal)

    expect(screen.queryByTestId('card-image-modal')).not.toBeInTheDocument()
  })

  it('handles cards without images', () => {
    const cardWithoutImage: ScryfallCard = {
      ...mockCard,
      image_uris: undefined,
    }

    render(<CardDisplay card={cardWithoutImage} />)

    expect(screen.getByTestId('no-image')).toBeInTheDocument()
    expect(screen.getByText('No image available')).toBeInTheDocument()
  })

  it('handles cards without mana cost', () => {
    const cardWithoutManaCost: ScryfallCard = {
      ...mockCard,
      mana_cost: undefined,
    }

    render(<CardDisplay card={cardWithoutManaCost} />)

    expect(screen.queryByTestId('card-mana-cost')).not.toBeInTheDocument()
  })

  it('handles cards without oracle text', () => {
    const cardWithoutText: ScryfallCard = {
      ...mockCard,
      oracle_text: undefined,
    }

    render(<CardDisplay card={cardWithoutText} />)

    expect(screen.queryByTestId('card-oracle-text')).not.toBeInTheDocument()
  })

  it('handles cards without price', () => {
    const cardWithoutPrice: ScryfallCard = {
      ...mockCard,
      prices: {
        usd: null,
        usd_foil: null,
        eur: null,
      },
    }

    render(<CardDisplay card={cardWithoutPrice} />)

    expect(screen.queryByTestId('card-price')).not.toBeInTheDocument()
  })

  it('displays EUR price when USD is not available', () => {
    const cardWithEurPrice: ScryfallCard = {
      ...mockCard,
      prices: {
        usd: null,
        usd_foil: null,
        eur: '2.50',
      },
    }

    render(<CardDisplay card={cardWithEurPrice} />)

    expect(screen.getByTestId('card-price')).toHaveTextContent('Price: €2.50')
  })

  it('renders double-faced cards with flip button', () => {
    const doubleFacedCard: ScryfallCard = {
      ...mockCard,
      card_faces: [
        {
          object: 'card_face',
          name: 'Delver of Secrets',
          mana_cost: '{U}',
          type_line: 'Creature — Human Wizard',
          oracle_text: 'At the beginning of your upkeep, look at the top card of your library.',
          image_uris: {
            small: 'https://example.com/delver-small.jpg',
            normal: 'https://example.com/delver-normal.jpg',
            large: 'https://example.com/delver-large.jpg',
            png: 'https://example.com/delver.png',
            art_crop: 'https://example.com/delver-art.jpg',
            border_crop: 'https://example.com/delver-border.jpg',
          },
        },
        {
          object: 'card_face',
          name: 'Insectile Aberration',
          type_line: 'Creature — Human Insect',
          oracle_text: 'Flying',
          image_uris: {
            small: 'https://example.com/aberration-small.jpg',
            normal: 'https://example.com/aberration-normal.jpg',
            large: 'https://example.com/aberration-large.jpg',
            png: 'https://example.com/aberration.png',
            art_crop: 'https://example.com/aberration-art.jpg',
            border_crop: 'https://example.com/aberration-border.jpg',
          },
        },
      ],
    }

    render(<CardDisplay card={doubleFacedCard} />)

    expect(screen.getByTestId('flip-card-button')).toBeInTheDocument()
    expect(screen.getByTestId('card-name')).toHaveTextContent('Delver of Secrets')
  })

  it('flips between card faces when flip button is clicked', async () => {
    const user = userEvent.setup()
    const doubleFacedCard: ScryfallCard = {
      ...mockCard,
      card_faces: [
        {
          object: 'card_face',
          name: 'Delver of Secrets',
          mana_cost: '{U}',
          type_line: 'Creature — Human Wizard',
          oracle_text: 'At the beginning of your upkeep, look at the top card of your library.',
          image_uris: {
            small: 'https://example.com/delver-small.jpg',
            normal: 'https://example.com/delver-normal.jpg',
            large: 'https://example.com/delver-large.jpg',
            png: 'https://example.com/delver.png',
            art_crop: 'https://example.com/delver-art.jpg',
            border_crop: 'https://example.com/delver-border.jpg',
          },
        },
        {
          object: 'card_face',
          name: 'Insectile Aberration',
          type_line: 'Creature — Human Insect',
          oracle_text: 'Flying',
          image_uris: {
            small: 'https://example.com/aberration-small.jpg',
            normal: 'https://example.com/aberration-normal.jpg',
            large: 'https://example.com/aberration-large.jpg',
            png: 'https://example.com/aberration.png',
            art_crop: 'https://example.com/aberration-art.jpg',
            border_crop: 'https://example.com/aberration-border.jpg',
          },
        },
      ],
    }

    render(<CardDisplay card={doubleFacedCard} />)

    // Initially shows first face
    expect(screen.getByTestId('card-name')).toHaveTextContent('Delver of Secrets')
    expect(screen.getByTestId('card-oracle-text')).toHaveTextContent('At the beginning of your upkeep')

    // Click flip button
    const flipButton = screen.getByTestId('flip-card-button')
    await user.click(flipButton)

    // Now shows second face
    expect(screen.getByTestId('card-name')).toHaveTextContent('Insectile Aberration')
    expect(screen.getByTestId('card-oracle-text')).toHaveTextContent('Flying')

    // Click again to return to first face
    await user.click(flipButton)
    expect(screen.getByTestId('card-name')).toHaveTextContent('Delver of Secrets')
  })

  it('applies white background with rounded corners and shadow', () => {
    const { container } = render(<CardDisplay card={mockCard} />)

    const cardDisplay = container.querySelector('[data-testid="card-display"]')
    expect(cardDisplay).toHaveClass('rounded-lg', 'bg-white', 'shadow-lg')
  })

  it('does not show flip button for single-faced cards', () => {
    render(<CardDisplay card={mockCard} />)

    expect(screen.queryByTestId('flip-card-button')).not.toBeInTheDocument()
  })

  it('wraps keywords in tooltips when present in oracle text', () => {
    const cardWithKeywords: ScryfallCard = {
      ...mockCard,
      oracle_text: 'This creature has flying and trample.',
    }

    render(<CardDisplay card={cardWithKeywords} />)

    // Should find keyword triggers for the keywords
    const triggers = screen.queryAllByTestId('keyword-trigger')
    expect(triggers.length).toBeGreaterThan(0)
  })
})
