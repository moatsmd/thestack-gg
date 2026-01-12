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
    onOpenPoisonCounter: jest.fn(),
    onOpenManaPool: jest.fn(),
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

  it('shows commander damage badge with max damage from any commander', () => {
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
    expect(badge).toHaveTextContent('5 CMD Damage (max)')
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

  it('shows poison icon button', () => {
    render(<PlayerCounter {...defaultProps} />)

    expect(screen.getByRole('button', { name: /open poison counters/i })).toBeInTheDocument()
  })

  it('shows mana pool icon button', () => {
    render(<PlayerCounter {...defaultProps} />)

    expect(screen.getByRole('button', { name: /open mana pool/i })).toBeInTheDocument()
  })

  it('opens poison counter modal when icon is clicked', async () => {
    const user = userEvent.setup()
    const onOpenPoisonCounter = jest.fn()

    render(<PlayerCounter {...defaultProps} onOpenPoisonCounter={onOpenPoisonCounter} />)

    await user.click(screen.getByRole('button', { name: /open poison counters/i }))

    expect(onOpenPoisonCounter).toHaveBeenCalledWith('player-1')
  })

  it('opens mana pool modal when icon is clicked', async () => {
    const user = userEvent.setup()
    const onOpenManaPool = jest.fn()

    render(<PlayerCounter {...defaultProps} onOpenManaPool={onOpenManaPool} />)

    await user.click(screen.getByRole('button', { name: /open mana pool/i }))

    expect(onOpenManaPool).toHaveBeenCalledWith('player-1')
  })

  it('does not show poison badge when count is 0', () => {
    render(<PlayerCounter {...defaultProps} poisonCounters={0} />)

    expect(screen.queryByTestId('poison-badge')).not.toBeInTheDocument()
  })

  it('shows poison badge when count > 0', () => {
    render(<PlayerCounter {...defaultProps} poisonCounters={5} />)

    const badge = screen.getByTestId('poison-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('5 Poison')
  })

  it('shows gray poison badge for 0-7 counters', () => {
    render(<PlayerCounter {...defaultProps} poisonCounters={7} />)

    const badge = screen.getByTestId('poison-badge')
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-700')
  })

  it('shows yellow poison badge for 8-9 counters', () => {
    render(<PlayerCounter {...defaultProps} poisonCounters={8} />)

    const badge = screen.getByTestId('poison-badge')
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-700')
  })

  it('shows red poison badge for 10+ counters', () => {
    render(<PlayerCounter {...defaultProps} poisonCounters={10} />)

    const badge = screen.getByTestId('poison-badge')
    expect(badge).toHaveClass('bg-red-100', 'text-red-700')
  })

  it('does not show mana badge when total is 0', () => {
    render(
      <PlayerCounter
        {...defaultProps}
        manaPool={{ white: 0, blue: 0, black: 0, red: 0, green: 0, colorless: 0 }}
      />
    )

    expect(screen.queryByTestId('mana-badge')).not.toBeInTheDocument()
  })

  it('shows mana badge with total count', () => {
    render(
      <PlayerCounter
        {...defaultProps}
        manaPool={{ white: 2, blue: 1, black: 0, red: 3, green: 1, colorless: 0 }}
      />
    )

    const badge = screen.getByTestId('mana-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('7 Mana')
  })

  it('stacks multiple badges correctly', () => {
    render(
      <PlayerCounter
        {...defaultProps}
        isCommander={true}
        commanderDamage={[{ fromPlayerId: 'player-2', amount: 5 }]}
        poisonCounters={3}
        manaPool={{ white: 2, blue: 1, black: 0, red: 0, green: 0, colorless: 0 }}
      />
    )

    expect(screen.getByTestId('commander-damage-badge')).toBeInTheDocument()
    expect(screen.getByTestId('poison-badge')).toBeInTheDocument()
    expect(screen.getByTestId('mana-badge')).toBeInTheDocument()
  })

  it('opens commander damage modal when clicking the badge', async () => {
    const user = userEvent.setup()
    const onOpenCommanderDamage = jest.fn()

    render(
      <PlayerCounter
        {...defaultProps}
        isCommander={true}
        commanderDamage={[{ fromPlayerId: 'player-2', amount: 5 }]}
        onOpenCommanderDamage={onOpenCommanderDamage}
      />
    )

    await user.click(screen.getByTestId('commander-damage-badge'))

    expect(onOpenCommanderDamage).toHaveBeenCalledWith('player-1')
  })

  it('opens poison counter modal when clicking the badge', async () => {
    const user = userEvent.setup()
    const onOpenPoisonCounter = jest.fn()

    render(
      <PlayerCounter
        {...defaultProps}
        poisonCounters={5}
        onOpenPoisonCounter={onOpenPoisonCounter}
      />
    )

    await user.click(screen.getByTestId('poison-badge'))

    expect(onOpenPoisonCounter).toHaveBeenCalledWith('player-1')
  })

  it('opens mana pool modal when clicking the badge', async () => {
    const user = userEvent.setup()
    const onOpenManaPool = jest.fn()

    render(
      <PlayerCounter
        {...defaultProps}
        manaPool={{ white: 2, blue: 1, black: 0, red: 0, green: 0, colorless: 0 }}
        onOpenManaPool={onOpenManaPool}
      />
    )

    await user.click(screen.getByTestId('mana-badge'))

    expect(onOpenManaPool).toHaveBeenCalledWith('player-1')
  })
})
