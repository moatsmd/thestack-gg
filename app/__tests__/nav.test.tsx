import { render, screen, within } from '@testing-library/react'
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
    expect(nav.textContent).not.toMatch(/\bHome\b/)
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

  it('announces the current tool', () => {
    renderNav()
    expect(screen.getByRole('link', { name: 'Tracker' })).toHaveAttribute('aria-current', 'page')
  })

  it('opens an accessible dialog and returns focus to More after Escape', async () => {
    const user = userEvent.setup()
    renderNav()
    const trigger = screen.getByRole('button', { name: 'More options' })
    await user.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'More tools and settings' })
    expect(dialog).toContainElement(document.activeElement as HTMLElement)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('keeps keyboard focus within the open drawer', async () => {
    const user = userEvent.setup()
    renderNav()
    await user.click(screen.getByRole('button', { name: 'More options' }))
    const dialog = screen.getByRole('dialog', { name: 'More tools and settings' })
    const close = within(dialog).getByRole('button', { name: 'Close menu' })
    close.focus()
    await user.tab({ shift: true })
    expect(within(dialog).getByTestId('dark-mode-toggle')).toHaveFocus()
    await user.tab()
    expect(close).toHaveFocus()
  })
})
