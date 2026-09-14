import { parseComprehensiveRules, searchComprehensiveRules } from '../rules-parser'

const sampleRules = `
603.1. Triggered abilities have a trigger condition and an effect.
603.1a A triggered ability may read "When," "Whenever," or "At."
603.2. Triggered abilities can trigger only once each time their trigger condition is met.
614.1. Replacement effects watch for a particular event and replace it with a different event.
`

describe('parseComprehensiveRules', () => {
  it('keeps section headings and the final glossary out of rule bodies', () => {
    const sections = parseComprehensiveRules('100. General\n100.1. First rule.\nExample: A sample.\n101. Golden Rules\n101.1. Second rule.\nGlossary\nAbility\nA glossary entry.\n704.5z A quoted rule in the glossary.\nCredits\nSomeone')
    expect(sections.map(s => s.id)).toEqual(['100.1', '101.1'])
    expect(sections[0].body).toBe('First rule. Example: A sample.')
    expect(sections[1].body).toBe('Second rule.')
  })
  it('parses rule sections with ids and bodies', () => {
    const sections = parseComprehensiveRules(sampleRules)

    expect(sections).toHaveLength(4)
    expect(sections[0]).toEqual({
      id: '603.1',
      title: 'Triggered abilities have a trigger condition and an effect.',
      body: 'Triggered abilities have a trigger condition and an effect.',
    })
    expect(sections[1].id).toBe('603.1a')
    expect(sections[2].id).toBe('603.2')
    expect(sections[3].id).toBe('614.1')
  })
})

describe('searchComprehensiveRules', () => {
  it('ranks exact numbers above references and supports section numbers', () => {
    const sections = parseComprehensiveRules('103.2b See rule 702.139 for companions.\n702.1. Keyword abilities.\n702.1a More about keywords.\n702.10a Haste.')
    expect(searchComprehensiveRules(sections, '702.1')[0].id).toBe('702.1')
    expect(searchComprehensiveRules(sections, '702.1.')[0].id).toBe('702.1')
    expect(searchComprehensiveRules(sections, '702').slice(0, 3).map(s => s.id)).toEqual(['702.1', '702.1a', '702.10a'])
  })
  it('returns matches ordered by relevance', () => {
    const sections = parseComprehensiveRules(sampleRules)
    const results = searchComprehensiveRules(sections, '603.1')

    expect(results[0].id).toBe('603.1')
  })

  it('matches body text case-insensitively', () => {
    const sections = parseComprehensiveRules(sampleRules)
    const results = searchComprehensiveRules(sections, 'replacement effects')

    expect(results[0].id).toBe('614.1')
  })
})
