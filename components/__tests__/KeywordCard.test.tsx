import { render, screen } from '@testing-library/react'
import { KeywordCard } from '../KeywordCard'
import { KeywordDefinition } from '@/lib/keywords-data'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

const renderWithProviders = (component: React.ReactElement) => {
  return render(<DarkModeProvider>{component}</DarkModeProvider>)
}

describe('KeywordCard', () => {
  const mockKeyword: KeywordDefinition = {
    keyword: 'Flying',
    type: 'ability',
    definition: 'This creature can only be blocked by creatures with flying or reach.',
    reminder: "This creature can't be blocked except by creatures with flying and/or reach.",
    example: 'Serra Angel',
    introduced: 'Limited Edition Alpha',
  }

  it('renders keyword name', () => {
    renderWithProviders(<KeywordCard keyword={mockKeyword} />)
    expect(screen.getByText('Flying')).toBeInTheDocument()
  })

  it('renders type badge', () => {
    renderWithProviders(<KeywordCard keyword={mockKeyword} />)
    expect(screen.getByText('ability')).toBeInTheDocument()
  })

  it('renders definition', () => {
    renderWithProviders(<KeywordCard keyword={mockKeyword} />)
    expect(
      screen.getByText('This creature can only be blocked by creatures with flying or reach.')
    ).toBeInTheDocument()
  })

  it('renders reminder text when provided', () => {
    renderWithProviders(<KeywordCard keyword={mockKeyword} />)
    expect(
      screen.getByText(
        /This creature can't be blocked except by creatures with flying and\/or reach./
      )
    ).toBeInTheDocument()
  })

  it('renders example when provided', () => {
    renderWithProviders(<KeywordCard keyword={mockKeyword} />)
    expect(screen.getByText('Serra Angel')).toBeInTheDocument()
    expect(screen.getByText('Example:')).toBeInTheDocument()
  })

  it('renders introduced when provided', () => {
    renderWithProviders(<KeywordCard keyword={mockKeyword} />)
    expect(screen.getByText('Limited Edition Alpha')).toBeInTheDocument()
    expect(screen.getByText('Introduced:')).toBeInTheDocument()
  })

  it('does not render reminder text when not provided', () => {
    const keywordWithoutReminder: KeywordDefinition = {
      keyword: 'Test',
      type: 'action',
      definition: 'Test definition',
    }
    renderWithProviders(<KeywordCard keyword={keywordWithoutReminder} />)
    expect(screen.queryByText(/\(/)).not.toBeInTheDocument()
  })

  it('does not render example when not provided', () => {
    const keywordWithoutExample: KeywordDefinition = {
      keyword: 'Test',
      type: 'action',
      definition: 'Test definition',
    }
    renderWithProviders(<KeywordCard keyword={keywordWithoutExample} />)
    expect(screen.queryByText('Example:')).not.toBeInTheDocument()
  })

  it('does not render introduced when not provided', () => {
    const keywordWithoutIntroduced: KeywordDefinition = {
      keyword: 'Test',
      type: 'action',
      definition: 'Test definition',
    }
    renderWithProviders(<KeywordCard keyword={keywordWithoutIntroduced} />)
    expect(screen.queryByText('Introduced:')).not.toBeInTheDocument()
  })

  it('applies correct badge color for ability type', () => {
    renderWithProviders(<KeywordCard keyword={mockKeyword} />)
    const badge = screen.getByText('ability')
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800')
  })

  it('applies correct badge color for action type', () => {
    const actionKeyword: KeywordDefinition = {
      keyword: 'Destroy',
      type: 'action',
      definition: 'Test definition',
    }
    renderWithProviders(<KeywordCard keyword={actionKeyword} />)
    const badge = screen.getByText('action')
    expect(badge).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('applies correct badge color for mechanic type', () => {
    const mechanicKeyword: KeywordDefinition = {
      keyword: 'Flashback',
      type: 'mechanic',
      definition: 'Test definition',
    }
    renderWithProviders(<KeywordCard keyword={mechanicKeyword} />)
    const badge = screen.getByText('mechanic')
    expect(badge).toHaveClass('bg-purple-100', 'text-purple-800')
  })
})
