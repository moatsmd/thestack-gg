import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommanderDamageModal } from '../CommanderDamageModal'

describe('CommanderDamageModal', () => {
  const opponents = [
    { id: 'player-2', name: 'Player 2', commanderName: 'Atraxa' },
    { id: 'player-3', name: 'Player 3' },
  ]

  it('does not render when closed', () => {
    render(
      <CommanderDamageModal
        isOpen={false}
        playerName="Player 1"
        opponents={opponents}
        commanderDamage={[]}
        onChange={jest.fn()}
        onCommanderNameChange={jest.fn()}
        onClose={jest.fn()}
      />
    )

    expect(screen.queryByText(/Commander Damage/i)).not.toBeInTheDocument()
  })

  it('renders opponents and total damage', () => {
    render(
      <CommanderDamageModal
        isOpen
        playerName="Player 1"
        opponents={opponents}
        commanderDamage={[
          { fromPlayerId: 'player-2', amount: 5 },
          { fromPlayerId: 'player-3', amount: 2 },
        ]}
        onChange={jest.fn()}
        onCommanderNameChange={jest.fn()}
        onClose={jest.fn()}
      />
    )

    expect(screen.getByText("Player 1's Commander Damage")).toBeInTheDocument()
    expect(screen.getByText(/From Player 2's/)).toBeInTheDocument()
    expect(screen.getByText('Atraxa')).toBeInTheDocument()
    expect(screen.getByText(/From Player 3's/)).toBeInTheDocument()
    expect(screen.getByText('Commander')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()

    const total = screen.getByTestId('commander-total')
    expect(total).toHaveTextContent('Total: 7')
  })

  it('increments and decrements damage with clamping at 0', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    const { rerender } = render(
      <CommanderDamageModal
        isOpen
        playerName="Player 1"
        opponents={opponents}
        commanderDamage={[]}
        onChange={onChange}
        onCommanderNameChange={jest.fn()}
        onClose={jest.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: /decrease damage from player 2/i }))
    expect(onChange).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /increase damage from player 2/i }))
    expect(onChange).toHaveBeenCalledWith('player-2', 1)

    onChange.mockClear()

    rerender(
      <CommanderDamageModal
        isOpen
        playerName="Player 1"
        opponents={opponents}
        commanderDamage={[{ fromPlayerId: 'player-2', amount: 1 }]}
        onChange={onChange}
        onCommanderNameChange={jest.fn()}
        onClose={jest.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: /decrease damage from player 2/i }))
    expect(onChange).toHaveBeenCalledWith('player-2', -1)
  })

  it('marks warning levels based on total damage', () => {
    const { rerender } = render(
      <CommanderDamageModal
        isOpen
        playerName="Player 1"
        opponents={opponents}
        commanderDamage={[{ fromPlayerId: 'player-2', amount: 17 }]}
        onChange={jest.fn()}
        onCommanderNameChange={jest.fn()}
        onClose={jest.fn()}
      />
    )

    expect(screen.getByTestId('commander-total')).toHaveAttribute('data-warning-level', 'none')

    rerender(
      <CommanderDamageModal
        isOpen
        playerName="Player 1"
        opponents={opponents}
        commanderDamage={[{ fromPlayerId: 'player-2', amount: 18 }]}
        onChange={jest.fn()}
        onCommanderNameChange={jest.fn()}
        onClose={jest.fn()}
      />
    )

    expect(screen.getByTestId('commander-total')).toHaveAttribute('data-warning-level', 'warning')

    rerender(
      <CommanderDamageModal
        isOpen
        playerName="Player 1"
        opponents={opponents}
        commanderDamage={[{ fromPlayerId: 'player-2', amount: 21 }]}
        onChange={jest.fn()}
        onCommanderNameChange={jest.fn()}
        onClose={jest.fn()}
      />
    )

    expect(screen.getByTestId('commander-total')).toHaveAttribute('data-warning-level', 'danger')
  })

  it('allows editing commander names', async () => {
    const user = userEvent.setup()
    const onCommanderNameChange = jest.fn()

    render(
      <CommanderDamageModal
        isOpen
        playerName="Player 1"
        opponents={opponents}
        commanderDamage={[]}
        onChange={jest.fn()}
        onCommanderNameChange={onCommanderNameChange}
        onClose={jest.fn()}
      />
    )

    // Click on commander name to edit
    await user.click(screen.getByText('Atraxa'))

    // Should show input field
    const input = screen.getByPlaceholderText('Commander')
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('Atraxa')

    // Change the name
    await user.clear(input)
    await user.type(input, 'Tymna')

    // Blur to save
    await user.tab()

    expect(onCommanderNameChange).toHaveBeenCalledWith('player-2', 'Tymna')
  })

  it('saves commander name on Enter key', async () => {
    const user = userEvent.setup()
    const onCommanderNameChange = jest.fn()

    render(
      <CommanderDamageModal
        isOpen
        playerName="Player 1"
        opponents={opponents}
        commanderDamage={[]}
        onChange={jest.fn()}
        onCommanderNameChange={onCommanderNameChange}
        onClose={jest.fn()}
      />
    )

    // Click on commander name to edit
    await user.click(screen.getByText('Commander'))

    // Type new name and press Enter
    const input = screen.getByPlaceholderText('Commander')
    await user.clear(input)
    await user.type(input, 'Thrasios{Enter}')

    expect(onCommanderNameChange).toHaveBeenCalledWith('player-3', 'Thrasios')
  })

  it('cancels commander name edit on Escape key', async () => {
    const user = userEvent.setup()
    const onCommanderNameChange = jest.fn()

    render(
      <CommanderDamageModal
        isOpen
        playerName="Player 1"
        opponents={opponents}
        commanderDamage={[]}
        onChange={jest.fn()}
        onCommanderNameChange={onCommanderNameChange}
        onClose={jest.fn()}
      />
    )

    // Click on commander name to edit
    await user.click(screen.getByText('Atraxa'))

    // Type new name and press Escape
    const input = screen.getByPlaceholderText('Commander')
    await user.type(input, 'NewName{Escape}')

    // Should not call onChange
    expect(onCommanderNameChange).not.toHaveBeenCalled()

    // Should show original name again
    expect(screen.getByText('Atraxa')).toBeInTheDocument()
  })
})
