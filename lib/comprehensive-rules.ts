export const COMPREHENSIVE_RULES_URL =
  'https://raw.githubusercontent.com/mtgcommander/ComprehensiveRules/master/ComprehensiveRules.txt'

export const COMPREHENSIVE_RULES_CACHE_KEY = 'manadork-cr-cache'
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000

interface ComprehensiveRulesCacheEntry {
  text: string
  timestamp: number
  expiresAt: number
}

function readCache(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const cached = localStorage.getItem(COMPREHENSIVE_RULES_CACHE_KEY)
    if (!cached) {
      return null
    }

    const entry: ComprehensiveRulesCacheEntry = JSON.parse(cached)
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(COMPREHENSIVE_RULES_CACHE_KEY)
      return null
    }

    return entry.text
  } catch (error) {
    console.error('Error reading comprehensive rules cache:', error)
    return null
  }
}

function writeCache(text: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const entry: ComprehensiveRulesCacheEntry = {
      text,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION_MS,
    }
    localStorage.setItem(COMPREHENSIVE_RULES_CACHE_KEY, JSON.stringify(entry))
  } catch (error) {
    console.error('Error writing comprehensive rules cache:', error)
  }
}

export async function getComprehensiveRulesText(
  fetchFn: typeof fetch = fetch
): Promise<string> {
  const cached = readCache()
  if (cached !== null) {
    return cached
  }

  const response = await fetchFn(COMPREHENSIVE_RULES_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch comprehensive rules (${response.status})`)
  }

  const text = await response.text()
  writeCache(text)
  return text
}
