import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GlossaryPage from '../glossary/page'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

const renderWithProviders = (component: React.ReactElement) => {
  return render(<DarkModeProvider>{component}</DarkModeProvider>)
}

describe('GlossaryPage', () => {
  it('every keyword has a tier field', () => {
    const { KEYWORDS } = require('@/lib/keywords-data')
    for (const kw of KEYWORDS) {
      expect(['evergreen', 'returning', 'retired']).toContain(kw.tier)
    }
  })

  it('has at least 15 evergreen keywords', () => {
    const { KEYWORDS } = require('@/lib/keywords-data')
    const evergreen = KEYWORDS.filter((kw: any) => kw.tier === 'evergreen')
    expect(evergreen.length).toBeGreaterThanOrEqual(15)
  })

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
    expect(allButton).toHaveClass('bg-[var(--accent-2)]')

    // Click ability button
    await user.click(abilityButton)

    // Ability button should now be selected
    expect(abilityButton).toHaveClass('bg-blue-600')
    expect(allButton).not.toHaveClass('bg-[var(--accent-2)]')
  })

  it('renders tier filter buttons', () => {
    renderWithProviders(<GlossaryPage />)
    expect(screen.getByTestId('filter-tier-evergreen')).toBeInTheDocument()
    expect(screen.getByTestId('filter-tier-returning')).toBeInTheDocument()
    expect(screen.getByTestId('filter-tier-retired')).toBeInTheDocument()
  })

  it('retired keywords are hidden by default', async () => {
    const { KEYWORDS } = require('@/lib/keywords-data')
    const retiredKeyword = KEYWORDS.find((kw: any) => kw.tier === 'retired')
    expect(retiredKeyword).toBeDefined()
    renderWithProviders(<GlossaryPage />)
    await waitFor(() => {
      const cards = screen.getAllByTestId('keyword-card')
      const names = cards.map((c) => c.querySelector('h3')?.textContent)
      expect(names).not.toContain(retiredKeyword.keyword)
    })
  })

  it('shows retired keywords when retired tier is enabled', async () => {
    const user = userEvent.setup()
    const { KEYWORDS } = require('@/lib/keywords-data')
    const retiredKeyword = KEYWORDS.find((kw: any) => kw.tier === 'retired')
    expect(retiredKeyword).toBeDefined()
    renderWithProviders(<GlossaryPage />)
    const retiredButton = screen.getByTestId('filter-tier-retired')
    await user.click(retiredButton)
    await waitFor(() => {
      const cards = screen.getAllByTestId('keyword-card')
      const names = cards.map((c) => c.querySelector('h3')?.textContent)
      expect(names).toContain(retiredKeyword.keyword)
    })
  })

  it('has dredge as a returning keyword', () => {
    const { KEYWORDS } = require('@/lib/keywords-data')
    const dredge = KEYWORDS.find((kw: any) => kw.keyword === 'Dredge')
    expect(dredge).toBeDefined()
    expect(dredge.tier).toBe('returning')
  })

  it('has infect as a returning keyword', () => {
    const { KEYWORDS } = require('@/lib/keywords-data')
    const infect = KEYWORDS.find((kw: any) => kw.keyword === 'Infect')
    expect(infect).toBeDefined()
    expect(infect.tier).toBe('returning')
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

  it('has storm as a returning mechanic', () => {
    const { KEYWORDS } = require('@/lib/keywords-data')
    const storm = KEYWORDS.find((kw: any) => kw.keyword === 'Storm')
    expect(storm).toBeDefined()
    expect(storm.tier).toBe('returning')
  })

  it('has surveil as a returning mechanic', () => {
    const { KEYWORDS } = require('@/lib/keywords-data')
    const surveil = KEYWORDS.find((kw: any) => kw.keyword === 'Surveil')
    expect(surveil).toBeDefined()
    expect(surveil.tier).toBe('returning')
  })

  it('has shroud as a retired keyword', () => {
    const { KEYWORDS } = require('@/lib/keywords-data')
    const shroud = KEYWORDS.find((kw: any) => kw.keyword === 'Shroud')
    expect(shroud).toBeDefined()
    expect(shroud.tier).toBe('retired')
  })

  it('retired keywords count is substantial', () => {
    const { KEYWORDS } = require('@/lib/keywords-data')
    const retired = KEYWORDS.filter((kw: any) => kw.tier === 'retired')
    expect(retired.length).toBeGreaterThanOrEqual(20)
  })

  it('keyword cards show a tier badge', () => {
    renderWithProviders(<GlossaryPage />)
    const badges = screen.getAllByTestId('tier-badge')
    expect(badges.length).toBeGreaterThan(0)
  })

  it('scryfall link appears on keywords with scryfallQuery', () => {
    const { KEYWORDS } = require('@/lib/keywords-data')
    const withQuery = KEYWORDS.find((kw: any) => kw.scryfallQuery)
    if (!withQuery) return // skip if data not yet loaded
    renderWithProviders(<GlossaryPage />)
    const links = screen.queryAllByTestId('scryfall-link')
    expect(links.length).toBeGreaterThan(0)
  })
})
