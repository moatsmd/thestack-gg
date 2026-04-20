import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TokensPage from '../tokens/page'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

const renderTokens = () => render(<DarkModeProvider><TokensPage /></DarkModeProvider>)

describe('token data', () => {
  it('TOKENS array exists and has entries', () => {
    const { TOKENS } = require('@/lib/tokens-data')
    expect(Array.isArray(TOKENS)).toBe(true)
    expect(TOKENS.length).toBeGreaterThan(10)
  })

  it('every token has required fields', () => {
    const { TOKENS } = require('@/lib/tokens-data')
    for (const t of TOKENS) {
      expect(t.name).toBeTruthy()
      expect(Array.isArray(t.colors)).toBe(true)
      expect(['creature', 'artifact', 'enchantment', 'emblem']).toContain(t.type)
      expect(Array.isArray(t.abilities)).toBe(true)
      expect(Array.isArray(t.madeBy)).toBe(true)
    }
  })

  it('Goblin token exists', () => {
    const { TOKENS } = require('@/lib/tokens-data')
    const goblin = TOKENS.find((t: any) => t.name === 'Goblin')
    expect(goblin).toBeDefined()
    expect(goblin.colors).toContain('R')
    expect(goblin.type).toBe('creature')
  })

  it('Treasure token exists', () => {
    const { TOKENS } = require('@/lib/tokens-data')
    const treasure = TOKENS.find((t: any) => t.name === 'Treasure')
    expect(treasure).toBeDefined()
    expect(treasure.type).toBe('artifact')
  })
})

describe('searchTokens', () => {
  it('returns all tokens for empty query', () => {
    const { searchTokens, TOKENS } = require('@/lib/tokens-data')
    expect(searchTokens('').length).toBe(TOKENS.length)
  })

  it('returns matching tokens for a name query', () => {
    const { searchTokens } = require('@/lib/tokens-data')
    const results = searchTokens('goblin')
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((t: any) => t.name.toLowerCase().includes('goblin') || t.madeBy.some((m: any) => m.toLowerCase().includes('goblin')))).toBe(true)
  })

  it('returns empty array for non-matching query', () => {
    const { searchTokens } = require('@/lib/tokens-data')
    expect(searchTokens('zzznomatch').length).toBe(0)
  })

  it('trims whitespace in query', () => {
    const { searchTokens, TOKENS } = require('@/lib/tokens-data')
    expect(searchTokens('   ').length).toBe(TOKENS.length)
  })
})

describe('TokensPage', () => {
  it('renders heading', () => {
    renderTokens()
    expect(screen.getByRole('heading', { name: /tokens/i })).toBeInTheDocument()
  })

  it('renders search input', () => {
    renderTokens()
    expect(screen.getByTestId('token-search')).toBeInTheDocument()
  })

  it('renders token cards', () => {
    renderTokens()
    const cards = screen.getAllByTestId('token-card')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('filters by search query', async () => {
    const user = userEvent.setup()
    renderTokens()
    await user.type(screen.getByTestId('token-search'), 'goblin')
    await waitFor(() => {
      const cards = screen.getAllByTestId('token-card')
      expect(cards.some((c) => c.textContent?.toLowerCase().includes('goblin'))).toBe(true)
    })
  })

  it('color filter buttons exist', () => {
    renderTokens()
    expect(screen.getByTestId('color-filter-R')).toBeInTheDocument()
    expect(screen.getByTestId('color-filter-W')).toBeInTheDocument()
    expect(screen.getByTestId('color-filter-C')).toBeInTheDocument()
  })

  it('type filter buttons exist', () => {
    renderTokens()
    expect(screen.getByTestId('type-filter-creature')).toBeInTheDocument()
    expect(screen.getByTestId('type-filter-artifact')).toBeInTheDocument()
    expect(screen.getByTestId('type-filter-emblem')).toBeInTheDocument()
  })

  it('shows empty state when no match', async () => {
    const user = userEvent.setup()
    renderTokens()
    await user.type(screen.getByTestId('token-search'), 'zzznomatch')
    await waitFor(() => {
      expect(screen.getByTestId('tokens-empty-state')).toBeInTheDocument()
    })
  })
})
