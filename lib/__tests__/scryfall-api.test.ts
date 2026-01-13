import {
  autocomplete,
  searchCards,
  getCardByName,
  clearCache,
  getCardRulings,
} from '../scryfall-api'
import {
  ScryfallAutocompleteResponse,
  ScryfallSearchResponse,
  ScryfallCard,
  ScryfallError,
  ScryfallRulingsResponse,
} from '@/types/scryfall'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch as jest.MockedFunction<typeof fetch>

describe('scryfall-api', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    clearCache() // Clear cache between tests
  })

  describe('autocomplete', () => {
    it('should fetch autocomplete suggestions', async () => {
      const mockResponse: ScryfallAutocompleteResponse = {
        object: 'catalog',
        total_values: 3,
        data: ['Lightning Bolt', 'Lightning Strike', 'Lightning Helix'],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await autocomplete('lightning')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.scryfall.com/cards/autocomplete?q=lightning'
      )
      expect(result).toEqual(['Lightning Bolt', 'Lightning Strike', 'Lightning Helix'])
    })

    it('should cache autocomplete results', async () => {
      const mockResponse: ScryfallAutocompleteResponse = {
        object: 'catalog',
        total_values: 1,
        data: ['Sol Ring'],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      // First call
      await autocomplete('sol')
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Second call should use cache
      const result = await autocomplete('sol')
      expect(mockFetch).toHaveBeenCalledTimes(1) // Still 1
      expect(result).toEqual(['Sol Ring'])
    })

    it('should handle empty query', async () => {
      const result = await autocomplete('')
      expect(mockFetch).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })

    it('should handle API errors', async () => {
      const mockError: ScryfallError = {
        object: 'error',
        code: 'not_found',
        status: 404,
        details: 'Not found',
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => mockError,
      } as Response)

      await expect(autocomplete('invalid')).rejects.toThrow('Not found')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(autocomplete('test')).rejects.toThrow('Network error')
    })
  })

  describe('searchCards', () => {
    it('should search for cards', async () => {
      const mockCard: ScryfallCard = {
        object: 'card',
        id: '123',
        name: 'Lightning Bolt',
        lang: 'en',
        released_at: '1993-08-05',
        uri: 'https://api.scryfall.com/cards/123',
        scryfall_uri: 'https://scryfall.com/card/123',
        layout: 'normal',
        highres_image: true,
        image_status: 'highres_scan',
        cmc: 1,
        type_line: 'Instant',
        oracle_text: 'Lightning Bolt deals 3 damage to any target.',
        mana_cost: '{R}',
        colors: ['R'],
        color_identity: ['R'],
        keywords: [],
        legalities: {
          standard: 'not_legal',
          modern: 'legal',
          commander: 'legal',
        },
        games: ['paper', 'mtgo'],
        reserved: false,
        foil: true,
        nonfoil: true,
        finishes: ['nonfoil', 'foil'],
        oversized: false,
        promo: false,
        reprint: true,
        variation: false,
        set_id: 'abc',
        set: 'lea',
        set_name: 'Limited Edition Alpha',
        set_type: 'core',
        set_uri: 'https://api.scryfall.com/sets/abc',
        set_search_uri: 'https://api.scryfall.com/cards/search?order=set&q=e%3Alea',
        scryfall_set_uri: 'https://scryfall.com/sets/lea',
        rulings_uri: 'https://api.scryfall.com/cards/123/rulings',
        prints_search_uri: 'https://api.scryfall.com/cards/search?order=released&q=lightning+bolt',
        collector_number: '1',
        digital: false,
        rarity: 'common',
        border_color: 'black',
        frame: '1993',
        full_art: false,
        textless: false,
        booster: true,
        story_spotlight: false,
        prices: {
          usd: '1.50',
          usd_foil: null,
          usd_etched: null,
          eur: null,
          eur_foil: null,
          tix: null,
        },
        related_uris: {},
        image_uris: {
          small: 'https://example.com/small.jpg',
          normal: 'https://example.com/normal.jpg',
          large: 'https://example.com/large.jpg',
          png: 'https://example.com/card.png',
          art_crop: 'https://example.com/art.jpg',
          border_crop: 'https://example.com/border.jpg',
        },
      }

      const mockResponse: ScryfallSearchResponse = {
        object: 'list',
        total_cards: 1,
        has_more: false,
        data: [mockCard],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await searchCards('lightning bolt')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.scryfall.com/cards/search?q=lightning%20bolt'
      )
      expect(result).toEqual(mockResponse)
    })

    it('should cache search results', async () => {
      const mockResponse: ScryfallSearchResponse = {
        object: 'list',
        total_cards: 0,
        has_more: false,
        data: [],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      // First call
      await searchCards('unique-query-1')
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Second call should use cache
      await searchCards('unique-query-1')
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should handle empty query', async () => {
      const result = await searchCards('')
      expect(mockFetch).not.toHaveBeenCalled()
      expect(result).toEqual({
        object: 'list',
        total_cards: 0,
        has_more: false,
        data: [],
      })
    })

    it('should handle API errors', async () => {
      const mockError: ScryfallError = {
        object: 'error',
        code: 'bad_request',
        status: 400,
        details: 'Invalid search query',
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      } as Response)

      await expect(searchCards('invalid syntax')).rejects.toThrow('Invalid search query')
    })
  })

  describe('getCardByName', () => {
    it('should fetch a card by exact name', async () => {
      const mockCard: ScryfallCard = {
        object: 'card',
        id: '123',
        name: 'Black Lotus',
        lang: 'en',
        released_at: '1993-08-05',
        uri: 'https://api.scryfall.com/cards/123',
        scryfall_uri: 'https://scryfall.com/card/123',
        layout: 'normal',
        highres_image: true,
        image_status: 'highres_scan',
        cmc: 0,
        type_line: 'Artifact',
        oracle_text: '{T}, Sacrifice Black Lotus: Add three mana of any one color.',
        colors: [],
        color_identity: [],
        keywords: [],
        legalities: {
          standard: 'not_legal',
          vintage: 'restricted',
          commander: 'banned',
        },
        games: ['paper'],
        reserved: true,
        foil: false,
        nonfoil: true,
        finishes: ['nonfoil'],
        oversized: false,
        promo: false,
        reprint: false,
        variation: false,
        set_id: 'abc',
        set: 'lea',
        set_name: 'Limited Edition Alpha',
        set_type: 'core',
        set_uri: 'https://api.scryfall.com/sets/abc',
        set_search_uri: 'https://api.scryfall.com/cards/search?order=set&q=e%3Alea',
        scryfall_set_uri: 'https://scryfall.com/sets/lea',
        rulings_uri: 'https://api.scryfall.com/cards/123/rulings',
        prints_search_uri: 'https://api.scryfall.com/cards/search?order=released&q=black+lotus',
        collector_number: '1',
        digital: false,
        rarity: 'rare',
        border_color: 'black',
        frame: '1993',
        full_art: false,
        textless: false,
        booster: true,
        story_spotlight: false,
        prices: {
          usd: '50000.00',
          usd_foil: null,
          usd_etched: null,
          eur: null,
          eur_foil: null,
          tix: null,
        },
        related_uris: {},
        image_uris: {
          small: 'https://example.com/small.jpg',
          normal: 'https://example.com/normal.jpg',
          large: 'https://example.com/large.jpg',
          png: 'https://example.com/card.png',
          art_crop: 'https://example.com/art.jpg',
          border_crop: 'https://example.com/border.jpg',
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCard,
      } as Response)

      const result = await getCardByName('Black Lotus')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.scryfall.com/cards/named?exact=Black%20Lotus'
      )
      expect(result).toEqual(mockCard)
    })

    it('should cache card results', async () => {
      const mockCard = {
        object: 'card',
        id: '123',
        name: 'Test Card XYZ',
      } as ScryfallCard

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCard,
      } as Response)

      // First call
      await getCardByName('Test Card XYZ')
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Second call should use cache
      await getCardByName('Test Card XYZ')
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should handle card not found', async () => {
      const mockError: ScryfallError = {
        object: 'error',
        code: 'not_found',
        status: 404,
        details: 'No card found',
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => mockError,
      } as Response)

      await expect(getCardByName('Nonexistent Card')).rejects.toThrow('No card found')
    })
  })

  describe('getCardRulings', () => {
    it('should fetch card rulings by url', async () => {
      const mockResponse: ScryfallRulingsResponse = {
        object: 'list',
        has_more: false,
        data: [
          {
            object: 'ruling',
            oracle_id: 'oracle-123',
            source: 'wotc',
            published_at: '2004-10-04',
            comment: 'Test ruling.',
          },
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await getCardRulings('https://api.scryfall.com/cards/123/rulings')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.scryfall.com/cards/123/rulings'
      )
      expect(result).toEqual(mockResponse)
    })

    it('should cache rulings results', async () => {
      const mockResponse: ScryfallRulingsResponse = {
        object: 'list',
        has_more: false,
        data: [],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      await getCardRulings('https://api.scryfall.com/cards/abc/rulings')
      expect(mockFetch).toHaveBeenCalledTimes(1)

      await getCardRulings('https://api.scryfall.com/cards/abc/rulings')
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('clearCache', () => {
    it('should clear all cached entries', async () => {
      const mockResponse: ScryfallAutocompleteResponse = {
        object: 'catalog',
        total_values: 1,
        data: ['Test'],
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      // Make a request to populate cache
      await autocomplete('cache-test')
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Verify cache works
      await autocomplete('cache-test')
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Clear cache
      clearCache()

      // Next request should fetch again
      await autocomplete('cache-test')
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })
})
