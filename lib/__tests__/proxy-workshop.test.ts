import { parseDeck, selectEntries, physicalCount, normalizedList, manifestCsv, matchCard, isDoubleFaced, reviewCards } from '../proxy-deck'
import { estimatePrinting } from '../proxy-providers'

describe('proxy deck preparation', () => {
  test('imports common exports, combines duplicates, and preserves sections and printings', () => {
    const deck = parseDeck('Commander\n1 Atraxa, Praetors\' Voice\n\nDeck\n2x Sol Ring (CMM) 410\n1 Sol Ring (CMM) 410\n4 Forest\nSideboard\n1 Negate\nMaybeboard\n1 Counterspell')
    expect(deck.issues).toEqual([])
    expect(deck.entries).toHaveLength(5)
    expect(deck.entries[1]).toMatchObject({ quantity: 3, name: 'Sol Ring', set: 'cmm', collector: '410' })
    expect(selectEntries(deck.entries, false, false, true).reduce((s, x) => s + x.quantity, 0)).toBe(8)
    expect(selectEntries(deck.entries, true, false, false).reduce((s, x) => s + x.quantity, 0)).toBe(5)
  })
  test('reports malformed and excessive quantities instead of quietly changing an order', () => {
    const deck = parseDeck('0 Sol Ring\n-2 Forest\n1.5 Island\n2001 Mountain\n1 Sol Ring\nhttps://moxfield.com/decks/example')
    expect(deck.issues.map(x => x.line)).toEqual([1, 2, 3, 4, 6])
    expect(deck.entries).toHaveLength(1)
  })
  test('preserves split names, strips foil markers, and handles SB prefixes', () => {
    const deck = parseDeck('1 Fire // Ice (MH2) 290 *F*\nSB: 2x Negate\n# comment\n1 Forest #Land')
    expect(deck.entries.map(x => x.name)).toEqual(['Fire // Ice', 'Negate', 'Forest'])
    expect(deck.entries[1].section).toBe('sideboard')
  })
  test('counts physical double faces rather than split/adventure names', () => {
    const entries = parseDeck('2 Delver of Secrets\n1 Fire // Ice').entries
    const cards = { [entries[0].key]: { name: 'Delver of Secrets // Insectile Aberration', layout: 'transform', card_faces: [{ name: 'Delver of Secrets', image_uris: { normal: 'front' } }, { name: 'Insectile Aberration', image_uris: { normal: 'back' } }] }, [entries[1].key]: { name: 'Fire // Ice', layout: 'split', image_uris: { normal: 'single' } } }
    expect(isDoubleFaced(cards[entries[0].key])).toBe(true)
    expect(isDoubleFaced(cards[entries[1].key])).toBe(false)
    expect(physicalCount(entries, cards, 'reverse', 2)).toBe(6)
    expect(physicalCount(entries, cards, 'separate', 2)).toBe(10)
    expect(manifestCsv(entries, cards, 'separate', 1, 'Archive')).toContain('Insectile Aberration')
  })
  test('does not substitute a different specified printing or wrong card', () => {
    const entry = parseDeck('1 Sol Ring (CMM) 410').entries[0]
    expect(matchCard(entry, [{ name: 'Sol Ring', set: 'cmm', collector_number: '410' }])?.name).toBe('Sol Ring')
    expect(matchCard(entry, [{ name: 'Sol Ring', set: 'cmm', collector_number: '411' }])).toBeUndefined()
    expect(matchCard(entry, [{ name: 'Forest', set: 'cmm', collector_number: '410' }])).toBeUndefined()
  })
  test('exports printing hints and neutralizes spreadsheet formula cells', () => {
    const entries = parseDeck('1 Sol Ring (CMM) 410\n1 =HYPERLINK("bad")').entries
    expect(normalizedList(entries, 2)).toContain('2 Sol Ring (CMM) 410')
    expect(manifestCsv(entries, {}, 'reverse', 1, 'Archive')).toContain("'=HYPERLINK")
  })
  test('looks up the first face while checking the returned full split name', async () => {
    const oldFetch = global.fetch
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [{ name: 'Fire // Ice', layout: 'split', image_uris: { normal: 'one-image' } }] }) })
    global.fetch = fetchMock
    try {
      const entries = parseDeck('1 Fire // Ice\n1 Fire // Wrong').entries
      const result = await reviewCards(entries, new AbortController().signal, () => {})
      expect(JSON.parse(fetchMock.mock.calls[0][1].body).identifiers).toEqual([{ name: 'Fire' }, { name: 'Fire' }])
      expect(result[entries[0].key]?.name).toBe('Fire // Ice')
      expect(result[entries[1].key]).toBeUndefined()
    } finally { global.fetch = oldFetch }
  })
})

describe('published printing estimates in integer cents', () => {
  test.each([[1, null], [2, 400], [9, 1800], [10, 1500], [29, 4350], [30, 3750], [49, 6125], [50, 5000], [74, 7400], [75, 6000], [99, 7920], [100, 5500], [199, 10945], [200, 9000], [499, 22455], [500, 19000], [999, 37962], [1000, 33000]])('PrintMTG %i cards', (count, expected) => {
    expect(estimatePrinting('printmtg', count)).toBe(expected)
  })
  test.each([[1, 200], [9, 1800], [10, 1500], [49, 7350], [50, 5000], [199, 19900], [200, 15000]])('PrintingProxies %i cards', (count, expected) => {
    expect(estimatePrinting('printingproxies', count)).toBe(expected)
  })
  test('unknown configurations and invalid quantities have no invented estimate', () => {
    expect(estimatePrinting('mpc', 100)).toBeNull()
    expect(estimatePrinting('printmtg', 0)).toBeNull()
    expect(estimatePrinting('printmtg', 1.5)).toBeNull()
  })
})
