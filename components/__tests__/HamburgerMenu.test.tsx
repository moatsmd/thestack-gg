import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HamburgerMenu } from '../HamburgerMenu'

describe('HamburgerMenu', () => {
  it('renders hamburger button', () => {
    render(<HamburgerMenu />)

    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument()
  })

  it('opens menu when hamburger button is clicked', async () => {
    const user = userEvent.setup()
    render(<HamburgerMenu />)

    const button = screen.getByRole('button', { name: 'Menu' })
    await user.click(button)

    expect(screen.getByTestId('hamburger-menu')).toBeInTheDocument()
    expect(screen.getByText('🏠 Home')).toBeInTheDocument()
    expect(screen.getByText('❤️ Life Tracker')).toBeInTheDocument()
    expect(screen.getByText('🔍 Card Lookup')).toBeInTheDocument()
  })

  it('closes menu when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<HamburgerMenu />)

    // Open menu
    await user.click(screen.getByRole('button', { name: 'Menu' }))
    expect(screen.getByTestId('hamburger-menu')).toBeInTheDocument()

    // Close menu
    await user.click(screen.getByRole('button', { name: 'Close menu' }))
    expect(screen.queryByTestId('hamburger-menu')).not.toBeInTheDocument()
  })

  it('closes menu when backdrop is clicked', async () => {
    const user = userEvent.setup()
    render(<HamburgerMenu />)

    // Open menu
    await user.click(screen.getByRole('button', { name: 'Menu' }))
    expect(screen.getByTestId('hamburger-menu')).toBeInTheDocument()

    // Click backdrop
    await user.click(screen.getByTestId('menu-backdrop'))
    expect(screen.queryByTestId('hamburger-menu')).not.toBeInTheDocument()
  })

  it('closes menu when a link is clicked', async () => {
    const user = userEvent.setup()
    render(<HamburgerMenu />)

    // Open menu
    await user.click(screen.getByRole('button', { name: 'Menu' }))
    expect(screen.getByTestId('hamburger-menu')).toBeInTheDocument()

    // Click a link
    await user.click(screen.getByText('🏠 Home'))
    expect(screen.queryByTestId('hamburger-menu')).not.toBeInTheDocument()
  })

  it('changes button icon when menu is open', async () => {
    const user = userEvent.setup()
    render(<HamburgerMenu />)

    const button = screen.getByRole('button', { name: 'Menu' })

    // Initially closed - should show hamburger icon
    expect(button).toHaveAttribute('aria-expanded', 'false')

    // Open menu - should show X icon
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('has correct navigation links', async () => {
    const user = userEvent.setup()
    render(<HamburgerMenu />)

    await user.click(screen.getByRole('button', { name: 'Menu' }))

    const homeLink = screen.getByText('🏠 Home')
    const trackerLink = screen.getByText('❤️ Life Tracker')
    const toolkitLink = screen.getByText('🔍 Card Lookup')

    expect(homeLink.closest('a')).toHaveAttribute('href', '/')
    expect(trackerLink.closest('a')).toHaveAttribute('href', '/tracker')
    expect(toolkitLink.closest('a')).toHaveAttribute('href', '/toolkit')
  })
})
