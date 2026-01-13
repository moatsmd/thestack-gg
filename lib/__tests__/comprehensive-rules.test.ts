import { getComprehensiveRulesText, COMPREHENSIVE_RULES_CACHE_KEY } from '../comprehensive-rules'

describe('getComprehensiveRulesText', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('returns cached rules when cache is fresh', async () => {
    const cached = {
      text: 'cached rules',
      timestamp: Date.now(),
      expiresAt: Date.now() + 1000 * 60,
    }
    localStorage.setItem(COMPREHENSIVE_RULES_CACHE_KEY, JSON.stringify(cached))

    const fetchSpy = jest.fn()

    const result = await getComprehensiveRulesText(fetchSpy)

    expect(result).toBe('cached rules')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('fetches rules when cache is missing', async () => {
    const fetchSpy = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('fetched rules'),
    })

    const result = await getComprehensiveRulesText(fetchSpy)

    expect(fetchSpy).toHaveBeenCalled()
    expect(result).toBe('fetched rules')
  })
})
