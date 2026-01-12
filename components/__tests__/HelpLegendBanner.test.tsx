import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HelpLegendBanner } from '../HelpLegendBanner'

describe('HelpLegendBanner', () => {
  it('renders with all required elements', () => {
    const onDismiss = jest.fn()
    render(<HelpLegendBanner isCommander={false} onDismiss={onDismiss} />)

    expect(screen.getByText(/Quick Guide/i)).toBeInTheDocument()
    expect(screen.getByText(/Poison counters/i)).toBeInTheDocument()
    expect(screen.getByText(/Mana pool/i)).toBeInTheDocument()
    expect(screen.getByText(/Badge Colors/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Dismiss help legend/i })).toBeInTheDocument()
  })

  it('shows CMD explanation when isCommander is true', () => {
    const onDismiss = jest.fn()
    render(<HelpLegendBanner isCommander={true} onDismiss={onDismiss} />)

    expect(screen.getByText(/Commander damage/i)).toBeInTheDocument()
  })

  it('hides CMD explanation when isCommander is false', () => {
    const onDismiss = jest.fn()
    render(<HelpLegendBanner isCommander={false} onDismiss={onDismiss} />)

    expect(screen.queryByText(/Commander damage/i)).not.toBeInTheDocument()
  })

  it('calls onDismiss when Got it button is clicked', async () => {
    const user = userEvent.setup()
    const onDismiss = jest.fn()

    render(<HelpLegendBanner isCommander={false} onDismiss={onDismiss} />)

    await user.click(screen.getByRole('button', { name: /Dismiss help legend/i }))

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('displays badge color legend', () => {
    const onDismiss = jest.fn()
    render(<HelpLegendBanner isCommander={false} onDismiss={onDismiss} />)

    const legendText = screen.getByText(/Badge Colors/i).closest('div')
    expect(legendText).toHaveTextContent(/Gray/)
    expect(legendText).toHaveTextContent(/Yellow/)
    expect(legendText).toHaveTextContent(/Red/)
  })

  it('has proper accessibility attributes', () => {
    const onDismiss = jest.fn()
    render(<HelpLegendBanner isCommander={false} onDismiss={onDismiss} />)

    const dismissButton = screen.getByRole('button', { name: /Dismiss help legend/i })
    expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss help legend')
  })

  it('has correct data-testid for testing', () => {
    const onDismiss = jest.fn()
    render(<HelpLegendBanner isCommander={false} onDismiss={onDismiss} />)

    expect(screen.getByTestId('help-legend-banner')).toBeInTheDocument()
  })
})
