import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerCounter } from '../PlayerCounter'

describe('PlayerCounter', () => {
  const mockOnLifeChange = jest.fn()

  const defaultProps = {
    playerId: 'player-1',
    playerName: 'Test Player',
    currentLife: 20,
    isSolo: true,
    onLifeChange: mockOnLifeChange,
  }

  beforeEach(() => {
    mockOnLifeChange.mockClear()
  })

  it('should display current life total', () => {
    render(<PlayerCounter {...defaultProps} />)

    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('should call onLifeChange with +1 when plus button clicked', async () => {
    const user = userEvent.setup()
    render(<PlayerCounter {...defaultProps} />)

    const plusButton = screen.getByRole('button', { name: /\+/i })
    await user.click(plusButton)

    expect(mockOnLifeChange).toHaveBeenCalledWith('player-1', 1)
  })

  it('should call onLifeChange with -1 when minus button clicked', async () => {
    const user = userEvent.setup()
    render(<PlayerCounter {...defaultProps} />)

    const minusButton = screen.getByRole('button', { name: /-/i })
    await user.click(minusButton)

    expect(mockOnLifeChange).toHaveBeenCalledWith('player-1', -1)
  })

  it('should render in solo mode with large font', () => {
    const { container } = render(<PlayerCounter {...defaultProps} isSolo={true} />)

    const lifeDisplay = screen.getByText('20')
    expect(lifeDisplay).toHaveClass('text-9xl')
  })

  it('should render in multiplayer mode with smaller font', () => {
    const { container } = render(<PlayerCounter {...defaultProps} isSolo={false} />)

    const lifeDisplay = screen.getByText('20')
    expect(lifeDisplay).toHaveClass('text-6xl')
  })

  it('should display player name', () => {
    render(<PlayerCounter {...defaultProps} />)

    expect(screen.getByText('Test Player')).toBeInTheDocument()
  })

  it('should handle negative life values', () => {
    render(<PlayerCounter {...defaultProps} currentLife={-5} />)

    const lifeDisplay = screen.getByText('-5')
    expect(lifeDisplay).toBeInTheDocument()
    expect(lifeDisplay).toHaveClass('text-red-600')
  })
})
