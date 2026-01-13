import { fetchWotCNews } from '../news-fetcher'

// Mock fetch
global.fetch = jest.fn()

// Mock DOMParser
const mockDOMParser = {
  parseFromString: jest.fn(),
}
global.DOMParser = jest.fn(() => mockDOMParser) as any

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('fetchWotCNews', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  it('fetches and parses RSS feed successfully', async () => {
    const mockRSS = `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <item>
            <title>Test News 1</title>
            <link>https://example.com/news1</link>
            <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
            <description>Test description 1</description>
            <category>Announcements</category>
          </item>
          <item>
            <title>Test News 2</title>
            <link>https://example.com/news2</link>
            <pubDate>Mon, 02 Jan 2024 12:00:00 GMT</pubDate>
          </item>
        </channel>
      </rss>`

    const mockXmlDoc = {
      querySelector: jest.fn((selector: string) => {
        if (selector === 'parsererror') return null
        return null
      }),
      querySelectorAll: jest.fn((selector: string) => {
        if (selector === 'item') {
          return [
            {
              querySelector: jest.fn((tag: string) => ({
                textContent:
                  tag === 'title'
                    ? 'Test News 1'
                    : tag === 'link'
                    ? 'https://example.com/news1'
                    : tag === 'pubDate'
                    ? 'Mon, 01 Jan 2024 12:00:00 GMT'
                    : tag === 'description'
                    ? 'Test description 1'
                    : tag === 'category'
                    ? 'Announcements'
                    : null,
              })),
            },
            {
              querySelector: jest.fn((tag: string) => ({
                textContent:
                  tag === 'title'
                    ? 'Test News 2'
                    : tag === 'link'
                    ? 'https://example.com/news2'
                    : tag === 'pubDate'
                    ? 'Mon, 02 Jan 2024 12:00:00 GMT'
                    : null,
              })),
            },
          ]
        }
        return []
      }),
    }

    mockDOMParser.parseFromString.mockReturnValue(mockXmlDoc)
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => mockRSS,
    })

    const items = await fetchWotCNews()

    expect(items).toHaveLength(2)
    expect(items[0].title).toBe('Test News 1')
    expect(items[0].link).toBe('https://example.com/news1')
    expect(items[1].title).toBe('Test News 2')
  })

  it('returns cached data when available and not expired', async () => {
    const cachedData = {
      items: [
        {
          title: 'Cached News',
          link: 'https://example.com/cached',
          pubDate: 'Mon, 01 Jan 2024 12:00:00 GMT',
        },
      ],
      fetchedAt: Date.now() - 30 * 60 * 1000, // 30 minutes ago (within 1 hour cache)
    }

    localStorageMock.setItem('mtg_news_cache', JSON.stringify(cachedData))

    const items = await fetchWotCNews()

    expect(items).toHaveLength(1)
    expect(items[0].title).toBe('Cached News')
    // Should not have called fetch
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('fetches fresh data when cache is expired', async () => {
    const cachedData = {
      items: [{ title: 'Old News', link: 'https://example.com/old', pubDate: 'Old Date' }],
      fetchedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago (expired)
    }

    localStorageMock.setItem('mtg_news_cache', JSON.stringify(cachedData))

    const mockRSS = `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <item>
            <title>Fresh News</title>
            <link>https://example.com/fresh</link>
            <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
          </item>
        </channel>
      </rss>`

    const mockXmlDoc = {
      querySelector: jest.fn(() => null),
      querySelectorAll: jest.fn((selector: string) => {
        if (selector === 'item') {
          return [
            {
              querySelector: jest.fn((tag: string) => ({
                textContent:
                  tag === 'title'
                    ? 'Fresh News'
                    : tag === 'link'
                    ? 'https://example.com/fresh'
                    : tag === 'pubDate'
                    ? 'Mon, 01 Jan 2024 12:00:00 GMT'
                    : null,
              })),
            },
          ]
        }
        return []
      }),
    }

    mockDOMParser.parseFromString.mockReturnValue(mockXmlDoc)
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => mockRSS,
    })

    const items = await fetchWotCNews()

    expect(items[0].title).toBe('Fresh News')
    expect(global.fetch).toHaveBeenCalled()
  })

  it('returns empty array on fetch error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    const items = await fetchWotCNews()

    expect(items).toEqual([])
  })

  it('returns max 5 items', async () => {
    const mockRSS = `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          ${Array.from({ length: 10 }, (_, i) => `
            <item>
              <title>News ${i + 1}</title>
              <link>https://example.com/news${i + 1}</link>
              <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
            </item>
          `).join('')}
        </channel>
      </rss>`

    const mockXmlDoc = {
      querySelector: jest.fn(() => null),
      querySelectorAll: jest.fn((selector: string) => {
        if (selector === 'item') {
          return Array.from({ length: 10 }, (_, i) => ({
            querySelector: jest.fn((tag: string) => ({
              textContent:
                tag === 'title'
                  ? `News ${i + 1}`
                  : tag === 'link'
                  ? `https://example.com/news${i + 1}`
                  : tag === 'pubDate'
                  ? 'Mon, 01 Jan 2024 12:00:00 GMT'
                  : null,
            })),
          }))
        }
        return []
      }),
    }

    mockDOMParser.parseFromString.mockReturnValue(mockXmlDoc)
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => mockRSS,
    })

    const items = await fetchWotCNews()

    expect(items).toHaveLength(5)
  })
})
