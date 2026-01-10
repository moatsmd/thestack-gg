import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TrackerPage from '../tracker/page'

describe('Tracker Page', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should show game setup when no active game exists', () => {
    render(<TrackerPage />)

    expect(screen.getByText(/Track My Life/i)).toBeInTheDocument()
  })

  it('should start a solo game when setup is completed', async () => {
    const user = userEvent.setup()
    render(<TrackerPage />)

    await user.click(screen.getByText(/Track My Life/i))
    await user.click(screen.getByText(/Standard/i))

    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /\+/i })).toBeInTheDocument()
  })

  it('should resume game from localStorage if exists', () => {
    const existingGame = {
      mode: 'solo',
      gameType: 'commander',
      startingLife: 40,
      players: [
        {
          id: 'player-1',
          name: 'You',
          currentLife: 35,
          lifeHistory: [{ amount: -5, timestamp: new Date().toISOString() }],
        },
      ],
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem('manadork-game-state', JSON.stringify(existingGame))

    render(<TrackerPage />)

    expect(screen.getByText('35')).toBeInTheDocument()
  })

  it('should return to setup when game is reset', async () => {
    const user = userEvent.setup()

    // Mock window.confirm
    jest.spyOn(window, 'confirm').mockReturnValue(true)

    render(<TrackerPage />)

    // Start game
    await user.click(screen.getByText(/Track My Life/i))
    await user.click(screen.getByText(/Standard/i))

    // Reset game
    await user.click(screen.getByText(/Reset Game/i))

    // Should be back at setup
    expect(screen.getByText(/Track My Life/i)).toBeInTheDocument()
  })
})
