import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerCounter } from '../PlayerCounter'

describe('PlayerCounter', () => {
  const mockOnLifeChange = jest.fn()

  const defaultProps = {
    playerId: 'player-1',
    playerName: 'Test Player',
    currentLife: 20,
    isSolo: true,
    isCommander: false,
    onLifeChange: mockOnLifeChange,
    onOpenCommanderDamage: jest.fn(),
    onNameChange: jest.fn(),
  }

  beforeEach(() => {
    mockOnLifeChange.mockClear()
  })

  it('should display current life total', () => {
    render(<PlayerCounter {...defaultProps} />)

    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('should call onLifeChange with +1 when plus button clicked', async () => {
    const user = userEvent.setup()
    render(<PlayerCounter {...defaultProps} />)

    const plusButton = screen.getByRole('button', { name: /\+/i })
    await user.click(plusButton)

    expect(mockOnLifeChange).toHaveBeenCalledWith('player-1', 1)
  })

  it('should call onLifeChange with -1 when minus button clicked', async () => {
    const user = userEvent.setup()
    render(<PlayerCounter {...defaultProps} />)

    const minusButton = screen.getByRole('button', { name: /-/i })
    await user.click(minusButton)

    expect(mockOnLifeChange).toHaveBeenCalledWith('player-1', -1)
  })

  it('should render in solo mode with large font', () => {
    const { container } = render(<PlayerCounter {...defaultProps} isSolo={true} />)

    const lifeDisplay = screen.getByText('20')
    expect(lifeDisplay).toHaveClass('text-9xl')
  })

  it('should render in multiplayer mode with smaller font', () => {
    const { container } = render(<PlayerCounter {...defaultProps} isSolo={false} />)

    const lifeDisplay = screen.getByText('20')
    expect(lifeDisplay).toHaveClass('text-6xl')
  })

  it('should display player name', () => {
    render(<PlayerCounter {...defaultProps} />)

    expect(screen.getByText('Test Player')).toBeInTheDocument()
  })

  it('should handle negative life values', () => {
    render(<PlayerCounter {...defaultProps} currentLife={-5} />)

    const lifeDisplay = screen.getByText('-5')
    expect(lifeDisplay).toBeInTheDocument()
    expect(lifeDisplay).toHaveClass('text-red-600')
  })

  it('shows commander icon only in commander mode', () => {
    const { rerender } = render(<PlayerCounter {...defaultProps} isCommander={false} />)

    expect(
      screen.queryByRole('button', { name: /open commander damage/i })
    ).not.toBeInTheDocument()

    rerender(<PlayerCounter {...defaultProps} isCommander={true} />)

    expect(
      screen.getByRole('button', { name: /open commander damage/i })
    ).toBeInTheDocument()
  })

  it('opens commander damage when the card is clicked', async () => {
    const user = userEvent.setup()
    const onOpenCommanderDamage = jest.fn()

    render(
      <PlayerCounter
        {...defaultProps}
        isCommander={true}
        onOpenCommanderDamage={onOpenCommanderDamage}
      />
    )

    await user.click(screen.getByTestId('player-card'))

    expect(onOpenCommanderDamage).toHaveBeenCalledWith('player-1')
  })

  it('allows editing the player name', async () => {
    const user = userEvent.setup()
    const onNameChange = jest.fn()

    render(<PlayerCounter {...defaultProps} onNameChange={onNameChange} />)

    await user.click(screen.getByRole('button', { name: /edit player name/i }))

    const input = screen.getByRole('textbox', { name: /player name/i })
    await user.clear(input)
    await user.type(input, 'Updated Name')
    await user.tab()

    expect(onNameChange).toHaveBeenCalledWith('player-1', 'Updated Name')
  })

  it('does not show commander damage badge when damage is 0', () => {
    render(
      <PlayerCounter
        {...defaultProps}
        isCommander={true}
        commanderDamage={[]}
      />
    )

    expect(screen.queryByTestId('commander-damage-badge')).not.toBeInTheDocument()
  })

  it('shows commander damage badge with total damage', () => {
    render(
      <PlayerCounter
        {...defaultProps}
        isCommander={true}
        commanderDamage={[
          { fromPlayerId: 'player-2', amount: 5 },
          { fromPlayerId: 'player-3', amount: 3 },
        ]}
      />
    )

    const badge = screen.getByTestId('commander-damage-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('8 CMD Damage')
  })

  it('shows gray badge for damage below 18', () => {
    render(
      <PlayerCounter
        {...defaultProps}
        isCommander={true}
        commanderDamage={[{ fromPlayerId: 'player-2', amount: 10 }]}
      />
    )

    const badge = screen.getByTestId('commander-damage-badge')
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-700')
  })

  it('shows yellow badge for damage 18-20', () => {
    render(
      <PlayerCounter
        {...defaultProps}
        isCommander={true}
        commanderDamage={[{ fromPlayerId: 'player-2', amount: 18 }]}
      />
    )

    const badge = screen.getByTestId('commander-damage-badge')
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-700')
  })

  it('shows red badge for damage 21+', () => {
    render(
      <PlayerCounter
        {...defaultProps}
        isCommander={true}
        commanderDamage={[{ fromPlayerId: 'player-2', amount: 21 }]}
      />
    )

    const badge = screen.getByTestId('commander-damage-badge')
    expect(badge).toHaveClass('bg-red-100', 'text-red-700')
  })

  it('does not show badge in non-commander mode even with damage', () => {
    render(
      <PlayerCounter
        {...defaultProps}
        isCommander={false}
        commanderDamage={[{ fromPlayerId: 'player-2', amount: 10 }]}
      />
    )

    expect(screen.queryByTestId('commander-damage-badge')).not.toBeInTheDocument()
  })
})
