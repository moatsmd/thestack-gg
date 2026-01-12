import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GameSetup } from '../GameSetup'
import { GameState } from '@/types/game'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

const renderWithProviders = (component: React.ReactElement) => {
  return render(<DarkModeProvider>{component}</DarkModeProvider>)
}

describe('GameSetup', () => {
  const mockOnStart = jest.fn()

  beforeEach(() => {
    mockOnStart.mockClear()
  })

  it('should render solo and multiplayer options', () => {
    renderWithProviders(<GameSetup onStartGame={mockOnStart} />)

    expect(screen.getByText(/Track My Life/i)).toBeInTheDocument()
    expect(screen.getByText(/Track Game/i)).toBeInTheDocument()
  })

  it('should show game mode selection when solo is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<GameSetup onStartGame={mockOnStart} />)

    await user.click(screen.getByText(/Track My Life/i))

    expect(screen.getByText(/Standard/i)).toBeInTheDocument()
    expect(screen.getByText(/Commander/i)).toBeInTheDocument()
    expect(screen.getByText(/Custom/i)).toBeInTheDocument()
  })

  it('should start solo standard game with 20 life', async () => {
    const user = userEvent.setup()
    renderWithProviders(<GameSetup onStartGame={mockOnStart} />)

    await user.click(screen.getByText(/Track My Life/i))
    await user.click(screen.getByText(/Standard/i))

    expect(mockOnStart).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'solo',
        gameType: 'standard',
        startingLife: 20,
        players: expect.arrayContaining([
          expect.objectContaining({
            currentLife: 20,
          })
        ])
      })
    )
  })

  it('should start solo commander game with 40 life', async () => {
    const user = userEvent.setup()
    renderWithProviders(<GameSetup onStartGame={mockOnStart} />)

    await user.click(screen.getByText(/Track My Life/i))
    await user.click(screen.getByText(/Commander/i))

    expect(mockOnStart).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'solo',
        gameType: 'commander',
        startingLife: 40,
      })
    )
  })

  it('should show player count selection for multiplayer', async () => {
    const user = userEvent.setup()
    renderWithProviders(<GameSetup onStartGame={mockOnStart} />)

    await user.click(screen.getByText(/Track Game/i))

    expect(screen.getByText(/2 Players/i)).toBeInTheDocument()
    expect(screen.getByText(/3 Players/i)).toBeInTheDocument()
    expect(screen.getByText(/4 Players/i)).toBeInTheDocument()
  })
})
