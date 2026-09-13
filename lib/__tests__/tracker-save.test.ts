import { clearTable, readTable, saveTable, TRACKER_SAVE_KEY, type SavedTable } from '../tracker-save'

const table = (): SavedTable => ({
  savedAt: Date.now(), syncSessionId: 'table-1',
  snapshot: {
    seq: 4, players: [{ id: 1, name: 'Player 1', life: 37, cmd: 0, cmdFrom: {}, poison: 0, mana: 0, energy: 0, experience: 0 }],
    gameMode: { name: 'Commander', life: 40 }, customLife: 20, enabledCounters: ['cmd', 'poison'],
  },
  events: [
    { type: 'game_start', seq: 0, timestamp: 100, format: 'Commander', startingLife: 40, players: [{ id: 1, name: 'Player 1' }] },
    { type: 'life_change', seq: 1, timestamp: 200, playerId: 1, delta: -3, lifeAfter: 37 },
  ],
})
const plant = (value: unknown) => localStorage.setItem(TRACKER_SAVE_KEY, JSON.stringify(value))
beforeEach(() => localStorage.clear())

test('round-trips a valid table with its event history and clears explicitly', () => {
  const saved = table()
  expect(saveTable(saved)).toBe(true)
  expect(readTable()).toEqual(expect.objectContaining({ snapshot: saved.snapshot, events: saved.events, syncSessionId: 'table-1' }))
  clearTable()
  expect(readTable()).toBeNull()
})

test.each([
  ['null event', (value: SavedTable) => { value.events = [null as never] }],
  ['unknown event', (value: SavedTable) => { value.events[1] = { ...value.events[1], type: 'mystery' } as never }],
  ['missing sequence', (value: SavedTable) => { delete (value.events[1] as Partial<typeof value.events[1]>).seq }],
  ['duplicate sequence', (value: SavedTable) => { value.events[1].seq = 0 }],
  ['invalid timestamp', (value: SavedTable) => { value.events[1].timestamp = -1 }],
  ['invalid event total', (value: SavedTable) => { value.events[1] = { ...value.events[1], lifeAfter: '37' } as never }],
  ['event references missing player', (value: SavedTable) => { value.events[1] = { ...value.events[1], playerId: 8 } as never }],
  ['missing game start', (value: SavedTable) => { value.events.shift() }],
  ['events after game end', (value: SavedTable) => { value.events.splice(1, 0, { type: 'game_end', seq: 1, timestamp: 150 }); value.events[2].seq = 2 }],
  ['unsupported counter', (value: SavedTable) => { value.snapshot.enabledCounters.push('bogus' as never) }],
  ['duplicate counter', (value: SavedTable) => { value.snapshot.enabledCounters.push('cmd') }],
  ['duplicate player ID', (value: SavedTable) => { value.snapshot.players.push({ ...value.snapshot.players[0] }) }],
  ['negative player ID', (value: SavedTable) => { value.snapshot.players[0].id = -1 }],
  ['long player name', (value: SavedTable) => { value.snapshot.players[0].name = 'a'.repeat(257) }],
  ['invalid commander source', (value: SavedTable) => { value.snapshot.players[0].cmdFrom = { 8: 3 } }],
  ['negative counter', (value: SavedTable) => { value.snapshot.players[0].poison = -3 }],
  ['invalid session ID', (value: SavedTable) => { value.syncSessionId = {} as never }],
  ['invalid snapshot cursor', (value: SavedTable) => { value.snapshot.seq = -1 }],
  ['expired save', (value: SavedTable) => { value.savedAt -= 31 * 60 * 60 * 1000 }],
] as const)('ignores a malformed table: %s', (_label, mutate) => {
  const saved = table()
  mutate(saved)
  plant(saved)
  expect(readTable()).toBeNull()
})

test('handles corrupted JSON and blocked browser storage without crashing', () => {
  localStorage.setItem(TRACKER_SAVE_KEY, '{broken')
  expect(readTable()).toBeNull()
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
  expect(readTable()).toBeNull()
  jest.restoreAllMocks()
})
