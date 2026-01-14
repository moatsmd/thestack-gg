import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CardGrid } from '../CardGrid'
import { ScryfallCard } from '@/types/scryfall'

const mockCards: ScryfallCard[] = [
  {
    id: '1',
    name: 'Card 1',
    type_line: 'Creature',
    image_uris: { small: 'img1.jpg' } as any,
  } as ScryfallCard,
  {
    id: '2',
    name: 'Card 2',
    type_line: 'Instant',
    image_uris: { small: 'img2.jpg' } as any,
  } as ScryfallCard,
]

describe('CardGrid', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }))
  })

  it('renders all cards in grid', () => {
    render(
      <CardGrid
        cards={mockCards}
        onCardClick={() => {}}
        onLoadMore={() => {}}
        hasMore={false}
        isLoadingMore={false}
      />
    )

    expect(screen.getByText('Card 1')).toBeInTheDocument()
    expect(screen.getByText('Card 2')).toBeInTheDocument()
  })

  it('calls onCardClick when card is clicked', async () => {
    const user = userEvent.setup()
    const handleCardClick = jest.fn()

    render(
      <CardGrid
        cards={mockCards}
        onCardClick={handleCardClick}
        onLoadMore={() => {}}
        hasMore={false}
        isLoadingMore={false}
      />
    )

    await user.click(screen.getByText('Card 1'))

    expect(handleCardClick).toHaveBeenCalledWith(mockCards[0])
  })

  it('shows loading spinner when isLoadingMore is true', () => {
    render(
      <CardGrid
        cards={mockCards}
        onCardClick={() => {}}
        onLoadMore={() => {}}
        hasMore={true}
        isLoadingMore={true}
      />
    )

    expect(screen.getByText(/loading more/i)).toBeInTheDocument()
  })

  it('shows sentinel element when hasMore is true', () => {
    render(
      <CardGrid
        cards={mockCards}
        onCardClick={() => {}}
        onLoadMore={() => {}}
        hasMore={true}
        isLoadingMore={false}
      />
    )

    expect(screen.getByTestId('infinite-scroll-sentinel')).toBeInTheDocument()
  })

  it('does not show sentinel when hasMore is false', () => {
    render(
      <CardGrid
        cards={mockCards}
        onCardClick={() => {}}
        onLoadMore={() => {}}
        hasMore={false}
        isLoadingMore={false}
      />
    )

    expect(screen.queryByTestId('infinite-scroll-sentinel')).not.toBeInTheDocument()
  })
})
