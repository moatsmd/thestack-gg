import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CardSearchInput } from '../CardSearchInput'

describe('CardSearchInput', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    suggestions: [],
    onSelectSuggestion: jest.fn(),
    onSearch: jest.fn(),
    isLoading: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders input field and search button', () => {
    render(<CardSearchInput {...defaultProps} />)

    expect(screen.getByPlaceholderText(/search for a card/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('calls onChange when user types', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(<CardSearchInput {...defaultProps} onChange={onChange} />)

    const input = screen.getByPlaceholderText(/search for a card/i)
    await user.type(input, 'Sol Ring')

    expect(onChange).toHaveBeenCalled()
  })

  it('calls onSearch when search button is clicked', async () => {
    const user = userEvent.setup()
    const onSearch = jest.fn()

    render(<CardSearchInput {...defaultProps} onSearch={onSearch} />)

    await user.click(screen.getByRole('button', { name: /search/i }))

    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it('calls onSearch when Enter is pressed without dropdown', async () => {
    const user = userEvent.setup()
    const onSearch = jest.fn()

    render(<CardSearchInput {...defaultProps} value="test" onSearch={onSearch} />)

    const input = screen.getByPlaceholderText(/search for a card/i)
    await user.type(input, '{Enter}')

    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it('displays suggestions dropdown', () => {
    const suggestions = ['Sol Ring', 'Sol Talisman', 'Solemn Simulacrum']

    render(<CardSearchInput {...defaultProps} suggestions={suggestions} />)

    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Sol Ring' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Sol Talisman' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Solemn Simulacrum' })).toBeInTheDocument()
  })

  it('does not display dropdown when suggestions are empty', () => {
    render(<CardSearchInput {...defaultProps} suggestions={[]} />)

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('calls onSelectSuggestion when suggestion is clicked', async () => {
    const user = userEvent.setup()
    const onSelectSuggestion = jest.fn()
    const suggestions = ['Sol Ring', 'Sol Talisman']

    render(
      <CardSearchInput
        {...defaultProps}
        suggestions={suggestions}
        onSelectSuggestion={onSelectSuggestion}
      />
    )

    await user.click(screen.getByRole('option', { name: 'Sol Ring' }))

    expect(onSelectSuggestion).toHaveBeenCalledWith('Sol Ring')
  })

  it('navigates suggestions with arrow keys', async () => {
    const user = userEvent.setup()
    const suggestions = ['Sol Ring', 'Sol Talisman', 'Solemn Simulacrum']

    render(<CardSearchInput {...defaultProps} suggestions={suggestions} />)

    const input = screen.getByPlaceholderText(/search for a card/i)

    // Press down arrow twice
    await user.type(input, '{ArrowDown}')
    expect(screen.getByRole('option', { name: 'Sol Ring' })).toHaveAttribute(
      'aria-selected',
      'true'
    )

    await user.type(input, '{ArrowDown}')
    expect(screen.getByRole('option', { name: 'Sol Talisman' })).toHaveAttribute(
      'aria-selected',
      'true'
    )

    // Press up arrow
    await user.type(input, '{ArrowUp}')
    expect(screen.getByRole('option', { name: 'Sol Ring' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('selects highlighted suggestion with Enter key', async () => {
    const user = userEvent.setup()
    const onSelectSuggestion = jest.fn()
    const suggestions = ['Sol Ring', 'Sol Talisman']

    render(
      <CardSearchInput
        {...defaultProps}
        suggestions={suggestions}
        onSelectSuggestion={onSelectSuggestion}
      />
    )

    const input = screen.getByPlaceholderText(/search for a card/i)

    // Navigate to first suggestion and select with Enter
    await user.type(input, '{ArrowDown}{Enter}')

    expect(onSelectSuggestion).toHaveBeenCalledWith('Sol Ring')
  })

  it('closes dropdown with Escape key', async () => {
    const user = userEvent.setup()
    const suggestions = ['Sol Ring', 'Sol Talisman']

    render(<CardSearchInput {...defaultProps} suggestions={suggestions} />)

    const input = screen.getByPlaceholderText(/search for a card/i)

    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.type(input, '{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup()
    const suggestions = ['Sol Ring', 'Sol Talisman']

    render(
      <div>
        <CardSearchInput {...defaultProps} suggestions={suggestions} />
        <div data-testid="outside">Outside</div>
      </div>
    )

    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.click(screen.getByTestId('outside'))

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  it('shows loading spinner when isLoading is true', () => {
    render(<CardSearchInput {...defaultProps} isLoading={true} />)

    const searchButton = screen.getByRole('button', { name: /search/i })
    expect(searchButton).toBeDisabled()
    expect(searchButton).toHaveTextContent('⟳')
  })

  it('disables search button when loading', async () => {
    const user = userEvent.setup()
    const onSearch = jest.fn()

    render(<CardSearchInput {...defaultProps} isLoading={true} onSearch={onSearch} />)

    const searchButton = screen.getByRole('button', { name: /search/i })
    await user.click(searchButton)

    expect(onSearch).not.toHaveBeenCalled()
  })

  it('has minimum height of 48px for touch targets', () => {
    render(<CardSearchInput {...defaultProps} />)

    const input = screen.getByPlaceholderText(/search for a card/i)
    expect(input).toHaveClass('min-h-[48px]')

    const button = screen.getByRole('button', { name: /search/i })
    expect(button).toHaveClass('min-h-[48px]')
  })

  it('does not navigate past last suggestion', async () => {
    const user = userEvent.setup()
    const suggestions = ['Sol Ring', 'Sol Talisman']

    render(<CardSearchInput {...defaultProps} suggestions={suggestions} />)

    const input = screen.getByPlaceholderText(/search for a card/i)

    // Navigate to last suggestion
    await user.type(input, '{ArrowDown}{ArrowDown}')
    expect(screen.getByRole('option', { name: 'Sol Talisman' })).toHaveAttribute(
      'aria-selected',
      'true'
    )

    // Try to go past last - should stay on last
    await user.type(input, '{ArrowDown}')
    expect(screen.getByRole('option', { name: 'Sol Talisman' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('resets highlight to -1 when navigating up from first item', async () => {
    const user = userEvent.setup()
    const suggestions = ['Sol Ring', 'Sol Talisman']

    render(<CardSearchInput {...defaultProps} suggestions={suggestions} />)

    const input = screen.getByPlaceholderText(/search for a card/i)

    // Navigate to first suggestion
    await user.type(input, '{ArrowDown}')
    expect(screen.getByRole('option', { name: 'Sol Ring' })).toHaveAttribute(
      'aria-selected',
      'true'
    )

    // Navigate up - should deselect
    await user.type(input, '{ArrowUp}')
    expect(screen.getByRole('option', { name: 'Sol Ring' })).toHaveAttribute(
      'aria-selected',
      'false'
    )
  })
})
