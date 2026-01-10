import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LifeTracker } from '../LifeTracker'
import { GameState } from '@/types/game'

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
    render(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('You')).toBeInTheDocument()
  })

  it('should update life when buttons are clicked', async () => {
    const user = userEvent.setup()
    render(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    const plusButton = screen.getByRole('button', { name: /\+/i })
    await user.click(plusButton)

    expect(screen.getByText('21')).toBeInTheDocument()
  })

  it('should persist life changes to localStorage', async () => {
    const user = userEvent.setup()
    render(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    const plusButton = screen.getByRole('button', { name: /\+/i })
    await user.click(plusButton)

    const stored = localStorage.getItem('manadork-game-state')
    expect(stored).toBeTruthy()

    const parsed = JSON.parse(stored!)
    expect(parsed.players[0].currentLife).toBe(21)
  })

  it('should render multiple players in multiplayer mode', () => {
    render(<LifeTracker initialGameState={multiplayerGameState} onReset={mockOnReset} />)

    expect(screen.getByText('Player 1')).toBeInTheDocument()
    expect(screen.getByText('Player 2')).toBeInTheDocument()
  })

  it('should show reset button', () => {
    render(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    expect(screen.getByText(/Reset/i)).toBeInTheDocument()
  })

  it('should call onReset when reset is confirmed', async () => {
    const user = userEvent.setup()

    jest.spyOn(window, 'confirm').mockReturnValue(true)

    render(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    const resetButton = screen.getByText(/Reset/i)
    await user.click(resetButton)

    expect(mockOnReset).toHaveBeenCalled()
  })

  it('should not reset when confirmation is cancelled', async () => {
    const user = userEvent.setup()

    jest.spyOn(window, 'confirm').mockReturnValue(false)

    render(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    const resetButton = screen.getByText(/Reset/i)
    await user.click(resetButton)

    expect(mockOnReset).not.toHaveBeenCalled()
  })

  it('should track life history', async () => {
    const user = userEvent.setup()
    render(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    const plusButton = screen.getByRole('button', { name: /\+/i })
    await user.click(plusButton)
    await user.click(plusButton)

    const stored = localStorage.getItem('manadork-game-state')
    const parsed = JSON.parse(stored!)

    expect(parsed.players[0].lifeHistory).toHaveLength(2)
    expect(parsed.players[0].lifeHistory[0].amount).toBe(1)
  })
})
