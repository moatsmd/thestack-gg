describe('token data', () => {
  it('TOKENS array exists and has entries', () => {
    const { TOKENS } = require('@/lib/tokens-data')
    expect(Array.isArray(TOKENS)).toBe(true)
    expect(TOKENS.length).toBeGreaterThan(10)
  })

  it('every token has required fields', () => {
    const { TOKENS } = require('@/lib/tokens-data')
    for (const t of TOKENS) {
      expect(t.name).toBeTruthy()
      expect(Array.isArray(t.colors)).toBe(true)
      expect(['creature', 'artifact', 'enchantment', 'emblem']).toContain(t.type)
      expect(Array.isArray(t.abilities)).toBe(true)
      expect(Array.isArray(t.madeBy)).toBe(true)
    }
  })

  it('Goblin token exists', () => {
    const { TOKENS } = require('@/lib/tokens-data')
    const goblin = TOKENS.find((t: any) => t.name === 'Goblin')
    expect(goblin).toBeDefined()
    expect(goblin.colors).toContain('R')
    expect(goblin.type).toBe('creature')
  })

  it('Treasure token exists', () => {
    const { TOKENS } = require('@/lib/tokens-data')
    const treasure = TOKENS.find((t: any) => t.name === 'Treasure')
    expect(treasure).toBeDefined()
    expect(treasure.type).toBe('artifact')
  })
})

describe('searchTokens', () => {
  it('returns all tokens for empty query', () => {
    const { searchTokens, TOKENS } = require('@/lib/tokens-data')
    expect(searchTokens('').length).toBe(TOKENS.length)
  })

  it('returns matching tokens for a name query', () => {
    const { searchTokens } = require('@/lib/tokens-data')
    const results = searchTokens('goblin')
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((t: any) => t.name.toLowerCase().includes('goblin') || t.madeBy.some((m: any) => m.toLowerCase().includes('goblin')))).toBe(true)
  })

  it('returns empty array for non-matching query', () => {
    const { searchTokens } = require('@/lib/tokens-data')
    expect(searchTokens('zzznomatch').length).toBe(0)
  })

  it('trims whitespace in query', () => {
    const { searchTokens, TOKENS } = require('@/lib/tokens-data')
    expect(searchTokens('   ').length).toBe(TOKENS.length)
  })
})
