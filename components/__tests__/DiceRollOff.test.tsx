import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiceRoller } from '../DiceRoller'

describe('table roll-off experience', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState({}, '', '/dice')
  })
  afterEach(() => { cleanup(); jest.restoreAllMocks() })

  it('imports table names and announces who starts after everyone rolls', async () => {
    window.history.replaceState({}, '', '/dice?players=' + encodeURIComponent(JSON.stringify(['Ada', 'Ben', 'Cy'])))
    const values = [0.2, 0.95, 0.4]
    jest.spyOn(Math, 'random').mockImplementation(() => values.shift() ?? 0.5)
    const user = userEvent.setup()
    render(<DiceRoller />)
    expect(screen.getByRole('textbox', { name: 'Player 1 name' })).toHaveValue('Ada')
    await user.click(screen.getByRole('button', { name: 'Roll all d20s' }))
    expect(screen.getByRole('status')).toHaveTextContent('Ben goes first')
  })

  it('rerolls the tied leaders and preserves the earlier round', async () => {
    window.history.replaceState({}, '', '/dice?players=' + encodeURIComponent(JSON.stringify(['Ada', 'Ben', 'Cy'])))
    const values = [0.95, 0.3, 0.95, 0.1, 0.9]
    jest.spyOn(Math, 'random').mockImplementation(() => values.shift() ?? 0.5)
    const user = userEvent.setup()
    render(<DiceRoller />)
    await user.click(screen.getByRole('button', { name: 'Roll all d20s' }))
    expect(screen.getByRole('status')).toHaveTextContent('Ada and Cy are tied')
    await user.click(screen.getByRole('button', { name: 'Reroll 2 tied players' }))
    expect(screen.getByRole('status')).toHaveTextContent('Cy goes first')
    expect(screen.getByText('Round 1')).toBeInTheDocument()
    expect(screen.getByText('Round 2')).toBeInTheDocument()
  })

  it('restores the decided winner after a reload', async () => {
    const values = [0.95, 0.3, 0.2, 0.1]
    jest.spyOn(Math, 'random').mockImplementation(() => values.shift() ?? 0.5)
    const user = userEvent.setup()
    const first = render(<DiceRoller />)
    await user.click(screen.getByRole('button', { name: 'Who goes first?' }))
    await user.click(screen.getByRole('button', { name: 'Roll all d20s' }))
    expect(screen.getByRole('status')).toHaveTextContent('Player 1 goes first')
    first.unmount()
    render(<DiceRoller />)
    expect(screen.getByRole('status')).toHaveTextContent('Player 1 goes first')
  })

  it('replaces a blank edited name before announcing a winner', async () => {
    const values = [0.95, 0.3, 0.2, 0.1]
    jest.spyOn(Math, 'random').mockImplementation(() => values.shift() ?? 0.5)
    const user = userEvent.setup()
    render(<DiceRoller />)
    await user.click(screen.getByRole('button', { name: 'Who goes first?' }))
    await user.clear(screen.getByRole('textbox', { name: 'Player 1 name' }))
    await user.click(screen.getByRole('button', { name: 'Roll all d20s' }))
    expect(screen.getByRole('status')).toHaveTextContent('Player 1 goes first')
  })

  it('rejects invalid stored rounds and out-of-range timestamps without crashing', async () => {
    localStorage.setItem('thestack-dice-v2', JSON.stringify({ mode: 'first', rolloff: { names: ['Ada', 'Ben'], contenders: [0], winner: 0, rounds: [{ rolls: [], leaders: [] }] }, history: [{ die: 20, result: 20, id: 'bad', timestamp: 1e100 }] }))
    const user = userEvent.setup()
    render(<DiceRoller />)
    expect(screen.getByRole('button', { name: 'Roll all d20s' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Free roll' }))
    expect(screen.queryByTestId('history-entry')).not.toBeInTheDocument()
  })
})
