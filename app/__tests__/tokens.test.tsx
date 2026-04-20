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
