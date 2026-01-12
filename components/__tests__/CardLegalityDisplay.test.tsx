import { render, screen } from '@testing-library/react'
import { CardLegalityDisplay } from '../CardLegalityDisplay'
import { Legality } from '@/types/scryfall'

describe('CardLegalityDisplay', () => {
  it('displays legal formats with green background', () => {
    const legalities: Record<string, Legality> = {
      commander: 'legal',
      standard: 'legal',
    }

    render(<CardLegalityDisplay legalities={legalities} />)

    const commanderBadge = screen.getByTestId('legality-commander')
    const standardBadge = screen.getByTestId('legality-standard')

    expect(commanderBadge).toHaveTextContent('Commander')
    expect(commanderBadge).toHaveClass('bg-green-100', 'text-green-700')
    expect(commanderBadge).toHaveAttribute('data-status', 'legal')

    expect(standardBadge).toHaveTextContent('Standard')
    expect(standardBadge).toHaveClass('bg-green-100', 'text-green-700')
  })

  it('displays banned formats with red background', () => {
    const legalities: Record<string, Legality> = {
      modern: 'banned',
    }

    render(<CardLegalityDisplay legalities={legalities} />)

    const badge = screen.getByTestId('legality-modern')
    expect(badge).toHaveTextContent('Modern')
    expect(badge).toHaveClass('bg-red-100', 'text-red-700')
    expect(badge).toHaveAttribute('data-status', 'banned')
  })

  it('displays restricted formats with yellow background', () => {
    const legalities: Record<string, Legality> = {
      vintage: 'restricted',
    }

    render(<CardLegalityDisplay legalities={legalities} />)

    const badge = screen.getByTestId('legality-vintage')
    expect(badge).toHaveTextContent('Vintage')
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-700')
    expect(badge).toHaveAttribute('data-status', 'restricted')
  })

  it('skips not_legal formats', () => {
    const legalities: Record<string, Legality> = {
      commander: 'legal',
      standard: 'not_legal',
      modern: 'not_legal',
    }

    render(<CardLegalityDisplay legalities={legalities} />)

    expect(screen.getByTestId('legality-commander')).toBeInTheDocument()
    expect(screen.queryByTestId('legality-standard')).not.toBeInTheDocument()
    expect(screen.queryByTestId('legality-modern')).not.toBeInTheDocument()
  })

  it('displays priority formats first', () => {
    const legalities: Record<string, Legality> = {
      alchemy: 'legal',
      brawl: 'legal',
      commander: 'legal',
      legacy: 'legal',
      modern: 'legal',
      pioneer: 'legal',
      standard: 'legal',
      vintage: 'legal',
    }

    render(<CardLegalityDisplay legalities={legalities} />)

    const badges = screen.getAllByTestId(/legality-/)
    const badgeFormats = badges.map((badge) => badge.getAttribute('data-testid')?.replace('legality-', ''))

    // Priority formats should come first: commander, standard, modern, pioneer, legacy, vintage
    expect(badgeFormats[0]).toBe('commander')
    expect(badgeFormats[1]).toBe('standard')
    expect(badgeFormats[2]).toBe('modern')
    expect(badgeFormats[3]).toBe('pioneer')
    expect(badgeFormats[4]).toBe('legacy')
    expect(badgeFormats[5]).toBe('vintage')
    // Alchemy and brawl should come after, sorted alphabetically
    expect(badgeFormats[6]).toBe('alchemy')
    expect(badgeFormats[7]).toBe('brawl')
  })

  it('uses responsive grid layout', () => {
    const legalities: Record<string, Legality> = {
      commander: 'legal',
      modern: 'legal',
      standard: 'legal',
    }

    const { container } = render(<CardLegalityDisplay legalities={legalities} />)

    const grid = container.querySelector('.grid')
    expect(grid).toHaveClass('grid-cols-2', 'sm:grid-cols-3', 'md:grid-cols-4')
  })

  it('displays message when no legal formats', () => {
    const legalities: Record<string, Legality> = {
      commander: 'not_legal',
      modern: 'not_legal',
      standard: 'not_legal',
    }

    render(<CardLegalityDisplay legalities={legalities} />)

    expect(screen.getByText('Not legal in any format')).toBeInTheDocument()
  })

  it('formats multi-word format names correctly', () => {
    const legalities: Record<string, Legality> = {
      penny_dreadful: 'legal',
    }

    render(<CardLegalityDisplay legalities={legalities} />)

    expect(screen.getByText('Penny Dreadful')).toBeInTheDocument()
  })

  it('renders badges with rounded pills and padding', () => {
    const legalities: Record<string, Legality> = {
      commander: 'legal',
    }

    render(<CardLegalityDisplay legalities={legalities} />)

    const badge = screen.getByTestId('legality-commander')
    expect(badge).toHaveClass('rounded-full', 'px-3', 'py-1')
  })

  it('handles all legality statuses correctly', () => {
    const legalities: Record<string, Legality> = {
      format1: 'legal',
      format2: 'banned',
      format3: 'restricted',
      format4: 'not_legal',
    }

    render(<CardLegalityDisplay legalities={legalities} />)

    expect(screen.getByTestId('legality-format1')).toHaveClass('bg-green-100', 'text-green-700')
    expect(screen.getByTestId('legality-format2')).toHaveClass('bg-red-100', 'text-red-700')
    expect(screen.getByTestId('legality-format3')).toHaveClass('bg-yellow-100', 'text-yellow-700')
    // format4 should be filtered out
    expect(screen.queryByTestId('legality-format4')).not.toBeInTheDocument()
  })
})
