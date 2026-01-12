import { render, screen } from '@testing-library/react'
import { ToolkitHeader } from '../ToolkitHeader'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

const renderWithProviders = (component: React.ReactElement) => {
  return render(<DarkModeProvider>{component}</DarkModeProvider>)
}

describe('ToolkitHeader', () => {
  it('renders with title and menu', () => {
    renderWithProviders(<ToolkitHeader />)

    expect(screen.getByText('Card Lookup')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument()
  })

  it('has proper styling classes', () => {
    renderWithProviders(<ToolkitHeader />)

    const header = screen.getByTestId('toolkit-header')
    expect(header).toHaveClass('border-b')
  })

  it('displays title with proper styling', () => {
    renderWithProviders(<ToolkitHeader />)

    const title = screen.getByText('Card Lookup')
    expect(title.tagName).toBe('H1')
    expect(title).toHaveClass('text-xl', 'font-bold')
  })

  it('has correct data-testid for testing', () => {
    renderWithProviders(<ToolkitHeader />)

    expect(screen.getByTestId('toolkit-header')).toBeInTheDocument()
  })

  it('renders hamburger menu component', () => {
    renderWithProviders(<ToolkitHeader />)

    expect(screen.getByTestId('hamburger-button')).toBeInTheDocument()
  })
})
