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
  CardGrid: ({ cards }: any) => (
    <div data-testid="card-grid">
      {cards.map((card: any) => (
        <div key={card.id}>{card.name}</div>
      ))}
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
})
