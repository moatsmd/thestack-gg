import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ViewModeToggle } from '../ViewModeToggle'

describe('ViewModeToggle', () => {
  it('renders both view mode buttons', () => {
    render(<ViewModeToggle mode="single" onModeChange={() => {}} />)

    expect(screen.getByRole('button', { name: /single card/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /grid view/i })).toBeInTheDocument()
  })

  it('highlights active mode', () => {
    const { rerender } = render(<ViewModeToggle mode="single" onModeChange={() => {}} />)

    const singleButton = screen.getByRole('button', { name: /single card/i })
    const gridButton = screen.getByRole('button', { name: /grid view/i })

    // Single mode active
    expect(singleButton).toHaveClass('bg-purple-600')
    expect(gridButton).not.toHaveClass('bg-purple-600')

    // Switch to grid mode
    rerender(<ViewModeToggle mode="grid" onModeChange={() => {}} />)

    expect(singleButton).not.toHaveClass('bg-purple-600')
    expect(gridButton).toHaveClass('bg-purple-600')
  })

  it('calls onModeChange when button clicked', async () => {
    const user = userEvent.setup()
    const handleModeChange = jest.fn()

    render(<ViewModeToggle mode="single" onModeChange={handleModeChange} />)

    await user.click(screen.getByRole('button', { name: /grid view/i }))

    expect(handleModeChange).toHaveBeenCalledWith('grid')
  })

  it('does not call onModeChange when clicking active button', async () => {
    const user = userEvent.setup()
    const handleModeChange = jest.fn()

    render(<ViewModeToggle mode="single" onModeChange={handleModeChange} />)

    await user.click(screen.getByRole('button', { name: /single card/i }))

    expect(handleModeChange).not.toHaveBeenCalled()
  })
})
