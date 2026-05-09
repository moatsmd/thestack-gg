import { act, render, screen, waitFor } from '@testing-library/react'
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

  it('shows a per-opponent commander damage grid and lethal at 21 from one source', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TrackerPage />)

    // Multi → 4 players → Commander 40 → Begin (cmd is on by default).
    await clickWhenSettled(user, 'mode-multi')
    await clickWhenSettled(user, 'button-wizard-next')
    await clickWhenSettled(user, 'players-4')
    await clickWhenSettled(user, 'button-wizard-next')
    await clickWhenSettled(user, 'format-commander-40')
    await clickWhenSettled(user, 'button-wizard-next')
    await clickWhenSettled(user, 'button-wizard-next')

    // Open the cmd grid on Player 1.
    await waitFor(() => expect(screen.getByTestId('badge-cmd-1')).toBeInTheDocument())
    await user.click(screen.getByTestId('badge-cmd-1'))

    // 4-player game → each tile has 3 cells (one per opponent).
    await waitFor(() => expect(screen.getByTestId('cmd-grid-1')).toBeInTheDocument())
    expect(screen.getByTestId('cmd-cell-1-from-2')).toBeInTheDocument()
    expect(screen.getByTestId('cmd-cell-1-from-3')).toBeInTheDocument()
    expect(screen.getByTestId('cmd-cell-1-from-4')).toBeInTheDocument()
    expect(screen.queryByTestId('cmd-cell-1-from-1')).not.toBeInTheDocument()

    // - clamps at 0; + increments the right cell only.
    const minus = screen.getByTestId('cmd-minus-1-from-2')
    expect(minus).toBeDisabled()
    await user.click(screen.getByTestId('cmd-plus-1-from-2'))
    await waitFor(() =>
      expect(screen.getByTestId('cmd-cell-1-from-2')).toHaveAttribute('data-cmd-amount', '1')
    )
    expect(screen.getByTestId('cmd-cell-1-from-3')).toHaveAttribute('data-cmd-amount', '0')

    // Badge reflects max single source, not sum.
    expect(screen.getByTestId('badge-cmd-1')).toHaveTextContent('CMD 1')

    // Drive Player 2 to 21 commander damage from Player 3 → lethal state.
    await user.click(screen.getByTestId('badge-cmd-2'))
    await screen.findByTestId('cmd-plus-2-from-3')
    for (let i = 0; i < 21; i++) {
      // Re-query each iteration: the cell re-renders after every click and
      // a stale node reference would silently no-op.
      await user.click(screen.getByTestId('cmd-plus-2-from-3'))
    }
    await waitFor(
      () =>
        expect(screen.getByTestId('cmd-cell-2-from-3')).toHaveAttribute(
          'data-cmd-amount',
          '21'
        ),
      { timeout: 3000 }
    )
    expect(screen.getByTestId('cmd-cell-2-from-3')).toHaveAttribute('data-cmd-lethal', 'true')
    expect(screen.getByTestId('cmd-lethal-2')).toBeInTheDocument()
    // Other cells on the same tile must NOT be marked lethal.
    expect(screen.getByTestId('cmd-cell-2-from-1')).toHaveAttribute('data-cmd-lethal', 'false')
  })

  it('player name input has dotted underline, placeholder, and snaps back when cleared', async () => {
    const user = userEvent.setup()
    // Ensure the rename hint is dismissed for clean DOM
    window.localStorage.setItem('thestack:seen-name-hint', '1')
    renderWithProviders(<TrackerPage />)

    // Multi → 3 players → Standard 20 → Begin
    await clickWhenSettled(user, 'mode-multi')
    await clickWhenSettled(user, 'button-wizard-next')
    await clickWhenSettled(user, 'players-3')
    await clickWhenSettled(user, 'button-wizard-next')
    await clickWhenSettled(user, 'format-standard-20')
    await clickWhenSettled(user, 'button-wizard-next')
    await clickWhenSettled(user, 'button-wizard-next')

    const input = await screen.findByTestId('input-name-1') as HTMLInputElement
    expect(input).toHaveValue('Player 1')
    expect(input).toHaveAttribute('placeholder', 'Player 1')
    expect(input.className).toMatch(/border-dotted/)

    // Clear and blur — should snap back to default name
    await user.clear(input)
    expect(input).toHaveValue('')
    await act(async () => { input.blur() })
    await waitFor(() => expect(input).toHaveValue('Player 1'))

    // User-typed name persists across blur
    await user.clear(input)
    await user.type(input, 'Jess')
    await act(async () => { input.blur() })
    await waitFor(() => expect(input).toHaveValue('Jess'))
  })

  it('shows the rename hint once on first multiplayer game and dismisses on click', async () => {
    window.localStorage.removeItem('thestack:seen-name-hint')
    const user = userEvent.setup()
    renderWithProviders(<TrackerPage />)

    await clickWhenSettled(user, 'mode-multi')
    await clickWhenSettled(user, 'button-wizard-next')
    await clickWhenSettled(user, 'players-2')
    await clickWhenSettled(user, 'button-wizard-next')
    await clickWhenSettled(user, 'format-standard-20')
    await clickWhenSettled(user, 'button-wizard-next')
    await clickWhenSettled(user, 'button-wizard-next')

    const hint = await screen.findByTestId('hint-rename')
    expect(hint).toBeInTheDocument()

    await user.click(screen.getByTestId('button-dismiss-name-hint'))
    await waitFor(() => expect(screen.queryByTestId('hint-rename')).not.toBeInTheDocument())
    expect(window.localStorage.getItem('thestack:seen-name-hint')).toBe('1')
  })

  it('does NOT show the rename hint in solo mode', async () => {
    window.localStorage.removeItem('thestack:seen-name-hint')
    const user = userEvent.setup()
    renderWithProviders(<TrackerPage />)

    await clickWhenSettled(user, 'mode-solo')
    await clickWhenSettled(user, 'button-wizard-next')
    await clickWhenSettled(user, 'format-standard-20')
    await clickWhenSettled(user, 'button-wizard-next')
    await clickWhenSettled(user, 'button-wizard-next')

    await waitFor(() => expect(screen.getByTestId('life-1')).toHaveTextContent('20'))
    expect(screen.queryByTestId('hint-rename')).not.toBeInTheDocument()
  })

  describe('Pod Sync wiring', () => {
    let fetchMock: jest.Mock
    let originalFetch: typeof globalThis.fetch | undefined

    beforeEach(() => {
      window.localStorage.setItem('thestack:device-id', 'test-host-aaaa')
      window.localStorage.setItem('thestack:seen-name-hint', '1')
      originalFetch = (globalThis as { fetch?: typeof fetch }).fetch
      fetchMock = jest.fn()
      ;(globalThis as { fetch: typeof fetch }).fetch =
        fetchMock as unknown as typeof fetch
    })

    afterEach(() => {
      if (originalFetch) {
        ;(globalThis as { fetch: typeof fetch }).fetch = originalFetch
      } else {
        delete (globalThis as { fetch?: typeof fetch }).fetch
      }
    })

    const okJson = (body: unknown, status = 200): Response =>
      ({
        ok: status >= 200 && status < 300,
        status,
        json: async () => body,
      }) as unknown as Response

    async function startMultiGame() {
      const user = userEvent.setup()
      renderWithProviders(<TrackerPage />)
      await clickWhenSettled(user, 'mode-multi')
      await clickWhenSettled(user, 'button-wizard-next')
      await clickWhenSettled(user, 'players-2')
      await clickWhenSettled(user, 'button-wizard-next')
      await clickWhenSettled(user, 'format-standard-20')
      await clickWhenSettled(user, 'button-wizard-next')
      await clickWhenSettled(user, 'button-wizard-next')
      // Wait for the active tracker to render before returning.
      await waitFor(() =>
        expect(screen.getByTestId('life-1')).toHaveTextContent('20'),
      )
      return user
    }

    it('shows the Sync button only in multiplayer mode', async () => {
      await startMultiGame()
      expect(screen.getByTestId('button-sync')).toBeInTheDocument()
    })

    it('opens the dialog and creates a sync session via /api/sync', async () => {
      fetchMock.mockResolvedValueOnce(
        okJson({
          id: 'sess_xyz',
          code: 'XYZ123',
          joinUrl: 'https://thestack.gg/tracker?join=XYZ123',
          session: {
            id: 'sess_xyz',
            code: 'XYZ123',
            hostDeviceId: 'test-host-aaaa',
            createdAt: 1,
            seq: 0,
          },
          snapshot: {
            seq: 0,
            players: [],
            gameMode: { name: 'Standard', life: 20 },
            customLife: 20,
            enabledCounters: ['cmd', 'poison', 'mana'],
          },
          seats: [],
          expiresInMs: 86_400_000,
        }),
      )
      const user = await startMultiGame()

      await user.click(screen.getByTestId('button-sync'))
      expect(await screen.findByTestId('sync-dialog')).toBeInTheDocument()

      await user.click(screen.getByTestId('button-start-sync'))

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          '/api/sync',
          expect.objectContaining({ method: 'POST' }),
        )
      })

      // Code is rendered formatted as XYZ-123.
      const code = await screen.findByTestId('sync-code')
      expect(code).toHaveTextContent('XYZ-123')
      expect(screen.getByTestId('sync-status-label')).toHaveTextContent('Live')
    })

    it('applies a remote life op from /since to the local life-1 display', async () => {
      // Routed mock: capture create + serve a /since payload with one
      // remote op authored by another device. Default for everything else
      // is a no-op response so polling doesn't error.
      let createServed = false
      let sinceServed = false
      fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
        const u = String(url)
        const method = (init?.method ?? 'GET').toUpperCase()
        if (u === '/api/sync' && method === 'POST') {
          createServed = true
          return okJson({
            id: 'sess_xyz',
            code: 'XYZ123',
            joinUrl: 'https://thestack.gg/tracker?join=XYZ123',
            session: {
              id: 'sess_xyz',
              code: 'XYZ123',
              hostDeviceId: 'test-host-aaaa',
              createdAt: 1,
              seq: 0,
            },
            snapshot: {
              seq: 0,
              players: [],
              gameMode: { name: 'Standard', life: 20 },
              customLife: 20,
              enabledCounters: ['cmd', 'poison', 'mana'],
            },
            seats: [],
            expiresInMs: 86_400_000,
          })
        }
        if (u.includes('/since')) {
          if (!sinceServed) {
            sinceServed = true
            return okJson({
              seq: 1,
              ops: [
                {
                  seq: 1,
                  opId: 'remote-other:0',
                  deviceId: 'remote-other',
                  ts: 100,
                  op: { type: 'life', seatId: 1, delta: -3 },
                },
              ],
            })
          }
          return okJson({ ops: [], seq: 1 })
        }
        return okJson({ envelope: { seq: 1 } })
      })

      const user = await startMultiGame()
      await user.click(screen.getByTestId('button-sync'))
      await user.click(await screen.findByTestId('button-start-sync'))
      await screen.findByTestId('sync-code')
      await user.click(screen.getByTestId('button-close-sync'))
      expect(createServed).toBe(true)

      // Wait for the polled remote op to land and life-1 to drop from 20 → 17.
      await waitFor(
        () => {
          expect(screen.getByTestId('life-1')).toHaveTextContent('17')
        },
        { timeout: 3_000 },
      )
      expect(sinceServed).toBe(true)
    })

    it('emits a life op to /api/sync/{id}/op when life changes during an active session', async () => {
      fetchMock
        .mockResolvedValueOnce(
          okJson({
            id: 'sess_xyz',
            code: 'XYZ123',
            joinUrl: 'https://thestack.gg/tracker?join=XYZ123',
            session: {
              id: 'sess_xyz',
              code: 'XYZ123',
              hostDeviceId: 'test-host-aaaa',
              createdAt: 1,
              seq: 0,
            },
            snapshot: {
              seq: 0,
              players: [],
              gameMode: { name: 'Standard', life: 20 },
              customLife: 20,
              enabledCounters: ['cmd', 'poison', 'mana'],
            },
            seats: [],
            expiresInMs: 86_400_000,
          }),
        )
        .mockResolvedValue(okJson({ envelope: { seq: 1 } }))

      const user = await startMultiGame()
      await user.click(screen.getByTestId('button-sync'))
      await user.click(await screen.findByTestId('button-start-sync'))
      await screen.findByTestId('sync-code')
      await user.click(screen.getByTestId('button-close-sync'))

      // Life-1 → click minus once should POST to /api/sync/sess_xyz/op.
      await user.click(screen.getByTestId('life-minus-1'))

      await waitFor(() => {
        const opCall = fetchMock.mock.calls.find(
          (c) => c[0] === '/api/sync/sess_xyz/op',
        )
        expect(opCall).toBeDefined()
        const body = JSON.parse((opCall![1] as RequestInit).body as string)
        expect(body.op).toEqual({ type: 'life', seatId: 1, delta: -1 })
        expect(body.deviceId).toBe('test-host-aaaa')
        expect(body.opId).toMatch(/^test-host-aaaa:\d+$/)
      })
    })
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
