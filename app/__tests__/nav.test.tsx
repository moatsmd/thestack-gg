import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BottomNavBar } from '@/components/BottomNavBar'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/tracker',
}))

const renderNav = () => render(<DarkModeProvider><BottomNavBar /></DarkModeProvider>)

describe('BottomNavBar (redesigned)', () => {
  it('shows Tracker in main nav', () => {
    renderNav()
    const nav = screen.getByTestId('bottom-nav')
    expect(nav).toBeInTheDocument()
    expect(screen.getByText('Tracker')).toBeInTheDocument()
  })

  it('shows Cards in main nav', () => {
    renderNav()
    expect(screen.getByText('Cards')).toBeInTheDocument()
  })

  it('shows Dice in main nav', () => {
    renderNav()
    expect(screen.getByText('Dice')).toBeInTheDocument()
  })

  it('shows Glossary in main nav', () => {
    renderNav()
    expect(screen.getByText('Glossary')).toBeInTheDocument()
  })

  it('does NOT show Home in main nav', () => {
    renderNav()
    // Home should not be a nav link (it's in the header logo)
    const nav = screen.getByTestId('bottom-nav')
    expect(nav.textContent).not.toMatch(/^Home$/)
  })

  it('More drawer contains Stack Reference', async () => {
    const user = userEvent.setup()
    renderNav()
    await user.click(screen.getByTestId('more-button'))
    expect(screen.getByText(/stack/i)).toBeInTheDocument()
  })

  it('More drawer contains Tokens', async () => {
    const user = userEvent.setup()
    renderNav()
    await user.click(screen.getByTestId('more-button'))
    expect(screen.getByText(/tokens/i)).toBeInTheDocument()
  })
})
