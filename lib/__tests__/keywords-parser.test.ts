import {
  parseOracleTextForKeywords,
  containsKeyword,
  getUniqueKeywords,
} from '../keywords-parser'
import { KeywordDefinition } from '../keywords-data'

describe('parseOracleTextForKeywords', () => {
  const mockKeywords: KeywordDefinition[] = [
    {
      keyword: 'Flying',
      type: 'ability',
      definition: 'This creature can only be blocked by creatures with flying or reach.',
    },
    {
      keyword: 'First Strike',
      type: 'ability',
      definition: 'This creature deals combat damage before creatures without first strike.',
    },
    {
      keyword: 'Trample',
      type: 'ability',
      definition: 'This creature can deal excess combat damage to the player.',
    },
    {
      keyword: 'Flash',
      type: 'ability',
      definition: 'You may cast this spell any time you could cast an instant.',
    },
    {
      keyword: 'Flashback',
      type: 'mechanic',
      definition: 'You may cast this card from your graveyard for its flashback cost.',
    },
  ]

  it('returns empty array for empty text', () => {
    expect(parseOracleTextForKeywords('')).toEqual([])
  })

  it('finds single keyword in text', () => {
    const text = 'This creature has flying.'
    const result = parseOracleTextForKeywords(text, mockKeywords)

    expect(result).toHaveLength(1)
    expect(result[0].keyword).toBe('flying')
    expect(result[0].definition.keyword).toBe('Flying')
    expect(result[0].startIndex).toBe(18)
    expect(result[0].endIndex).toBe(24)
  })

  it('finds multiple keywords in text', () => {
    const text = 'Flying, first strike, trample'
    const result = parseOracleTextForKeywords(text, mockKeywords)

    expect(result).toHaveLength(3)
    // Preserves casing from original text
    expect(result[0].keyword).toBe('Flying')
    expect(result[1].keyword).toBe('first strike')
    expect(result[2].keyword).toBe('trample')
    // But definitions have correct casing
    expect(result[0].definition.keyword).toBe('Flying')
    expect(result[1].definition.keyword).toBe('First Strike')
    expect(result[2].definition.keyword).toBe('Trample')
  })

  it('matches keywords case-insensitively', () => {
    const text = 'FLYING and First Strike'
    const result = parseOracleTextForKeywords(text, mockKeywords)

    expect(result).toHaveLength(2)
    // Preserves original casing from text
    expect(result[0].keyword).toBe('FLYING')
    expect(result[1].keyword).toBe('First Strike')
    // But definitions match correctly
    expect(result[0].definition.keyword).toBe('Flying')
    expect(result[1].definition.keyword).toBe('First Strike')
  })

  it('matches multi-word keywords', () => {
    const text = 'Creatures with first strike attack first.'
    const result = parseOracleTextForKeywords(text, mockKeywords)

    expect(result).toHaveLength(1)
    expect(result[0].keyword).toBe('first strike')
    expect(result[0].definition.keyword).toBe('First Strike')
  })

  it('does not match partial words', () => {
    const text = 'This spell has flashback but not flash.'
    const result = parseOracleTextForKeywords(text, mockKeywords)

    // Should find both "flashback" and "flash" as separate keywords
    expect(result).toHaveLength(2)
    expect(result.some((pk) => pk.definition.keyword === 'Flashback')).toBe(true)
    expect(result.some((pk) => pk.definition.keyword === 'Flash')).toBe(true)
  })

  it('prevents overlapping matches by prioritizing longer keywords', () => {
    const text = 'Flashback ability'
    const result = parseOracleTextForKeywords(text, mockKeywords)

    // Should match "Flashback" not "Flash"
    expect(result).toHaveLength(1)
    expect(result[0].definition.keyword).toBe('Flashback')
  })

  it('sorts results by position in text', () => {
    const text = 'Trample and flying'
    const result = parseOracleTextForKeywords(text, mockKeywords)

    expect(result).toHaveLength(2)
    expect(result[0].definition.keyword).toBe('Trample')
    expect(result[1].definition.keyword).toBe('Flying')
  })

  it('handles multiple occurrences of same keyword', () => {
    const text = 'Flying creatures can block other flying creatures.'
    const result = parseOracleTextForKeywords(text, mockKeywords)

    expect(result).toHaveLength(2)
    // Both instances preserve their original casing
    expect(result[0].keyword).toBe('Flying')
    expect(result[1].keyword).toBe('flying')
    expect(result[0].startIndex).toBe(0)
    expect(result[1].startIndex).toBe(33)
  })
})

describe('containsKeyword', () => {
  it('returns true when keyword is present', () => {
    const text = 'This creature has flying.'
    expect(containsKeyword(text, 'Flying')).toBe(true)
  })

  it('returns false when keyword is not present', () => {
    const text = 'This creature has trample.'
    expect(containsKeyword(text, 'Flying')).toBe(false)
  })

  it('is case-insensitive', () => {
    const text = 'This creature has FLYING.'
    expect(containsKeyword(text, 'flying')).toBe(true)
  })
})

describe('getUniqueKeywords', () => {
  it('returns unique keywords from text', () => {
    const text = 'Flying, flying, trample'
    const result = getUniqueKeywords(text)

    expect(result.length).toBeGreaterThan(0)
    const keywords = result.map((kw) => kw.keyword.toLowerCase())
    expect(keywords).toContain('flying')
    expect(keywords).toContain('trample')
    // Should not have duplicates
    expect(keywords.filter((kw) => kw === 'flying')).toHaveLength(1)
  })

  it('returns empty array for text with no keywords', () => {
    const text = 'This is just regular text with no keywords.'
    const result = getUniqueKeywords(text)

    expect(result).toEqual([])
  })
})
