/** Pure import and handoff logic. Counts always represent physical cards, not faces. */
export type Section = 'main' | 'commander' | 'sideboard' | 'maybeboard' | 'tokens'
export type FaceMode = 'reverse' | 'separate'
export type DeckEntry = { key: string; name: string; quantity: number; section: Section; set?: string; collector?: string }
export type CardInfo = {
  name: string; set?: string; collector_number?: string; layout?: string; scryfall_uri?: string
  image_uris?: { normal?: string }; card_faces?: { name: string; image_uris?: { normal?: string } }[]
}
export type CardMap = Record<string, CardInfo>
const BASIC = /^(snow-covered )?(plains|island|swamp|mountain|forest|wastes)$/i
const HEADINGS: Record<string, Section> = { deck: 'main', main: 'main', mainboard: 'main', commander: 'commander', commanders: 'commander', sideboard: 'sideboard', side: 'sideboard', maybeboard: 'maybeboard', considering: 'maybeboard', companion: 'sideboard', tokens: 'tokens' }
const cleanName = (name: string) => name.normalize('NFKC').replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase()

export function parseDeck(text: string) {
  const entries = new Map<string, DeckEntry>()
  const issues: { line: number; message: string }[] = []
  let section: Section = 'main'
  let total = 0
  const lines = text.split(/\r?\n/)
  if (text.length > 100000 || lines.length > 2500) return { entries: [], issues: [{ line: 1, message: 'Use a text list under 100 KB and 2,500 lines.' }] }
  lines.forEach((raw, index) => {
    let line = raw.trim()
    if (!line || line.startsWith('#') || line.startsWith('//')) return
    const heading = line.replace(/^\[|\]$|:$/g, '').toLowerCase()
    if (HEADINGS[heading]) { section = HEADINGS[heading]; return }
    let rowSection = section
    if (/^SB:\s*/i.test(line)) { rowSection = 'sideboard'; line = line.replace(/^SB:\s*/i, '') }
    line = line.replace(/\s+#.*$/, '').replace(/\s+\*[FE]\*\s*$/i, '').trim()
    if (/^(https?:\/\/|[\[{])/.test(line)) { issues.push({ line: index + 1, message: 'Paste a plain-text deck export, not a URL or JSON.' }); return }
    const match = line.match(/^(\d+)(?:x)?\s+(.+)$/i)
    const quantity = match ? Number(match[1]) : 1
    if ((!match && /^[+\-\d]/.test(line)) || quantity < 1 || quantity > 2000 || total + quantity > 2000) {
      issues.push({ line: index + 1, message: 'Use whole quantities of 1–2,000, up to 2,000 cards per list.' }); return
    }
    let name = match ? match[2].trim() : line
    const printing = name.match(/\s+\(([a-z0-9]+)\)\s+([a-z0-9★-]+)$/i)
    const set = printing?.[1].toLowerCase()
    const collector = printing?.[2]
    if (printing) name = name.slice(0, printing.index).trim()
    if (!name || name.length > 200 || entries.size >= 500) { issues.push({ line: index + 1, message: 'Use card names under 200 characters and at most 500 unique rows.' }); return }
    const key = [rowSection, cleanName(name), set || '', collector || ''].join('|')
    const existing = entries.get(key)
    entries.set(key, { key, name, quantity: quantity + (existing?.quantity || 0), section: rowSection, set, collector })
    total += quantity
  })
  return { entries: [...entries.values()], issues }
}

export function selectEntries(entries: DeckEntry[], sideboard: boolean, maybeboard: boolean, basics: boolean) {
  return entries.filter(e => (sideboard || e.section !== 'sideboard') && (maybeboard || e.section !== 'maybeboard') && (basics || !BASIC.test(e.name)))
}
export function isDoubleFaced(card?: CardInfo) {
  return !!card && !card.image_uris && !!card.card_faces?.[0]?.image_uris && !!card.card_faces?.[1]?.image_uris
}
export function matchCard(entry: DeckEntry, cards: CardInfo[]) {
  return cards.find(card => {
    const names = [card.name, ...(card.card_faces?.map(f => f.name) || [])].map(cleanName)
    return names.includes(cleanName(entry.name)) && (!entry.set || (card.set === entry.set && card.collector_number === entry.collector))
  })
}
export function physicalCount(entries: DeckEntry[], cards: CardMap, mode: FaceMode, copies: number) {
  return entries.reduce((sum, e) => sum + e.quantity * (mode === 'separate' && isDoubleFaced(cards[e.key]) ? 2 : 1), 0) * copies
}
export function normalizedList(entries: DeckEntry[], copies = 1) {
  return entries.map(e => `${e.quantity * copies} ${e.name}${e.set ? ` (${e.set.toUpperCase()}) ${e.collector}` : ''}`).join('\n')
}
export function manifestCsv(entries: DeckEntry[], cards: CardMap, mode: FaceMode, copies: number, back: string) {
  const rows: (string | number)[][] = [['Quantity', 'Front', 'Back', 'Set', 'Collector', 'Section', 'Review status']]
  for (const e of entries) {
    const card = cards[e.key]
    const double = isDoubleFaced(card)
    const front = double ? card.card_faces![0].name : e.name
    const reverse = double ? card.card_faces![1].name : back
    rows.push([e.quantity * copies, front, double && mode === 'reverse' ? reverse : back, e.set || '', e.collector || '', e.section, !card ? 'Not verified' : card.layout === 'meld' ? 'Meld: check combined reverse manually' : 'Name verified; select print artwork at provider'])
    if (double && mode === 'separate') rows.push([e.quantity * copies, reverse, back, e.set || '', e.collector || '', e.section, 'Separate reverse-face card; verify provider support'])
  }
  return rows.map(row => row.map(cell => {
    const text = String(cell)
    return `"${(/^[=+\-@\t\r]/.test(text) ? "'" : '') + text.replace(/"/g, '""')}"`
  }).join(',')).join('\r\n')
}

export async function reviewCards(entries: DeckEntry[], signal: AbortSignal, progress: (done: number) => void): Promise<CardMap> {
  const result: CardMap = {}
  for (let i = 0; i < entries.length; i += 75) {
    signal.throwIfAborted()
    if (i) await new Promise(resolve => setTimeout(resolve, 550))
    signal.throwIfAborted()
    const batch = entries.slice(i, i + 75)
    const response = await fetch('https://api.scryfall.com/cards/collection', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, signal,
      // Collection lookup accepts a face name; matchCard still checks the full
      // supplied name so a misspelled second face cannot silently pass review.
      body: JSON.stringify({ identifiers: batch.map(e => e.set ? { set: e.set, collector_number: e.collector } : { name: e.name.split(' // ')[0] }) }),
    })
    if (!response.ok) throw new Error(response.status === 429 ? 'Scryfall is busy. Wait a moment and try again.' : 'Card lookup is unavailable. Your list is still here; please retry.')
    const data = await response.json() as { data?: CardInfo[] }
    if (!Array.isArray(data.data)) throw new Error('Card lookup returned an unreadable result. Please retry.')
    for (const entry of batch) { const card = matchCard(entry, data.data); if (card) result[entry.key] = card }
    progress(Math.min(i + 75, entries.length))
  }
  return result
}
