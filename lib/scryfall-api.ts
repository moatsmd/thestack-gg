import {
  ScryfallCard,
  ScryfallAutocompleteResponse,
  ScryfallSearchResponse,
  ScryfallError,
  isScryfallError,
  CacheEntry,
} from '@/types/scryfall'

const SCRYFALL_API_BASE = 'https://api.scryfall.com'
const RATE_LIMIT_DELAY = 75 // milliseconds between requests
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// Rate limiting
let lastRequestTime = 0

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime

  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    const delay = RATE_LIMIT_DELAY - timeSinceLastRequest
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  lastRequestTime = Date.now()
  return fetch(url)
}

// Cache helpers
function getCacheKey(endpoint: string, query: string): string {
  return `scryfall-cache:${endpoint}:${query}`
}

function getFromCache<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const cached = localStorage.getItem(key)
    if (!cached) {
      return null
    }

    const entry: CacheEntry<T> = JSON.parse(cached)
    const now = Date.now()

    if (now > entry.expiresAt) {
      localStorage.removeItem(key)
      return null
    }

    return entry.data
  } catch (error) {
    console.error('Error reading from cache:', error)
    return null
  }
}

function setCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION,
    }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch (error) {
    console.error('Error writing to cache:', error)
  }
}

export function clearCache(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('scryfall-cache:')) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('Error clearing cache:', error)
  }
}

// API error handler
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json()

  if (!response.ok) {
    if (isScryfallError(data)) {
      throw new Error(data.details)
    }
    throw new Error(`API request failed with status ${response.status}`)
  }

  return data
}

/**
 * Autocomplete card names
 * @param query - Search query string
 * @returns Array of card name suggestions
 */
export async function autocomplete(query: string): Promise<string[]> {
  if (!query.trim()) {
    return []
  }

  const cacheKey = getCacheKey('autocomplete', query)
  const cached = getFromCache<string[]>(cacheKey)

  if (cached !== null) {
    return cached
  }

  const url = `${SCRYFALL_API_BASE}/cards/autocomplete?q=${encodeURIComponent(query)}`
  const response = await rateLimitedFetch(url)
  const data = await handleResponse<ScryfallAutocompleteResponse>(response)

  setCache(cacheKey, data.data)
  return data.data
}

/**
 * Search for cards using Scryfall's search syntax
 * @param query - Search query (supports Scryfall syntax like "c:blue t:creature")
 * @returns Search response with array of matching cards
 */
export async function searchCards(query: string): Promise<ScryfallSearchResponse> {
  if (!query.trim()) {
    return {
      object: 'list',
      total_cards: 0,
      has_more: false,
      data: [],
    }
  }

  const cacheKey = getCacheKey('search', query)
  const cached = getFromCache<ScryfallSearchResponse>(cacheKey)

  if (cached !== null) {
    return cached
  }

  const url = `${SCRYFALL_API_BASE}/cards/search?q=${encodeURIComponent(query)}`
  const response = await rateLimitedFetch(url)
  const data = await handleResponse<ScryfallSearchResponse>(response)

  setCache(cacheKey, data)
  return data
}

/**
 * Get a specific card by exact name
 * @param name - Exact card name
 * @returns Card data
 */
export async function getCardByName(name: string): Promise<ScryfallCard> {
  const cacheKey = getCacheKey('named', name)
  const cached = getFromCache<ScryfallCard>(cacheKey)

  if (cached !== null) {
    return cached
  }

  const url = `${SCRYFALL_API_BASE}/cards/named?exact=${encodeURIComponent(name)}`
  const response = await rateLimitedFetch(url)
  const data = await handleResponse<ScryfallCard>(response)

  setCache(cacheKey, data)
  return data
}
