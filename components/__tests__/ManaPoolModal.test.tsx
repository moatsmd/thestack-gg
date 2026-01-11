import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ManaPoolModal } from '../ManaPoolModal'
import { ManaPool } from '@/types/game'

describe('ManaPoolModal', () => {
  const emptyManaPool: ManaPool = {
    white: 0,
    blue: 0,
    black: 0,
    red: 0,
    green: 0,
    colorless: 0,
  }

  it('does not render when closed', () => {
    render(
      <ManaPoolModal
        isOpen={false}
        playerName="Player 1"
        manaPool={emptyManaPool}
        onChange={jest.fn()}
        onClearAll={jest.fn()}
        onClose={jest.fn()}
      />
    )

    expect(screen.queryByText(/Mana Pool/i)).not.toBeInTheDocument()
  })

  it('renders player name and mana counts', () => {
    const manaPool: ManaPool = {
      white: 2,
      blue: 1,
      black: 0,
      red: 3,
      green: 1,
      colorless: 0,
    }

    render(
      <ManaPoolModal
        isOpen
        playerName="Player 1"
        manaPool={manaPool}
        onChange={jest.fn()}
        onClearAll={jest.fn()}
        onClose={jest.fn()}
      />
    )

    expect(screen.getByText(/Player 1's Mana Pool/)).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // white
    expect(screen.getAllByText('1')).toHaveLength(2) // blue and green
    expect(screen.getByText('3')).toBeInTheDocument() // red
  })

  it('increments white mana', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(
      <ManaPoolModal
        isOpen
        playerName="Player 1"
        manaPool={emptyManaPool}
        onChange={onChange}
        onClearAll={jest.fn()}
        onClose={jest.fn()}
      />
    )

    const increaseButtons = screen.getAllByRole('button', { name: /increase/i })
    await user.click(increaseButtons[0]) // First is white

    expect(onChange).toHaveBeenCalledWith('white', 1)
  })

  it('decrements blue mana', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    const manaPool: ManaPool = {
      ...emptyManaPool,
      blue: 3,
    }

    render(
      <ManaPoolModal
        isOpen
        playerName="Player 1"
        manaPool={manaPool}
        onChange={onChange}
        onClearAll={jest.fn()}
        onClose={jest.fn()}
      />
    )

    const decreaseButtons = screen.getAllByRole('button', { name: /decrease/i })
    await user.click(decreaseButtons[1]) // Second is blue

    expect(onChange).toHaveBeenCalledWith('blue', -1)
  })

  it('does not decrement below 0', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(
      <ManaPoolModal
        isOpen
        playerName="Player 1"
        manaPool={emptyManaPool}
        onChange={onChange}
        onClearAll={jest.fn()}
        onClose={jest.fn()}
      />
    )

    const decreaseButtons = screen.getAllByRole('button', { name: /decrease/i })
    await user.click(decreaseButtons[0]) // White at 0

    expect(onChange).not.toHaveBeenCalled()
  })

  it('clears all mana when Clear All is clicked', async () => {
    const user = userEvent.setup()
    const onClearAll = jest.fn()

    const manaPool: ManaPool = {
      white: 2,
      blue: 1,
      black: 1,
      red: 3,
      green: 1,
      colorless: 2,
    }

    render(
      <ManaPoolModal
        isOpen
        playerName="Player 1"
        manaPool={manaPool}
        onChange={jest.fn()}
        onClearAll={onClearAll}
        onClose={jest.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: /clear all/i }))

    expect(onClearAll).toHaveBeenCalled()
  })

  it('closes when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()

    render(
      <ManaPoolModal
        isOpen
        playerName="Player 1"
        manaPool={emptyManaPool}
        onChange={jest.fn()}
        onClearAll={jest.fn()}
        onClose={onClose}
      />
    )

    await user.click(screen.getByRole('button', { name: /close mana pool/i }))

    expect(onClose).toHaveBeenCalled()
  })

  it('renders all six mana colors', () => {
    render(
      <ManaPoolModal
        isOpen
        playerName="Player 1"
        manaPool={emptyManaPool}
        onChange={jest.fn()}
        onClearAll={jest.fn()}
        onClose={jest.fn()}
      />
    )

    // Check for all color rows
    expect(screen.getByText(/white/i)).toBeInTheDocument()
    expect(screen.getByText(/blue/i)).toBeInTheDocument()
    expect(screen.getByText(/black/i)).toBeInTheDocument()
    expect(screen.getByText(/red/i)).toBeInTheDocument()
    expect(screen.getByText(/green/i)).toBeInTheDocument()
    expect(screen.getByText(/colorless/i)).toBeInTheDocument()
  })
})
