import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiceRoller } from '@/components/DiceRoller'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

const renderDice = () => render(<DarkModeProvider><DiceRoller /></DarkModeProvider>)

describe('DiceRoller', () => {
  it('renders all 7 die buttons', () => {
    renderDice()
    expect(screen.getByTestId('die-d4')).toBeInTheDocument()
    expect(screen.getByTestId('die-d6')).toBeInTheDocument()
    expect(screen.getByTestId('die-d8')).toBeInTheDocument()
    expect(screen.getByTestId('die-d10')).toBeInTheDocument()
    expect(screen.getByTestId('die-d12')).toBeInTheDocument()
    expect(screen.getByTestId('die-d20')).toBeInTheDocument()
    expect(screen.getByTestId('die-d100')).toBeInTheDocument()
  })

  it('shows a result after clicking a die', async () => {
    const user = userEvent.setup()
    renderDice()
    await user.click(screen.getByTestId('die-d6'))
    expect(screen.getByTestId('roll-result')).toBeInTheDocument()
  })

  it('d6 result is between 1 and 6', async () => {
    const user = userEvent.setup()
    renderDice()
    for (let i = 0; i < 10; i++) {
      await user.click(screen.getByTestId('die-d6'))
    }
    const resultEl = screen.getByTestId('roll-result')
    const value = parseInt(resultEl.textContent ?? '0', 10)
    expect(value).toBeGreaterThanOrEqual(1)
    expect(value).toBeLessThanOrEqual(6)
  })

  it('adds to roll history', async () => {
    const user = userEvent.setup()
    renderDice()
    await user.click(screen.getByTestId('die-d20'))
    await user.click(screen.getByTestId('die-d20'))
    const history = screen.getAllByTestId('history-entry')
    expect(history.length).toBeGreaterThanOrEqual(1)
  })

  it('history is capped at 10 entries', async () => {
    const user = userEvent.setup()
    renderDice()
    for (let i = 0; i < 15; i++) {
      await user.click(screen.getByTestId('die-d4'))
    }
    const history = screen.getAllByTestId('history-entry')
    expect(history.length).toBeLessThanOrEqual(10)
  })
})
