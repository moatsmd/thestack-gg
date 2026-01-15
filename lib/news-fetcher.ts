export interface NewsItem {
  title: string
  link: string
  pubDate: string
  description?: string
  category?: string
  imageUrl?: string
}

export interface NewsFeed {
  items: NewsItem[]
  fetchedAt: number
}

const CARD_KINGDOM_RSS_URL = 'https://blog.cardkingdom.com/feed/'
const CACHE_KEY = 'mtg_news_cache'
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

/**
 * Fetch and parse Card Kingdom blog RSS feed
 * Returns up to 5 most recent news items
 */
export async function fetchWotCNews(): Promise<NewsItem[]> {
  try {
    // Check cache first
    const cached = getFromCache()
    if (cached) {
      return cached.items
    }

    // Fetch fresh data
    const response = await fetch(CARD_KINGDOM_RSS_URL, {
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status}`)
    }

    const xmlText = await response.text()
    const items = parseRSS(xmlText)

    // Cache the results
    saveToCache({ items, fetchedAt: Date.now() })

    return items
  } catch (error) {
    console.error('Error fetching Card Kingdom news:', error)
    // Return cached data if available, even if expired
    const cached = getFromCache(true)
    return cached ? cached.items : []
  }
}

/**
 * Parse RSS XML into NewsItem array
 */
function parseRSS(xmlText: string): NewsItem[] {
  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror')
    if (parserError) {
      throw new Error('Failed to parse RSS XML')
    }

    // Extract items
    const itemElements = xmlDoc.querySelectorAll('item')
    const items: NewsItem[] = []

    itemElements.forEach((item) => {
      const title = item.querySelector('title')?.textContent
      const link = item.querySelector('link')?.textContent
      const pubDate = item.querySelector('pubDate')?.textContent
      const description = item.querySelector('description')?.textContent
      const category = item.querySelector('category')?.textContent

      if (title && link && pubDate) {
        // Extract image URL from description HTML
        const imageUrl = description ? extractImageUrl(description) : undefined

        items.push({
          title: title.trim(),
          link: link.trim(),
          pubDate: pubDate.trim(),
          description: description?.trim(),
          category: category?.trim(),
          imageUrl,
        })
      }
    })

    // Return max 5 most recent items
    return items.slice(0, 5)
  } catch (error) {
    console.error('Error parsing RSS:', error)
    return []
  }
}

/**
 * Extract image URL from description HTML
 * Prefers 300w size from srcset if available, falls back to src
 */
function extractImageUrl(html: string): string | undefined {
  // First try to get 300w version from srcset for better quality
  const srcsetMatch = html.match(/srcset="[^"]*?(https:\/\/[^\s"]+300w[^\s"]*\.jpg)\s+300w/)
  if (srcsetMatch) {
    return srcsetMatch[1]
  }

  // Fall back to src attribute from first img tag
  const srcMatch = html.match(/<img[^>]+src="(https:\/\/[^"]+)"/)
  if (srcMatch) {
    return srcMatch[1]
  }

  return undefined
}

/**
 * Get cached news from localStorage
 */
function getFromCache(ignoreExpiry = false): NewsFeed | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const feed: NewsFeed = JSON.parse(cached)
    const now = Date.now()
    const age = now - feed.fetchedAt

    // Return if not expired or if ignoring expiry
    if (ignoreExpiry || age < CACHE_DURATION) {
      return feed
    }

    // Expired, remove from cache
    localStorage.removeItem(CACHE_KEY)
    return null
  } catch (error) {
    console.error('Error reading news cache:', error)
    return null
  }
}

/**
 * Save news to localStorage cache
 */
function saveToCache(feed: NewsFeed): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(feed))
  } catch (error) {
    console.error('Error saving news to cache:', error)
  }
}
