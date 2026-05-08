import { checkName, checkNames } from '../name-moderation'

describe('checkName — legit names pass', () => {
  it.each([
    'Alice',
    'Bob',
    'Friday Night Crew',
    'Atraxa, Praetors\' Voice',
    'Edgar Markov',
    'The Ur-Dragon',
    "Yuriko, the Tiger's Shadow",
    "Korvold, Fae-Cursed King",
    'Player 1',
    '',
    '   ',
  ])('allows %s', (name) => {
    expect(checkName(name).ok).toBe(true)
  })
})

describe('checkName — casual swearing is allowed (MTG players talk like adults)', () => {
  it.each([
    'Shitfaced Friday',
    'Fuck Around Find Out',
    'Ass Pull Andy',
    'Dick Move Dan',
    'Piss Disc',
    'Damn Good Pod',
    'Hell Crawler',
    'The Bitch Squad', // borderline; the spec says casual is allowed
  ])('allows %s', (name) => {
    expect(checkName(name).ok).toBe(true)
  })
})

describe('checkName — slurs and hard offensive are blocked', () => {
  it.each([
    'NiggerKing',
    'kike pod',
    'Faggot Friday',
    'Retard Squad',
    'Tranny Crew',
    'Pedo Patrol',
    'SpicyChink', // contains chink
    'wetback',
    'Bestiality Bros',
    'Rape squad',
  ])('blocks %s', (name) => {
    const result = checkName(name)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toMatch(/different name/i)
  })
})

describe('checkName — leetspeak variants are blocked', () => {
  it.each([
    'n1gger',
    'n1gg3r',
    'f@g',
    'F4G',
    'r3tard',
  ])('blocks %s', (name) => {
    expect(checkName(name).ok).toBe(false)
  })
})

describe('checkName — Scunthorpe-style false positives we tolerate as legit', () => {
  // These are real card / commander references that should NOT be blocked.
  // If any of these regress, the dataset has gotten too aggressive.
  it.each([
    'Cocksure Strategist', // contains "cock", which we allow
    'Niagara', // contains substring "niag" — must NOT match nigger
    'Scunthorpe', // famous false-positive test
    'Class Strategist', // contains "ass"
    'Pissarro', // historical name containing "piss"
  ])('allows %s', (name) => {
    expect(checkName(name).ok).toBe(true)
  })
})

describe('checkNames — labeled batch returns first failing field', () => {
  it('returns ok when every field is clean', () => {
    const result = checkNames([
      { label: 'Pod name', value: 'Friday Crew' },
      { label: 'Player Alice', value: 'Alice' },
      { label: 'Commander', value: 'Atraxa' },
    ])
    expect(result.ok).toBe(true)
  })

  it('returns the labeled field when one fails', () => {
    const result = checkNames([
      { label: 'Pod name', value: 'Friday Crew' },
      { label: 'Player 2', value: 'NiggerKing' },
      { label: 'Commander', value: 'Atraxa' },
    ])
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.field).toBe('Player 2')
      expect(result.error).toContain('Player 2')
    }
  })

  it('skips undefined or empty values', () => {
    const result = checkNames([
      { label: 'Pod name', value: undefined },
      { label: 'Commander', value: '' },
      { label: 'Player', value: 'Alice' },
    ])
    expect(result.ok).toBe(true)
  })
})
