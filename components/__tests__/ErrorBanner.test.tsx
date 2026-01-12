import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBanner } from '../ErrorBanner'

describe('ErrorBanner', () => {
  it('renders error message', () => {
    render(<ErrorBanner message="Something went wrong" />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders dismiss button when onDismiss is provided', () => {
    const onDismiss = jest.fn()
    render(<ErrorBanner message="Error" onDismiss={onDismiss} />)

    expect(screen.getByRole('button', { name: /dismiss error/i })).toBeInTheDocument()
  })

  it('does not render dismiss button when onDismiss is not provided', () => {
    render(<ErrorBanner message="Error" />)

    expect(screen.queryByRole('button', { name: /dismiss error/i })).not.toBeInTheDocument()
  })

  it('calls onDismiss when dismiss button is clicked', async () => {
    const user = userEvent.setup()
    const onDismiss = jest.fn()

    render(<ErrorBanner message="Error" onDismiss={onDismiss} />)

    await user.click(screen.getByRole('button', { name: /dismiss error/i }))

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
