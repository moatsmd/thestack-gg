import { render, screen } from '@testing-library/react'
import { OracleTextWithKeywords } from '../OracleTextWithKeywords'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

const renderWithProviders = (component: React.ReactElement) => {
  return render(<DarkModeProvider>{component}</DarkModeProvider>)
}

describe('OracleTextWithKeywords', () => {
  it('returns null for empty text', () => {
    const { container } = renderWithProviders(<OracleTextWithKeywords oracleText="" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders plain text when no keywords found', () => {
    const text = 'This is just regular text with no keywords.'
    renderWithProviders(<OracleTextWithKeywords oracleText={text} />)
    expect(screen.getByText(text)).toBeInTheDocument()
  })

  it('identifies and wraps keywords in tooltips', () => {
    const text = 'This creature has flying.'
    renderWithProviders(<OracleTextWithKeywords oracleText={text} />)

    // Should render the text
    expect(screen.getByText(/This creature has/)).toBeInTheDocument()

    // Should find the keyword trigger
    const triggers = screen.getAllByTestId('keyword-trigger')
    expect(triggers.length).toBeGreaterThan(0)
  })

  it('preserves text formatting', () => {
    const text = 'Flying\nFirst Strike'
    renderWithProviders(<OracleTextWithKeywords oracleText={text} />)

    // Both keywords should be present
    expect(screen.getByText(/Flying/)).toBeInTheDocument()
  })

  it('handles multiple keywords in same text', () => {
    const text = 'Flying, first strike, trample'
    renderWithProviders(<OracleTextWithKeywords oracleText={text} />)

    // Should have multiple keyword triggers
    const triggers = screen.getAllByTestId('keyword-trigger')
    expect(triggers.length).toBeGreaterThanOrEqual(2)
  })

  it('handles text with keywords and plain text mixed', () => {
    const text = 'When this creature enters the battlefield, it gains flying until end of turn.'
    renderWithProviders(<OracleTextWithKeywords oracleText={text} />)

    // Should render plain text parts
    expect(screen.getByText(/When this creature enters the battlefield/)).toBeInTheDocument()

    // Should have keyword trigger
    const triggers = screen.getAllByTestId('keyword-trigger')
    expect(triggers.length).toBeGreaterThan(0)
  })

  it('does not double-wrap nested keywords', () => {
    const text = 'Flashback'
    renderWithProviders(<OracleTextWithKeywords oracleText={text} />)

    // Should only have one trigger (not also match "Flash" inside "Flashback")
    const triggers = screen.getAllByTestId('keyword-trigger')
    expect(triggers.length).toBe(1)
  })

  it('applies custom className', () => {
    const text = 'Flying'
    const { container } = renderWithProviders(
      <OracleTextWithKeywords oracleText={text} className="custom-class" />
    )

    const div = container.querySelector('.custom-class')
    expect(div).toBeInTheDocument()
  })

  it('handles oracle text with no recognizable keywords', () => {
    const text = 'Add three mana of any one color.'
    renderWithProviders(<OracleTextWithKeywords oracleText={text} />)

    // Should render as plain text
    expect(screen.getByText(text)).toBeInTheDocument()

    // Should not have any keyword triggers
    expect(screen.queryAllByTestId('keyword-trigger')).toHaveLength(0)
  })
})
