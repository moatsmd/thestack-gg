import { parseComprehensiveRules, searchComprehensiveRules } from '../rules-parser'

const sampleRules = `
603.1. Triggered abilities have a trigger condition and an effect.
603.1a A triggered ability may read "When," "Whenever," or "At."
603.2. Triggered abilities can trigger only once each time their trigger condition is met.
614.1. Replacement effects watch for a particular event and replace it with a different event.
`

describe('parseComprehensiveRules', () => {
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
