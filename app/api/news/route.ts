import { NextResponse } from 'next/server'

const CARD_KINGDOM_RSS_URL = 'https://blog.cardkingdom.com/feed/'
const CACHE_DURATION = 60 * 60 // 1 hour in seconds

export interface NewsItem {
  title: string
  link: string
  pubDate: string
  description?: string
  category?: string
}

// In-memory cache
let cachedNews: NewsItem[] | null = null
let cachedAt: number = 0

/**
 * API Route: GET /api/news
 * Fetches Card Kingdom blog RSS feed, parses it, and caches for 1 hour
 */
export async function GET() {
  try {
    // Check if cache is still valid
    const now = Date.now()
    const cacheAge = (now - cachedAt) / 1000

    if (cachedNews && cacheAge < CACHE_DURATION) {
      console.log(`[News API] Returning cached news (age: ${Math.floor(cacheAge / 60)}m)`)
      return NextResponse.json(
        { items: cachedNews, cached: true, cachedAt },
        {
          headers: {
            'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
          },
        }
      )
    }

    console.log('[News API] Fetching fresh news...')

    // Fetch RSS feed
    const response = await fetch(CARD_KINGDOM_RSS_URL, {
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status}`)
    }

    const xmlText = await response.text()
    console.log(`[News API] Downloaded ${xmlText.length} characters`)

    // Parse RSS XML
    const items = parseRSS(xmlText)
    console.log(`[News API] Parsed ${items.length} news items`)

    // Cache the results
    cachedNews = items
    cachedAt = now

    return NextResponse.json(
      { items, cached: false, cachedAt: now },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
        },
      }
    )
  } catch (error) {
    console.error('[News API] Error:', error)

    // If we have stale cached news, return them as fallback
    if (cachedNews) {
      console.log('[News API] Returning stale cached news as fallback')
      return NextResponse.json(
        { items: cachedNews, cached: true, cachedAt, stale: true },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch news', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Parse RSS XML into NewsItem array (server-side using regex)
 * Since we're on the server, we can use simpler parsing
 */
function parseRSS(xmlText: string): NewsItem[] {
  try {
    const items: NewsItem[] = []

    // Extract all <item> blocks
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    const itemMatches = xmlText.matchAll(itemRegex)

    for (const itemMatch of itemMatches) {
      const itemContent = itemMatch[1]

      // Extract fields using regex
      const title = extractTag(itemContent, 'title')
      const link = extractTag(itemContent, 'link')
      const pubDate = extractTag(itemContent, 'pubDate')
      const description = extractTag(itemContent, 'description')
      const category = extractTag(itemContent, 'category')

      if (title && link && pubDate) {
        items.push({
          title: decodeHtml(title.trim()),
          link: link.trim(),
          pubDate: pubDate.trim(),
          description: description ? decodeHtml(description.trim()) : undefined,
          category: category ? decodeHtml(category.trim()) : undefined,
        })
      }
    }

    // Return max 5 most recent items
    return items.slice(0, 5)
  } catch (error) {
    console.error('[News API] Error parsing RSS:', error)
    return []
  }
}

/**
 * Extract content from XML tag
 */
function extractTag(xml: string, tagName: string): string | null {
  const regex = new RegExp(`<${tagName}(?:[^>]*)>([\\s\\S]*?)<\\/${tagName}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1] : null
}

/**
 * Decode HTML entities
 */
function decodeHtml(html: string): string {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
}
