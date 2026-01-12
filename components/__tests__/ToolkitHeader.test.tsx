import { render, screen } from '@testing-library/react'
import { ToolkitHeader } from '../ToolkitHeader'

describe('ToolkitHeader', () => {
  it('renders with all required elements', () => {
    render(<ToolkitHeader />)

    expect(screen.getByText('← Back')).toBeInTheDocument()
    expect(screen.getByText('Card Lookup')).toBeInTheDocument()
  })

  it('has a link to home page', () => {
    render(<ToolkitHeader />)

    const backLink = screen.getByRole('link', { name: /Back to home/i })
    expect(backLink).toHaveAttribute('href', '/')
  })

  it('has proper styling classes', () => {
    render(<ToolkitHeader />)

    const header = screen.getByTestId('toolkit-header')
    expect(header).toHaveClass('bg-gray-900', 'text-white', 'border-b', 'border-gray-700')
  })

  it('centers the title with flex layout', () => {
    render(<ToolkitHeader />)

    const title = screen.getByText('Card Lookup')
    expect(title).toHaveClass('flex-1', 'text-center')
  })

  it('has proper accessibility attributes', () => {
    render(<ToolkitHeader />)

    const backLink = screen.getByRole('link', { name: /Back to home/i })
    expect(backLink).toHaveAttribute('aria-label', 'Back to home')
  })

  it('has correct data-testid for testing', () => {
    render(<ToolkitHeader />)

    expect(screen.getByTestId('toolkit-header')).toBeInTheDocument()
  })

  it('displays back link with hover styles', () => {
    render(<ToolkitHeader />)

    const backLink = screen.getByRole('link', { name: /Back to home/i })
    expect(backLink).toHaveClass('text-blue-400', 'hover:text-blue-300')
  })
})
