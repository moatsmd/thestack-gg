import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GameSetup } from '@/components/GameSetup'
import { DarkModeProvider } from '@/contexts/DarkModeContext'
import { GameState, Player, ExtraCounterType, TableStatus } from '@/types/game'

const renderSetup = (onStart = jest.fn()) =>
  render(<DarkModeProvider><GameSetup onStartGame={onStart} /></DarkModeProvider>)

describe('game types', () => {
  it('GameState accepts enabledCounters field', () => {
    const state: GameState = {
      mode: 'multiplayer',
      gameType: 'commander',
      startingLife: 40,
      enabledCounters: ['energy', 'experience'],
      tableStatus: {
        monarchId: null,
        initiativeId: null,
        isNight: false,
        citysBlessingIds: [],
      },
      players: [],
      createdAt: new Date(),
    }
    expect(state.enabledCounters).toEqual(['energy', 'experience'])
    expect(state.tableStatus.monarchId).toBeNull()
  })

  it('Player accepts extraCounters field', () => {
    const player: Player = {
      id: 'p1',
      name: 'Alice',
      currentLife: 40,
      lifeHistory: [],
      extraCounters: { energy: 3, experience: 1, rad: 0, ticket: 0 },
    }
    expect(player.extraCounters?.energy).toBe(3)
  })
})

describe('GameSetup extra counters', () => {
  it('shows extra counter step when playing multiplayer commander', async () => {
    const user = userEvent.setup()
    renderSetup()
    // Click Multiplayer
    await user.click(screen.getByText(/multiplayer/i))
    // Select player count — click Next or similar if there's a step
    const nextBtn = screen.queryByText(/next/i) ?? screen.queryByText(/continue/i)
    if (nextBtn) await user.click(nextBtn)
    // Select Commander
    await user.click(screen.getByText(/commander/i))
    // Should now show counter selection
    expect(screen.getByTestId('extra-counters-step')).toBeInTheDocument()
  })

  it('counter toggle changes aria-pressed state', async () => {
    const user = userEvent.setup()
    renderSetup()
    await user.click(screen.getByText(/multiplayer/i))
    const nextBtn = screen.queryByText(/next/i) ?? screen.queryByText(/continue/i)
    if (nextBtn) await user.click(nextBtn)
    await user.click(screen.getByText(/commander/i))
    const energyBtn = screen.getByTestId('counter-option-energy')
    expect(energyBtn).toHaveAttribute('aria-pressed', 'false')
    await user.click(energyBtn)
    expect(energyBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('Start Game calls onStartGame with selected counters', async () => {
    const onStart = jest.fn()
    const user = userEvent.setup()
    renderSetup(onStart)
    await user.click(screen.getByText(/multiplayer/i))
    const nextBtn = screen.queryByText(/next/i) ?? screen.queryByText(/continue/i)
    if (nextBtn) await user.click(nextBtn)
    await user.click(screen.getByText(/commander/i))
    await user.click(screen.getByTestId('counter-option-energy'))
    await user.click(screen.getByText(/start game/i))
    expect(onStart).toHaveBeenCalledTimes(1)
    const [gameState] = onStart.mock.calls[0]
    expect(gameState.enabledCounters).toContain('energy')
  })
})
