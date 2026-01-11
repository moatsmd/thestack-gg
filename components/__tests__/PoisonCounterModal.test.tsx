import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PoisonCounterModal } from '../PoisonCounterModal'

describe('PoisonCounterModal', () => {
  it('does not render when closed', () => {
    render(
      <PoisonCounterModal
        isOpen={false}
        playerName="Player 1"
        poisonCounters={0}
        onChange={jest.fn()}
        onClose={jest.fn()}
      />
    )

    expect(screen.queryByText(/Poison Counters/i)).not.toBeInTheDocument()
  })

  it('renders player name and poison count', () => {
    render(
      <PoisonCounterModal
        isOpen
        playerName="Player 1"
        poisonCounters={5}
        onChange={jest.fn()}
        onClose={jest.fn()}
      />
    )

    expect(screen.getByText(/Player 1's Poison Counters/)).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('increments poison counters', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(
      <PoisonCounterModal
        isOpen
        playerName="Player 1"
        poisonCounters={3}
        onChange={onChange}
        onClose={jest.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: /increase poison/i }))

    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('decrements poison counters', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(
      <PoisonCounterModal
        isOpen
        playerName="Player 1"
        poisonCounters={5}
        onChange={onChange}
        onClose={jest.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: /decrease poison/i }))

    expect(onChange).toHaveBeenCalledWith(-1)
  })

  it('does not decrement below 0', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(
      <PoisonCounterModal
        isOpen
        playerName="Player 1"
        poisonCounters={0}
        onChange={onChange}
        onClose={jest.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: /decrease poison/i }))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows gray styling for 0-7 poison counters', () => {
    render(
      <PoisonCounterModal
        isOpen
        playerName="Player 1"
        poisonCounters={5}
        onChange={jest.fn()}
        onClose={jest.fn()}
      />
    )

    const counter = screen.getByTestId('poison-counter-display')
    expect(counter).toHaveAttribute('data-warning-level', 'none')
    expect(counter).toHaveClass('bg-gray-100', 'text-gray-700')
  })

  it('shows yellow styling for 8-9 poison counters', () => {
    render(
      <PoisonCounterModal
        isOpen
        playerName="Player 1"
        poisonCounters={8}
        onChange={jest.fn()}
        onClose={jest.fn()}
      />
    )

    const counter = screen.getByTestId('poison-counter-display')
    expect(counter).toHaveAttribute('data-warning-level', 'warning')
    expect(counter).toHaveClass('bg-yellow-100', 'text-yellow-700')
  })

  it('shows red styling for 10+ poison counters', () => {
    render(
      <PoisonCounterModal
        isOpen
        playerName="Player 1"
        poisonCounters={10}
        onChange={jest.fn()}
        onClose={jest.fn()}
      />
    )

    const counter = screen.getByTestId('poison-counter-display')
    expect(counter).toHaveAttribute('data-warning-level', 'danger')
    expect(counter).toHaveClass('bg-red-100', 'text-red-700')
  })

  it('closes when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()

    render(
      <PoisonCounterModal
        isOpen
        playerName="Player 1"
        poisonCounters={0}
        onChange={jest.fn()}
        onClose={onClose}
      />
    )

    await user.click(screen.getByRole('button', { name: /close/i }))

    expect(onClose).toHaveBeenCalled()
  })
})
