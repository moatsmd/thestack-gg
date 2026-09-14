import { canPayBears, combatOutcome, emptyProgress, parseProgress, LEARN_STORAGE_KEY, resolveBearsStack } from '../learn'

describe('Learn rule outcomes', () => {
  it('requires two mana including green for Grizzly Bears', () => {
    expect(canPayBears(['U', 'U'])).toBe(false)
    expect(canPayBears(['G'])).toBe(false)
    expect(canPayBears(['G', 'U'])).toBe(true)
    expect(canPayBears(['G', 'G'])).toBe(true)
  })
  it('deals simultaneous combat damage without reducing toughness', () => {
    expect(combatOutcome(3, 3, 2, 2)).toEqual({ attackerDies: false, blockerDies: true, playerDamage: 0, attackerDamage: 2, blockerDamage: 3 })
    expect(combatOutcome(2, 2, 2, 2).attackerDies).toBe(true)
    expect(combatOutcome(2, 2, 2, 2).blockerDies).toBe(true)
  })
  it('unblocked creatures damage the defending player', () => {
    expect(combatOutcome(3, 3, null, null).playerDamage).toBe(3)
  })
  it('a growth response saves Bears from Bolt, while passing does not', () => {
    expect(resolveBearsStack(true)).toEqual({ power: 5, toughness: 5, damage: 3, survives: true })
    expect(resolveBearsStack(false)).toEqual({ power: 2, toughness: 2, damage: 3, survives: false })
  })
})

describe('Learn persistence validation', () => {
  it('round-trips partial exercises and completions', () => {
    const saved = { ...emptyProgress(), current: 'cast', completed: ['basics'], exercises: { cast: { step: 1, choice: '', flags: ['forest'] } } }
    expect(parseProgress(JSON.stringify(saved))).toEqual(saved)
    expect(LEARN_STORAGE_KEY).toBe('thestack-learn-v1')
  })
  it('recovers from broken JSON and unknown schema versions', () => {
    expect(parseProgress('{broken')).toEqual(emptyProgress())
    expect(parseProgress('{"version":99}')).toEqual(emptyProgress())
  })
  it('rejects invalid chapter data and oversized exercise state', () => {
    const saved = { ...emptyProgress(), current: 'unknown', completed: ['basics', 'basics', 'unknown'], exercises: { cast: { step: 999, flags: [], choice: '' }, mystery: { step: 1 } } }
    const parsed = parseProgress(JSON.stringify(saved))
    expect(parsed.current).toBe('basics')
    expect(parsed.completed).toEqual(['basics'])
    expect(parsed.exercises).toEqual({})
  })
  it('rejects impossible chapter states rather than showing false outcomes', () => {
    const saved = { ...emptyProgress(), exercises: { stack: { step: 8, choice: '', flags: [] }, cast: { step: 2, choice: 'cast', flags: [] }, basics: { step: 1, choice: 'nonsense', flags: [] } } }
    expect(parseProgress(JSON.stringify(saved)).exercises).toEqual({})
  })
})
