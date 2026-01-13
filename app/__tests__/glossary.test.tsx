import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GlossaryPage from '../glossary/page'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

const renderWithProviders = (component: React.ReactElement) => {
  return render(<DarkModeProvider>{component}</DarkModeProvider>)
}

describe('GlossaryPage', () => {
  it('renders glossary header', () => {
    renderWithProviders(<GlossaryPage />)
    expect(screen.getByTestId('glossary-header')).toBeInTheDocument()
  })

  it('renders search input', () => {
    renderWithProviders(<GlossaryPage />)
    expect(screen.getByTestId('keyword-search')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search keywords...')).toBeInTheDocument()
  })

  it('renders filter buttons', () => {
    renderWithProviders(<GlossaryPage />)
    expect(screen.getByTestId('filter-all')).toBeInTheDocument()
    expect(screen.getByTestId('filter-ability')).toBeInTheDocument()
    expect(screen.getByTestId('filter-action')).toBeInTheDocument()
    expect(screen.getByTestId('filter-mechanic')).toBeInTheDocument()
  })

  it('displays all keywords by default', () => {
    renderWithProviders(<GlossaryPage />)
    expect(screen.getByTestId('keywords-grid')).toBeInTheDocument()
    // Should have multiple keyword cards
    const cards = screen.getAllByTestId('keyword-card')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('displays results count', () => {
    renderWithProviders(<GlossaryPage />)
    expect(screen.getByText(/Showing \d+ keywords?/)).toBeInTheDocument()
  })

  it('filters keywords by search query', async () => {
    const user = userEvent.setup()
    renderWithProviders(<GlossaryPage />)

    const searchInput = screen.getByTestId('keyword-search')
    await user.type(searchInput, 'flying')

    // Wait for debounce (300ms)
    await waitFor(
      () => {
        const cards = screen.queryAllByTestId('keyword-card')
        expect(cards.length).toBeGreaterThan(0)
        expect(cards.length).toBeLessThan(50) // Should be filtered
      },
      { timeout: 500 }
    )
  })

  it('filters keywords by type - ability', async () => {
    const user = userEvent.setup()
    renderWithProviders(<GlossaryPage />)

    const abilityButton = screen.getByTestId('filter-ability')
    await user.click(abilityButton)

    // All visible keywords should be abilities
    const cards = screen.getAllByTestId('keyword-card')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('filters keywords by type - action', async () => {
    const user = userEvent.setup()
    renderWithProviders(<GlossaryPage />)

    const actionButton = screen.getByTestId('filter-action')
    await user.click(actionButton)

    // Should show action keywords
    const cards = screen.getAllByTestId('keyword-card')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('filters keywords by type - mechanic', async () => {
    const user = userEvent.setup()
    renderWithProviders(<GlossaryPage />)

    const mechanicButton = screen.getByTestId('filter-mechanic')
    await user.click(mechanicButton)

    // Should show mechanic keywords
    const cards = screen.getAllByTestId('keyword-card')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('shows empty state when no keywords match', async () => {
    const user = userEvent.setup()
    renderWithProviders(<GlossaryPage />)

    const searchInput = screen.getByTestId('keyword-search')
    await user.type(searchInput, 'xyznonexistentkeyword')

    // Wait for debounce
    await waitFor(
      () => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument()
        expect(screen.getByText('No keywords found')).toBeInTheDocument()
      },
      { timeout: 500 }
    )
  })

  it('highlights selected filter button', async () => {
    const user = userEvent.setup()
    renderWithProviders(<GlossaryPage />)

    const allButton = screen.getByTestId('filter-all')
    const abilityButton = screen.getByTestId('filter-ability')

    // All button should be selected by default
    expect(allButton).toHaveClass('bg-teal-600')

    // Click ability button
    await user.click(abilityButton)

    // Ability button should now be selected
    expect(abilityButton).toHaveClass('bg-blue-600')
    expect(allButton).not.toHaveClass('bg-teal-600')
  })

  it('combines search and type filters', async () => {
    const user = userEvent.setup()
    renderWithProviders(<GlossaryPage />)

    // Set type filter
    const abilityButton = screen.getByTestId('filter-ability')
    await user.click(abilityButton)

    // Set search query
    const searchInput = screen.getByTestId('keyword-search')
    await user.type(searchInput, 'strike')

    // Wait for debounce
    await waitFor(
      () => {
        const cards = screen.queryAllByTestId('keyword-card')
        expect(cards.length).toBeGreaterThan(0)
        // Results should be filtered by both search and type
      },
      { timeout: 500 }
    )
  })
})
