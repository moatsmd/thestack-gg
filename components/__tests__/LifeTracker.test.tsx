import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LifeTracker } from '../LifeTracker'
import { GameState } from '@/types/game'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

const renderWithProviders = (component: React.ReactElement) => {
  return render(<DarkModeProvider>{component}</DarkModeProvider>)
}

describe('LifeTracker', () => {
  const mockOnReset = jest.fn()

  const soloGameState: GameState = {
    mode: 'solo',
    gameType: 'standard',
    startingLife: 20,
    players: [
      {
        id: 'player-1',
        name: 'You',
        currentLife: 20,
        lifeHistory: [],
      },
    ],
    createdAt: new Date(),
  }

  const multiplayerGameState: GameState = {
    mode: 'multiplayer',
    gameType: 'commander',
    startingLife: 40,
    players: [
      {
        id: 'player-1',
        name: 'Player 1',
        currentLife: 40,
        lifeHistory: [],
      },
      {
        id: 'player-2',
        name: 'Player 2',
        currentLife: 40,
        lifeHistory: [],
      },
    ],
    createdAt: new Date(),
  }

  beforeEach(() => {
    mockOnReset.mockClear()
    localStorage.clear()
  })

  it('should render solo player counter', () => {
    renderWithProviders(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('You')).toBeInTheDocument()
  })

  it('should update life when buttons are clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    const plusButton = screen.getByRole('button', { name: /\+/i })
    await user.click(plusButton)

    expect(screen.getByText('21')).toBeInTheDocument()
  })

  it('should persist life changes to localStorage', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    const plusButton = screen.getByRole('button', { name: /\+/i })
    await user.click(plusButton)

    const stored = localStorage.getItem('manadork-game-state')
    expect(stored).toBeTruthy()

    const parsed = JSON.parse(stored!)
    expect(parsed.players[0].currentLife).toBe(21)
  })

  it('should render multiple players in multiplayer mode', () => {
    renderWithProviders(<LifeTracker initialGameState={multiplayerGameState} onReset={mockOnReset} />)

    expect(screen.getByText('Player 1')).toBeInTheDocument()
    expect(screen.getByText('Player 2')).toBeInTheDocument()
  })

  it('should show reset button', () => {
    renderWithProviders(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    expect(screen.getByText(/Reset/i)).toBeInTheDocument()
  })

  it('should call onReset when reset is confirmed', async () => {
    const user = userEvent.setup()

    jest.spyOn(window, 'confirm').mockReturnValue(true)

    renderWithProviders(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    const resetButton = screen.getByText(/Reset/i)
    await user.click(resetButton)

    expect(mockOnReset).toHaveBeenCalled()
  })

  it('should not reset when confirmation is cancelled', async () => {
    const user = userEvent.setup()

    jest.spyOn(window, 'confirm').mockReturnValue(false)

    renderWithProviders(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    const resetButton = screen.getByText(/Reset/i)
    await user.click(resetButton)

    expect(mockOnReset).not.toHaveBeenCalled()
  })

  it('should track life history', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    const plusButton = screen.getByRole('button', { name: /\+/i })
    await user.click(plusButton)
    await user.click(plusButton)

    const stored = localStorage.getItem('manadork-game-state')
    const parsed = JSON.parse(stored!)

    expect(parsed.players[0].lifeHistory).toHaveLength(2)
    expect(parsed.players[0].lifeHistory[0].amount).toBe(1)
  })

  it('opens commander damage modal and persists updates', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LifeTracker initialGameState={multiplayerGameState} onReset={mockOnReset} />)

    await user.click(screen.getAllByRole('button', { name: /open commander damage/i })[0])

    expect(screen.getByText("Player 1's Commander Damage")).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /increase damage from player 2/i }))

    const stored = localStorage.getItem('manadork-game-state')
    const parsed = JSON.parse(stored!)

    expect(parsed.players[0].commanderDamage).toEqual([
      { fromPlayerId: 'player-2', amount: 1 },
    ])
  })

  it('shows commander tip banner on first visit in commander mode', () => {
    renderWithProviders(<LifeTracker initialGameState={multiplayerGameState} onReset={mockOnReset} />)

    expect(screen.getByTestId('commander-tip-banner')).toBeInTheDocument()
    expect(screen.getByText(/Tip: Tap any player to track commander damage/i)).toBeInTheDocument()
  })

  it('does not show banner in non-commander modes', () => {
    renderWithProviders(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    expect(screen.queryByTestId('commander-tip-banner')).not.toBeInTheDocument()
  })

  it('dismisses banner when Got it button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LifeTracker initialGameState={multiplayerGameState} onReset={mockOnReset} />)

    const banner = screen.getByTestId('commander-tip-banner')
    expect(banner).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /dismiss tip/i }))

    expect(screen.queryByTestId('commander-tip-banner')).not.toBeInTheDocument()
  })

  it('persists banner dismissal to localStorage', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LifeTracker initialGameState={multiplayerGameState} onReset={mockOnReset} />)

    await user.click(screen.getByRole('button', { name: /dismiss tip/i }))

    const stored = localStorage.getItem('manadork-has-seen-commander-tip')
    expect(stored).toBe('true')
  })

  it('does not show banner again after it has been dismissed', () => {
    localStorage.setItem('manadork-has-seen-commander-tip', 'true')

    renderWithProviders(<LifeTracker initialGameState={multiplayerGameState} onReset={mockOnReset} />)

    expect(screen.queryByTestId('commander-tip-banner')).not.toBeInTheDocument()
  })

  it('shows help legend on first visit', () => {
    renderWithProviders(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    expect(screen.getByTestId('help-legend-banner')).toBeInTheDocument()
    expect(screen.getByText(/Quick Guide/i)).toBeInTheDocument()
  })

  it('dismisses help legend when Got it is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    const legend = screen.getByTestId('help-legend-banner')
    expect(legend).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Dismiss help legend/i }))

    expect(screen.queryByTestId('help-legend-banner')).not.toBeInTheDocument()
  })

  it('persists help legend dismissal to localStorage', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    await user.click(screen.getByRole('button', { name: /Dismiss help legend/i }))

    const stored = localStorage.getItem('manadork-has-seen-help-legend')
    expect(stored).toBe('true')
  })

  it('does not show help legend after dismissal', () => {
    localStorage.setItem('manadork-has-seen-help-legend', 'true')

    renderWithProviders(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    expect(screen.queryByTestId('help-legend-banner')).not.toBeInTheDocument()
  })

  it('shows both commander tip and help legend simultaneously', () => {
    renderWithProviders(<LifeTracker initialGameState={multiplayerGameState} onReset={mockOnReset} />)

    expect(screen.getByTestId('commander-tip-banner')).toBeInTheDocument()
    expect(screen.getByTestId('help-legend-banner')).toBeInTheDocument()
  })

  it('opens poison counter modal and persists updates', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    await user.click(screen.getByRole('button', { name: /open poison counters/i }))

    expect(screen.getByText(/You's Poison Counters/)).toBeInTheDocument()

    const increaseButton = screen.getByRole('button', { name: /increase poison/i })
    await user.click(increaseButton)
    await user.click(increaseButton)
    await user.click(increaseButton)

    const stored = localStorage.getItem('manadork-game-state')
    const parsed = JSON.parse(stored!)

    expect(parsed.players[0].poisonCounters).toBe(3)
  })

  it('opens mana pool modal and persists updates', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    await user.click(screen.getByRole('button', { name: /open mana pool/i }))

    expect(screen.getByText(/You's Mana Pool/)).toBeInTheDocument()

    const increaseButtons = screen.getAllByRole('button', { name: /increase/i })
    await user.click(increaseButtons[0]) // White
    await user.click(increaseButtons[0])
    await user.click(increaseButtons[1]) // Blue
    await user.click(increaseButtons[3]) // Red
    await user.click(increaseButtons[3])
    await user.click(increaseButtons[3])

    const stored = localStorage.getItem('manadork-game-state')
    const parsed = JSON.parse(stored!)

    expect(parsed.players[0].manaPool).toEqual({
      white: 2,
      blue: 1,
      black: 0,
      red: 3,
      green: 0,
      colorless: 0,
    })
  })

  it('clears all mana when Clear All is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    await user.click(screen.getByRole('button', { name: /open mana pool/i }))

    const increaseButtons = screen.getAllByRole('button', { name: /increase/i })
    await user.click(increaseButtons[0])
    await user.click(increaseButtons[1])

    await user.click(screen.getByRole('button', { name: /clear all/i }))

    const stored = localStorage.getItem('manadork-game-state')
    const parsed = JSON.parse(stored!)

    expect(parsed.players[0].manaPool).toEqual({
      white: 0,
      blue: 0,
      black: 0,
      red: 0,
      green: 0,
      colorless: 0,
    })
  })

  it('tracks poison and mana independently for multiple players', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LifeTracker initialGameState={multiplayerGameState} onReset={mockOnReset} />)

    const poisonButtons = screen.getAllByRole('button', { name: /open poison counters/i })
    await user.click(poisonButtons[0])

    const increasePoison = screen.getByRole('button', { name: /increase poison/i })
    await user.click(increasePoison)
    await user.click(increasePoison)

    await user.click(screen.getByRole('button', { name: /close/i }))

    const manaButtons = screen.getAllByRole('button', { name: /open mana pool/i })
    await user.click(manaButtons[1])

    const increaseButtons = screen.getAllByRole('button', { name: /increase/i })
    await user.click(increaseButtons[0])

    const stored = localStorage.getItem('manadork-game-state')
    const parsed = JSON.parse(stored!)

    expect(parsed.players[0].poisonCounters).toBe(2)
    expect(parsed.players[1].manaPool.white).toBe(1)
  })
})
