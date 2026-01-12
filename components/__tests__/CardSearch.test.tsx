import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CardSearch } from '../CardSearch'
import * as useCardSearchModule from '@/hooks/useCardSearch'

// Mock the useCardSearch hook
jest.mock('@/hooks/useCardSearch')

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
    error: null,
    setQuery: jest.fn(),
    selectCard: jest.fn(),
    clearSelection: jest.fn(),
    search: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCardSearch.mockReturnValue(defaultHookReturn)
  })

  it('renders search input and help', () => {
    render(<CardSearch />)

    expect(screen.getByPlaceholderText(/search for a card/i)).toBeInTheDocument()
    expect(screen.getByText(/search help/i)).toBeInTheDocument()
  })

  it('passes query to input component', () => {
    mockUseCardSearch.mockReturnValue({
      ...defaultHookReturn,
      query: 'Sol Ring',
    })

    render(<CardSearch />)

    expect(screen.getByPlaceholderText(/search for a card/i)).toHaveValue('Sol Ring')
  })

  it('calls setQuery when input changes', async () => {
    const user = userEvent.setup()
    const setQuery = jest.fn()

    mockUseCardSearch.mockReturnValue({
      ...defaultHookReturn,
      setQuery,
    })

    render(<CardSearch />)

    const input = screen.getByPlaceholderText(/search for a card/i)
    await user.type(input, 'test')

    expect(setQuery).toHaveBeenCalled()
  })

  it('displays suggestions from hook', () => {
    mockUseCardSearch.mockReturnValue({
      ...defaultHookReturn,
      suggestions: ['Sol Ring', 'Sol Talisman', 'Solemn Simulacrum'],
    })

    render(<CardSearch />)

    expect(screen.getByRole('option', { name: 'Sol Ring' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Sol Talisman' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Solemn Simulacrum' })).toBeInTheDocument()
  })

  it('calls setQuery when suggestion is selected', async () => {
    const user = userEvent.setup()
    const setQuery = jest.fn()

    mockUseCardSearch.mockReturnValue({
      ...defaultHookReturn,
      suggestions: ['Sol Ring', 'Sol Talisman'],
      setQuery,
    })

    render(<CardSearch />)

    await user.click(screen.getByRole('option', { name: 'Sol Ring' }))

    expect(setQuery).toHaveBeenCalledWith('Sol Ring')
  })

  it('calls search when search button is clicked', async () => {
    const user = userEvent.setup()
    const search = jest.fn()

    mockUseCardSearch.mockReturnValue({
      ...defaultHookReturn,
      search,
    })

    render(<CardSearch />)

    await user.click(screen.getByRole('button', { name: /^search$/i }))

    expect(search).toHaveBeenCalledTimes(1)
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

  it('shows loading state when searching', () => {
    mockUseCardSearch.mockReturnValue({
      ...defaultHookReturn,
      isLoading: true,
    })

    render(<CardSearch />)

    const searchButton = screen.getByRole('button', { name: /^search$/i })
    expect(searchButton).toBeDisabled()
    expect(searchButton).toHaveTextContent('⟳')
  })

  it('does not show loading state when not searching', () => {
    mockUseCardSearch.mockReturnValue({
      ...defaultHookReturn,
      isLoading: false,
    })

    render(<CardSearch />)

    const searchButton = screen.getByRole('button', { name: /^search$/i })
    expect(searchButton).not.toBeDisabled()
    expect(searchButton).toHaveTextContent('Search')
  })

  it('integrates all subcomponents', () => {
    render(<CardSearch />)

    // Check that all subcomponents are rendered
    expect(screen.getByTestId('card-search-input')).toBeInTheDocument()
    expect(screen.getByTestId('card-search-help')).toBeInTheDocument()
  })

  it('expands help section on click', async () => {
    const user = userEvent.setup()
    render(<CardSearch />)

    const helpButton = screen.getByRole('button', { name: /search help/i })
    expect(helpButton).toHaveAttribute('aria-expanded', 'false')

    await user.click(helpButton)

    expect(helpButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/Scryfall search syntax/i)).toBeInTheDocument()
  })
})
