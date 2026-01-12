import { render, screen } from '@testing-library/react'
import { ToolkitHeader } from '../ToolkitHeader'

describe('ToolkitHeader', () => {
  it('renders with title and menu', () => {
    render(<ToolkitHeader />)

    expect(screen.getByText('Card Lookup')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument()
  })

  it('has proper styling classes', () => {
    render(<ToolkitHeader />)

    const header = screen.getByTestId('toolkit-header')
    expect(header).toHaveClass('bg-gray-900', 'text-white', 'border-b', 'border-gray-700')
  })

  it('displays title with proper styling', () => {
    render(<ToolkitHeader />)

    const title = screen.getByText('Card Lookup')
    expect(title.tagName).toBe('H1')
    expect(title).toHaveClass('text-xl', 'font-bold')
  })

  it('has correct data-testid for testing', () => {
    render(<ToolkitHeader />)

    expect(screen.getByTestId('toolkit-header')).toBeInTheDocument()
  })

  it('renders hamburger menu component', () => {
    render(<ToolkitHeader />)

    expect(screen.getByTestId('hamburger-button')).toBeInTheDocument()
  })
})
