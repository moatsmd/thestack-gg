import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock next/navigation — TrackerPage uses useRouter to navigate to /recap/[id]
// after End-Game submission. The wizard / counter flow tests don't exercise
// that path, so a no-op stub is enough.
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/tracker',
  useSearchParams: () => new URLSearchParams(),
}))

import TrackerPage from '../tracker/page'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

const renderWithProviders = (component: React.ReactElement) => {
  return render(<DarkModeProvider>{component}</DarkModeProvider>)
}

// AnimatePresence with mode="wait" briefly keeps both old and new step in
// the DOM. Wait for the transition to settle (single match) and then click.
async function clickWhenSettled(user: ReturnType<typeof userEvent.setup>, testId: string) {
  await waitFor(() => {
    expect(screen.getAllByTestId(testId)).toHaveLength(1)
  })
  await user.click(screen.getByTestId(testId))
}

describe('Tracker Page', () => {
  it('renders the wizard at the mode step on load', () => {
    renderWithProviders(<TrackerPage />)
    expect(screen.getByText(/Life Tracker/i)).toBeInTheDocument()
    expect(screen.getByTestId('mode-solo')).toBeInTheDocument()
    expect(screen.getByTestId('mode-multi')).toBeInTheDocument()
  })

  it('multi mode wizard advances through Players → Rules → Counters → Begin', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TrackerPage />)

    // Mode: multi (default), continue
    await user.click(screen.getByTestId('mode-multi'))
    await user.click(screen.getByTestId('button-wizard-next'))

    // Players step
    await user.click(await screen.findByTestId('players-3'))
    await user.click(screen.getByTestId('button-wizard-next'))

    // Rules step — pick Standard 20
    await user.click(await screen.findByTestId('format-standard-20'))
    await user.click(screen.getByTestId('button-wizard-next'))

    // Counters step → Begin
    expect(await screen.findByTestId('counter-cmd')).toBeInTheDocument()
    await user.click(screen.getByTestId('button-wizard-next'))

    // Game started: 3 player panels at 20 life each
    expect(await screen.findByTestId('life-1')).toHaveTextContent('20')
    expect(screen.getByTestId('life-2')).toHaveTextContent('20')
    expect(screen.getByTestId('life-3')).toHaveTextContent('20')
  })

  it('solo mode skips the players step', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TrackerPage />)

    await user.click(screen.getByTestId('mode-solo'))
    await user.click(screen.getByTestId('button-wizard-next'))

    // Should land on Rules, not Players
    expect(await screen.findByTestId('format-commander-40')).toBeInTheDocument()
    expect(screen.queryByTestId('players-2')).not.toBeInTheDocument()
  })

  it('decrement and increment buttons change life total', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TrackerPage />)

    // Solo → Standard 20 → Begin
    await clickWhenSettled(user, 'mode-solo')
    await clickWhenSettled(user, 'button-wizard-next')
    await clickWhenSettled(user, 'format-standard-20')
    await clickWhenSettled(user, 'button-wizard-next')
    await clickWhenSettled(user, 'button-wizard-next')

    await waitFor(() => expect(screen.getByTestId('life-1')).toHaveTextContent('20'))

    await user.click(screen.getByTestId('life-minus-1'))
    await waitFor(() => expect(screen.getByTestId('life-1')).toHaveTextContent('19'))

    await user.click(screen.getByTestId('life-plus5-1'))
    await waitFor(() => expect(screen.getByTestId('life-1')).toHaveTextContent('24'))
  })

  it('Reset returns life totals to the starting value', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TrackerPage />)

    await clickWhenSettled(user, 'mode-solo')
    await clickWhenSettled(user, 'button-wizard-next')
    await clickWhenSettled(user, 'format-standard-20')
    await clickWhenSettled(user, 'button-wizard-next')
    await clickWhenSettled(user, 'button-wizard-next')

    await waitFor(() => expect(screen.getByTestId('life-1')).toBeInTheDocument())
    await user.click(screen.getByTestId('life-minus-1'))
    await user.click(screen.getByTestId('life-minus-1'))
    await waitFor(() => expect(screen.getByTestId('life-1')).toHaveTextContent('18'))

    await user.click(screen.getByTestId('button-reset'))
    await waitFor(() => expect(screen.getByTestId('life-1')).toHaveTextContent('20'))
  })

  it('Exit returns to the wizard', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TrackerPage />)

    await clickWhenSettled(user, 'mode-solo')
    await clickWhenSettled(user, 'button-wizard-next')
    await clickWhenSettled(user, 'format-standard-20')
    await clickWhenSettled(user, 'button-wizard-next')
    await clickWhenSettled(user, 'button-wizard-next')

    await waitFor(() => expect(screen.getByTestId('button-exit-game')).toBeInTheDocument())
    await user.click(screen.getByTestId('button-exit-game'))
    expect(await screen.findByTestId('mode-solo')).toBeInTheDocument()
  })
})
