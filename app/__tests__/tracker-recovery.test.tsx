import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode } from 'react'
import TrackerPage from '../tracker/page'
import { __resetDeviceIdForTests } from '@/lib/device-id'
import { SYNC_RECOVERY_KEY } from '@/lib/sync-recovery'
import { saveTable, TRACKER_SAVE_KEY } from '@/lib/tracker-save'
import type { SyncSnapshot } from '@/types/sync'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }))

beforeEach(() => {
  localStorage.clear()
  mockPush.mockClear()
  window.history.replaceState({}, '', '/tracker')
})

async function startSolo() {
  const user = userEvent.setup()
  await user.click(screen.getByTestId('mode-solo'))
  await user.click(screen.getByTestId('button-wizard-next'))
  await user.click(screen.getByTestId('button-wizard-next'))
  await user.click(screen.getByTestId('button-wizard-next'))
  return user
}

it('restores a local table and life total after the page is recreated', async () => {
  const first = render(<TrackerPage />)
  const user = await startSolo()
  await user.click(screen.getByTestId('life-minus5-1'))
  expect(screen.getByTestId('life-1')).toHaveTextContent('35')
  first.unmount()
  render(<TrackerPage />)
  expect(await screen.findByTestId('life-1')).toHaveTextContent('35')
  expect(screen.getByTestId('button-end-game')).toBeInTheDocument()
})

it('preserves every rapid tap with React StrictMode enabled', async () => {
  render(<StrictMode><TrackerPage /></StrictMode>)
  await startSolo()
  act(() => {
    fireEvent.click(screen.getByTestId('life-minus-1'))
    fireEvent.click(screen.getByTestId('life-minus-1'))
    fireEvent.click(screen.getByTestId('life-minus-1'))
  })
  expect(screen.getByTestId('life-1')).toHaveTextContent('37')
})

it('requires confirmation before resetting a table', async () => {
  render(<TrackerPage />)
  const user = await startSolo()
  await user.click(screen.getByTestId('life-minus-1'))
  await user.click(screen.getByTestId('button-reset'))
  expect(screen.getByTestId('life-1')).toHaveTextContent('39')
  await user.click(screen.getByRole('button', { name: 'Reset totals' }))
  expect(screen.getByTestId('life-1')).toHaveTextContent('40')
})

it('provides manual join by code and does not retry an invalid code forever', async () => {
  const original = global.fetch
  const fetcher = jest.fn().mockResolvedValue({ ok: false, status: 404 })
  global.fetch = fetcher
  try {
    render(<TrackerPage />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Pod code'), 'ABC-123')
    await user.click(screen.getByRole('button', { name: 'Join pod' }))
    await screen.findByTestId('join-error')
    expect(fetcher).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
  } finally { global.fetch = original }
})

const RETURNING_DEVICE = 'returning-phone-1234'
function seedSharedTable(ownSeat = true) {
  __resetDeviceIdForTests()
  localStorage.setItem('thestack:device-id', RETURNING_DEVICE)
  const snapshot: SyncSnapshot = {
    seq: 6,
    players: [1, 2].map(id => ({ id, name: id === 1 ? 'Host' : 'Returning player', life: id === 1 ? 40 : 23, cmd: 0, cmdFrom: {}, poison: 0, mana: 0, energy: 0, experience: 0 })),
    gameMode: { name: 'Commander', life: 40 }, customLife: 20, enabledCounters: ['cmd', 'poison', 'mana'],
  }
  const session = { id: 'resume-table', code: 'ABC123', hostDeviceId: 'public:host', createdAt: Date.now(), seq: 6 }
  const seats = [
    { seatId: 1, name: 'Host', ownerDeviceId: 'public:host' },
    { seatId: 2, name: 'Returning player', ownerDeviceId: ownSeat ? RETURNING_DEVICE : null },
  ]
  localStorage.setItem(SYNC_RECOVERY_KEY, JSON.stringify({ version: 1, deviceId: RETURNING_DEVICE, session, seats, queue: [], savedAt: Date.now() }))
  saveTable({
    syncSessionId: session.id,
    snapshot: { ...snapshot, players: snapshot.players.map(player => ({ ...player, life: 40 })) },
    events: [{ type: 'game_start', seq: 0, timestamp: Date.now(), format: 'Commander', startingLife: 40, players: snapshot.players.map(({ id, name }) => ({ id, name })) }],
  })
  return { id: session.id, session, snapshot, seats }
}
const response = (body: unknown, status = 200) => ({ ok: status < 400, status, json: async () => body }) as Response

it('automatically returns a cold reload to the same player with current server totals', async () => {
  const data = seedSharedTable()
  const original = global.fetch
  const fetcher = jest.fn(async (url: string) => url.includes('/by-code/')
    ? response(data) : response({ ops: [], seq: data.snapshot.seq, seats: data.seats }))
  global.fetch = fetcher as typeof fetch
  try {
    render(<StrictMode><TrackerPage /></StrictMode>)
    expect(await screen.findByTestId('life-2')).toHaveTextContent('23')
    expect(screen.getByTestId('input-name-1')).toHaveAttribute('readonly')
    expect(screen.getByTestId('input-name-2')).not.toHaveAttribute('readonly')
    expect(screen.getByText('Your seat')).toBeInTheDocument()
    expect(screen.queryByTestId('join-dialog')).not.toBeInTheDocument()
    expect(fetcher.mock.calls.filter(([url]) => url.includes('/by-code/'))).toHaveLength(1)
    expect(fetcher.mock.calls.filter(([url]) => url.endsWith('/seat'))).toHaveLength(0)
  } finally { global.fetch = original }
})

it('offers the seat picker when a saved player no longer owns a seat', async () => {
  const data = seedSharedTable(false)
  const original = global.fetch
  const fetcher = jest.fn(async (url: string) => url.includes('/by-code/')
    ? response(data) : response({ ops: [], seq: data.snapshot.seq, seats: data.seats }))
  global.fetch = fetcher as typeof fetch
  try {
    render(<TrackerPage />)
    expect(await screen.findByTestId('join-seat-2')).toBeEnabled()
    expect(screen.queryByTestId('join-error')).not.toBeInTheDocument()
    expect(fetcher.mock.calls.filter(([url]) => url.includes('/by-code/'))).toHaveLength(1)
  } finally { global.fetch = original }
})

it('lets a player leave expired recovery and start a new table', async () => {
  seedSharedTable()
  const original = global.fetch
  const fetcher = jest.fn(async () => response({ error: 'not_found' }, 404))
  global.fetch = fetcher as typeof fetch
  try {
    render(<TrackerPage />)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Start a new table' }))
    expect(await screen.findByTestId('mode-solo')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reconnect to table' })).not.toBeInTheDocument()
    expect(localStorage.getItem(SYNC_RECOVERY_KEY)).toBeNull()
    expect(fetcher).toHaveBeenCalledTimes(1)
  } finally { global.fetch = original }
})

it('retries end-game sync without creating a second already-saved recap', async () => {
  const data = seedSharedTable()
  data.session.hostDeviceId = RETURNING_DEVICE
  data.seats[0].ownerDeviceId = RETURNING_DEVICE
  data.seats[1].ownerDeviceId = null
  saveTable({
    syncSessionId: data.id, snapshot: data.snapshot,
    events: [
      { type: 'game_start', seq: 0, timestamp: 100, format: 'Commander', startingLife: 40, players: data.snapshot.players },
      { type: 'life_change', seq: 1, timestamp: 200, playerId: 2, delta: -17, lifeAfter: 23 },
    ],
  })
  let allowEnd = false
  const original = global.fetch
  const fetcher = jest.fn(async (url: string) => {
    if (url.includes('/by-code/')) return response(data)
    if (url === '/api/recap') return response({ id: 'only-recap', url: '/recap/only-recap' })
    if (url.endsWith('/op')) {
      if (!allowEnd) throw new Error('sync disconnected')
      return response({ snapshot: { ...data.snapshot, seq: 7, endedAt: Date.now(), winnerSeatId: 1 } })
    }
    return response({ ops: [], seq: 6, seats: data.seats })
  })
  global.fetch = fetcher as typeof fetch
  try {
    render(<TrackerPage />)
    const user = userEvent.setup()
    await user.click(await screen.findByTestId('button-end-game'))
    fireEvent.change(screen.getByTestId('input-pod-name'), { target: { value: 'Friday table' } })
    await user.click(screen.getByTestId('button-winner-1'))
    await user.click(screen.getByTestId('button-confirm-end-game'))
    expect(await screen.findByTestId('text-recap-error')).toHaveTextContent('Recap saved')
    expect(mockPush).not.toHaveBeenCalled()
    expect(screen.getByTestId('input-pod-name')).toBeDisabled()
    expect(screen.getByTestId('button-winner-1')).toBeDisabled()
    expect(screen.getByTestId('input-commander-1')).toBeDisabled()
    expect(screen.getByTestId('button-cancel-end-game')).toBeDisabled()
    expect(screen.getByTestId('button-close-end-game')).toBeDisabled()
    allowEnd = true
    await user.click(screen.getByTestId('button-confirm-end-game'))
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/recap/only-recap'))
    expect(fetcher.mock.calls.filter(([url]) => url === '/api/recap')).toHaveLength(1)
    expect(localStorage.getItem(TRACKER_SAVE_KEY)).toBeNull()
    expect(localStorage.getItem(SYNC_RECOVERY_KEY)).toBeNull()
  } finally { global.fetch = original }
})

it('does not recreate an ended local table after successfully saving a recap', async () => {
  const original = global.fetch
  global.fetch = jest.fn(async () => response({ id: 'finished-local', url: '/recap/finished-local' })) as typeof fetch
  try {
    const page = render(<TrackerPage />)
    const user = await startSolo()
    await user.click(screen.getByTestId('life-minus-1'))
    await user.click(screen.getByTestId('button-end-game'))
    await user.click(screen.getByTestId('button-confirm-end-game'))
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/recap/finished-local'))
    expect(localStorage.getItem(TRACKER_SAVE_KEY)).toBeNull()
    page.unmount()
    render(<TrackerPage />)
    expect(await screen.findByTestId('mode-solo')).toBeInTheDocument()
    expect(screen.queryByTestId('life-1')).not.toBeInTheDocument()
  } finally { global.fetch = original }
})

it('removes the join URL after successfully claiming a seat', async () => {
  const data = seedSharedTable(false)
  window.history.replaceState({}, '', '/tracker?join=ABC123')
  const original = global.fetch
  global.fetch = jest.fn(async (url: string) => {
    if (url.includes('/by-code/')) return response(data)
    if (url.endsWith('/seat')) return response({ seats: data.seats.map(seat => seat.seatId === 2 ? { ...seat, ownerDeviceId: RETURNING_DEVICE } : seat) })
    return response({ ops: [], seq: 6, seats: data.seats })
  }) as typeof fetch
  try {
    render(<TrackerPage />)
    const user = userEvent.setup()
    await user.click(await screen.findByTestId('join-seat-2'))
    expect(await screen.findByTestId('life-2')).toHaveTextContent('23')
    expect(window.location.search).toBe('')
  } finally { global.fetch = original }
})

it('records new changes for a returning host when older local history is missing', async () => {
  const data = seedSharedTable()
  data.session.hostDeviceId = RETURNING_DEVICE
  data.seats[0].ownerDeviceId = RETURNING_DEVICE
  data.seats[1].ownerDeviceId = null
  localStorage.removeItem(TRACKER_SAVE_KEY)
  const original = global.fetch
  global.fetch = jest.fn(async (url: string) => {
    if (url.includes('/by-code/')) return response(data)
    if (url.endsWith('/op')) return response({ snapshot: { ...data.snapshot, seq: 7, players: data.snapshot.players.map(player => player.id === 1 ? { ...player, life: 39 } : player) } })
    return response({ ops: [], seq: 6, seats: data.seats })
  }) as typeof fetch
  try {
    render(<TrackerPage />)
    const user = userEvent.setup()
    await user.click(await screen.findByTestId('life-minus-1'))
    await user.click(await screen.findByTestId('button-end-game'))
    expect(screen.getByText(/recorded history/i)).toBeInTheDocument()
    expect(screen.queryByText(/full life history/i)).not.toBeInTheDocument()
  } finally { global.fetch = original }
})
