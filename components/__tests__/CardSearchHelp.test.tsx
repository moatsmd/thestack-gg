import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CardSearchHelp } from '../CardSearchHelp'

describe('CardSearchHelp', () => {
  it('renders collapsed by default', () => {
    render(<CardSearchHelp />)

    expect(screen.getByText('Search Help')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText(/Scryfall search syntax/i)).not.toBeInTheDocument()
  })

  it('expands when clicked', async () => {
    const user = userEvent.setup()
    render(<CardSearchHelp />)

    const button = screen.getByRole('button', { name: /search help/i })
    await user.click(button)

    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/Scryfall search syntax/i)).toBeInTheDocument()
  })

  it('collapses when clicked again', async () => {
    const user = userEvent.setup()
    render(<CardSearchHelp />)

    const button = screen.getByRole('button', { name: /search help/i })

    // Expand
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')

    // Collapse
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText(/Scryfall search syntax/i)).not.toBeInTheDocument()
  })

  it('displays all search syntax examples', async () => {
    const user = userEvent.setup()
    render(<CardSearchHelp />)

    await user.click(screen.getByRole('button', { name: /search help/i }))

    expect(screen.getByText('legal:commander')).toBeInTheDocument()
    expect(screen.getByText(/Commander-legal cards/i)).toBeInTheDocument()

    expect(screen.getByText('c:blue')).toBeInTheDocument()
    expect(screen.getByText(/Blue cards/i)).toBeInTheDocument()

    expect(screen.getByText('t:creature')).toBeInTheDocument()
    expect(screen.getByText(/Creature type/i)).toBeInTheDocument()

    expect(screen.getByText('o:draw')).toBeInTheDocument()
    expect(screen.getByText(/Contains "draw" in text/i)).toBeInTheDocument()

    expect(screen.getByText('cmc=3')).toBeInTheDocument()
    expect(screen.getByText(/CMC equals 3/i)).toBeInTheDocument()

    expect(screen.getByText(/Combine searches/i)).toBeInTheDocument()
    expect(screen.getByText(/legal:commander c:blue t:creature o:draw/i)).toBeInTheDocument()
  })

  it('shows correct expand/collapse indicators', async () => {
    const user = userEvent.setup()
    render(<CardSearchHelp />)

    const button = screen.getByRole('button', { name: /search help/i })

    // Should show + when collapsed
    expect(button).toHaveTextContent('+')

    // Expand
    await user.click(button)

    // Should show − when expanded
    expect(button).toHaveTextContent('−')
  })
})
