import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CardSearch } from '../CardSearch'
import * as useCardSearchModule from '@/hooks/useCardSearch'

// Mock the useCardSearch hook
jest.mock('@/hooks/useCardSearch')

// Mock child components
jest.mock('../CardSearchInput', () => ({
  CardSearchInput: ({ value, onChange, onSearch }: any) => (
    <div data-testid="card-search-input">
      <input
        placeholder="Search for a card..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button onClick={onSearch}>Search</button>
    </div>
  ),
}))

jest.mock('../CardSearchHelp', () => ({
  CardSearchHelp: () => <div data-testid="card-search-help">Search Help</div>,
}))

jest.mock('../CardDisplay', () => ({
  CardDisplay: ({ card }: any) => <div data-testid="card-display">{card.name}</div>,
}))

jest.mock('../CardGrid', () => ({
  CardGrid: ({ cards, onCardClick, onLoadMore, hasMore, isLoadingMore }: any) => (
    <div data-testid="card-grid">
      <div data-testid="card-grid-props" data-onloadmore={!!onLoadMore} data-hasmore={hasMore} data-isloadingmore={isLoadingMore}>
        {cards.map((card: any) => (
          <button key={card.id} onClick={() => onCardClick(card)}>{card.name}</button>
        ))}
      </div>
    </div>
  ),
}))

jest.mock('../ViewModeToggle', () => ({
  ViewModeToggle: ({ mode, onModeChange }: any) => (
    <div>
      <button onClick={() => onModeChange('single')}>Single</button>
      <button onClick={() => onModeChange('grid')}>Grid</button>
      <span data-testid="current-mode">{mode}</span>
    </div>
  ),
}))

jest.mock('../ErrorBanner', () => ({
  ErrorBanner: ({ message }: any) => <div role="alert">{message}</div>,
}))

jest.mock('../CardModal', () => ({
  CardModal: ({ card, isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="card-modal">
        <div>{card.name}</div>
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}))

describe('CardSearch', () => {
  const mockUseCardSearch = useCardSearchModule.useCardSearch as jest.MockedFunction<
    typeof useCardSearchModule.useCardSearch
  >

  const defaultHookReturn = {
    query: '',
    results: [],
    suggestions: [],
    selectedCard: null,
    isLoading: false,
    isLoadingMore: false,
    hasMore: false,
    error: null,
    setQuery: jest.fn(),
    selectCard: jest.fn(),
    clearSelection: jest.fn(),
    search: jest.fn(),
    loadMore: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCardSearch.mockReturnValue(defaultHookReturn)
  })

  it('renders search input and help', () => {
    render(<CardSearch />)

    expect(screen.getByTestId('card-search-input')).toBeInTheDocument()
    expect(screen.getByTestId('card-search-help')).toBeInTheDocument()
  })

  it('displays error banner when error exists', () => {
    mockUseCardSearch.mockReturnValue({
      ...defaultHookReturn,
      error: 'Failed to fetch cards',
    })

    render(<CardSearch />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Failed to fetch cards')).toBeInTheDocument()
  })

  it('does not display error banner when no error', () => {
    mockUseCardSearch.mockReturnValue({
      ...defaultHookReturn,
      error: null,
    })

    render(<CardSearch />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows view mode toggle when multiple results exist', () => {
    mockUseCardSearch.mockReturnValue({
      ...defaultHookReturn,
      results: [
        { id: '1', name: 'Card 1' } as any,
        { id: '2', name: 'Card 2' } as any,
      ],
    })

    render(<CardSearch />)

    expect(screen.getByText('Single')).toBeInTheDocument()
    expect(screen.getByText('Grid')).toBeInTheDocument()
  })

  it('does not show toggle when only one result', () => {
    mockUseCardSearch.mockReturnValue({
      ...defaultHookReturn,
      results: [{ id: '1', name: 'Card 1' } as any],
    })

    render(<CardSearch />)

    expect(screen.queryByText('Grid')).not.toBeInTheDocument()
  })

  it('shows grid view when grid mode selected', async () => {
    const user = userEvent.setup()

    mockUseCardSearch.mockReturnValue({
      ...defaultHookReturn,
      results: [
        { id: '1', name: 'Card 1' } as any,
        { id: '2', name: 'Card 2' } as any,
      ],
    })

    render(<CardSearch />)

    // Click grid button
    await user.click(screen.getByText('Grid'))

    await waitFor(() => {
      expect(screen.getByTestId('card-grid')).toBeInTheDocument()
    })
  })

  it('shows single card view in single mode', async () => {
    mockUseCardSearch.mockReturnValue({
      ...defaultHookReturn,
      results: [{ id: '1', name: 'Card 1' } as any],
      selectedCard: { id: '1', name: 'Card 1' } as any,
    })

    render(<CardSearch />)

    expect(screen.getByTestId('card-display')).toBeInTheDocument()
    expect(screen.queryByTestId('card-grid')).not.toBeInTheDocument()
  })

  it('passes pagination props to CardGrid when in grid view', async () => {
    const user = userEvent.setup()

    mockUseCardSearch.mockReturnValue({
      ...defaultHookReturn,
      results: [
        { id: '1', name: 'Card 1' } as any,
        { id: '2', name: 'Card 2' } as any,
      ],
      hasMore: true,
      isLoadingMore: false,
    })

    render(<CardSearch />)

    await user.click(screen.getByText('Grid'))

    const gridProps = screen.getByTestId('card-grid-props')
    expect(gridProps).toHaveAttribute('data-onloadmore', 'true')
    expect(gridProps).toHaveAttribute('data-hasmore', 'true')
    expect(gridProps).toHaveAttribute('data-isloadingmore', 'false')
  })

  it('opens modal when card clicked in grid view', async () => {
    const user = userEvent.setup()

    mockUseCardSearch.mockReturnValue({
      ...defaultHookReturn,
      results: [
        { id: '1', name: 'Card 1' } as any,
        { id: '2', name: 'Card 2' } as any,
      ],
    })

    render(<CardSearch />)

    // Switch to grid
    await user.click(screen.getByText('Grid'))

    // Click card in grid
    await user.click(screen.getByText('Card 1'))

    // Modal should open
    expect(screen.getByTestId('card-modal')).toBeInTheDocument()
  })

  it('closes modal when close button clicked', async () => {
    const user = userEvent.setup()

    mockUseCardSearch.mockReturnValue({
      ...defaultHookReturn,
      results: [
        { id: '1', name: 'Card 1' } as any,
        { id: '2', name: 'Card 2' } as any,
      ],
    })

    render(<CardSearch />)

    // Switch to grid and click card
    await user.click(screen.getByText('Grid'))
    await user.click(screen.getByText('Card 1'))

    expect(screen.getByTestId('card-modal')).toBeInTheDocument()

    // Close modal
    await user.click(screen.getByText('Close Modal'))

    expect(screen.queryByTestId('card-modal')).not.toBeInTheDocument()
  })

  it('does not show grid with single result even in grid mode', async () => {
    mockUseCardSearch.mockReturnValue({
      ...defaultHookReturn,
      results: [{ id: '1', name: 'Card 1' } as any],
    })

    render(<CardSearch />)

    // No toggle shown (only 1 result)
    expect(screen.queryByText('Grid')).not.toBeInTheDocument()

    // Grid should not render (results.length === 1)
    expect(screen.queryByTestId('card-grid')).not.toBeInTheDocument()
  })
})
