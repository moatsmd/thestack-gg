import { renderHook, act, waitFor } from '@testing-library/react'
import { useCardSearch } from '../useCardSearch'
import * as scryfallApi from '@/lib/scryfall-api'
import { ScryfallCard, ScryfallSearchResponse } from '@/types/scryfall'

// Mock the scryfall API
jest.mock('@/lib/scryfall-api')

const mockAutocomplete = scryfallApi.autocomplete as jest.MockedFunction<typeof scryfallApi.autocomplete>
const mockSearchCards = scryfallApi.searchCards as jest.MockedFunction<typeof scryfallApi.searchCards>
const mockGetCardByName = scryfallApi.getCardByName as jest.MockedFunction<typeof scryfallApi.getCardByName>
const mockFetchSearchPage = scryfallApi.fetchSearchPage as jest.MockedFunction<typeof scryfallApi.fetchSearchPage>

describe('useCardSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useCardSearch())

      expect(result.current.query).toBe('')
      expect(result.current.results).toEqual([])
      expect(result.current.suggestions).toEqual([])
      expect(result.current.selectedCard).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('setQuery', () => {
    it('should update query', () => {
      const { result } = renderHook(() => useCardSearch())

      act(() => {
        result.current.setQuery('lightning bolt')
      })

      expect(result.current.query).toBe('lightning bolt')
    })

    it('should trigger debounced autocomplete', async () => {
      mockAutocomplete.mockResolvedValue(['Lightning Bolt', 'Lightning Strike'])

      const { result } = renderHook(() => useCardSearch())

      act(() => {
        result.current.setQuery('lightning')
      })

      // Autocomplete should not be called immediately
      expect(mockAutocomplete).not.toHaveBeenCalled()

      // Fast forward past debounce delay (300ms)
      act(() => {
        jest.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(mockAutocomplete).toHaveBeenCalledWith('lightning')
      })

      await waitFor(() => {
        expect(result.current.suggestions).toEqual(['Lightning Bolt', 'Lightning Strike'])
      })
    })

    it('should cancel previous autocomplete on rapid typing', async () => {
      mockAutocomplete.mockResolvedValue(['Test'])

      const { result } = renderHook(() => useCardSearch())

      act(() => {
        result.current.setQuery('l')
      })

      act(() => {
        jest.advanceTimersByTime(100)
      })

      act(() => {
        result.current.setQuery('li')
      })

      act(() => {
        jest.advanceTimersByTime(100)
      })

      act(() => {
        result.current.setQuery('lig')
      })

      act(() => {
        jest.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(mockAutocomplete).toHaveBeenCalledTimes(1)
        expect(mockAutocomplete).toHaveBeenCalledWith('lig')
      })
    })

    it('should not autocomplete for empty query', async () => {
      const { result } = renderHook(() => useCardSearch())

      act(() => {
        result.current.setQuery('test')
      })

      act(() => {
        result.current.setQuery('')
      })

      act(() => {
        jest.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(mockAutocomplete).not.toHaveBeenCalled()
        expect(result.current.suggestions).toEqual([])
      })
    })

    it('should clear error when query changes', () => {
      const { result } = renderHook(() => useCardSearch())

      // Set an error
      act(() => {
        result.current.setQuery('test')
      })

      mockSearchCards.mockRejectedValueOnce(new Error('Test error'))

      act(() => {
        result.current.search()
      })

      // Change query should clear error
      act(() => {
        result.current.setQuery('new query')
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('search', () => {
    it('should perform search and update results', async () => {
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
        colors: ['R'],
        color_identity: ['R'],
        keywords: [],
        legalities: { commander: 'legal' },
        games: ['paper'],
        reserved: false,
        foil: true,
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
        prices: {},
        related_uris: {},
      }

      const mockResponse: ScryfallSearchResponse = {
        object: 'list',
        total_cards: 1,
        has_more: false,
        data: [mockCard],
      }

      mockSearchCards.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useCardSearch())

      act(() => {
        result.current.setQuery('lightning bolt')
      })

      await act(async () => {
        await result.current.search()
      })

      expect(mockSearchCards).toHaveBeenCalledWith('lightning bolt')
      expect(result.current.results).toEqual([mockCard])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should set loading state during search', async () => {
      mockSearchCards.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))

      const { result } = renderHook(() => useCardSearch())

      act(() => {
        result.current.setQuery('test')
      })

      act(() => {
        result.current.search()
      })

      expect(result.current.isLoading).toBe(true)
    })

    it('should handle search errors', async () => {
      const errorMessage = 'Search failed'
      mockSearchCards.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useCardSearch())

      act(() => {
        result.current.setQuery('invalid query')
      })

      await act(async () => {
        await result.current.search()
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.results).toEqual([])
      expect(result.current.isLoading).toBe(false)
    })

    it('should not search with empty query', async () => {
      const { result } = renderHook(() => useCardSearch())

      await act(async () => {
        await result.current.search()
      })

      expect(mockSearchCards).not.toHaveBeenCalled()
      expect(result.current.results).toEqual([])
    })

    it('should clear previous results on new search', async () => {
      const mockCard1: ScryfallCard = {
        object: 'card',
        id: '1',
        name: 'Card 1',
      } as ScryfallCard

      const mockCard2: ScryfallCard = {
        object: 'card',
        id: '2',
        name: 'Card 2',
      } as ScryfallCard

      mockSearchCards
        .mockResolvedValueOnce({
          object: 'list',
          total_cards: 1,
          has_more: false,
          data: [mockCard1],
        })
        .mockResolvedValueOnce({
          object: 'list',
          total_cards: 1,
          has_more: false,
          data: [mockCard2],
        })

      const { result } = renderHook(() => useCardSearch())

      act(() => {
        result.current.setQuery('first')
      })

      await act(async () => {
        await result.current.search()
      })

      expect(result.current.results).toEqual([mockCard1])

      act(() => {
        result.current.setQuery('second')
      })

      await act(async () => {
        await result.current.search()
      })

      expect(result.current.results).toEqual([mockCard2])
    })
  })

  describe('selectCard', () => {
    it('should select a card', () => {
      const mockCard: ScryfallCard = {
        object: 'card',
        id: '123',
        name: 'Test Card',
      } as ScryfallCard

      const { result } = renderHook(() => useCardSearch())

      act(() => {
        result.current.selectCard(mockCard)
      })

      expect(result.current.selectedCard).toEqual(mockCard)
    })

    it('should clear suggestions when card is selected', () => {
      const mockCard: ScryfallCard = {
        object: 'card',
        id: '123',
        name: 'Test Card',
      } as ScryfallCard

      const { result } = renderHook(() => useCardSearch())

      act(() => {
        result.current.setQuery('test')
      })

      // Manually set suggestions
      act(() => {
        result.current.selectCard(mockCard)
      })

      expect(result.current.suggestions).toEqual([])
    })
  })

  describe('clearSelection', () => {
    it('should clear selected card', () => {
      const mockCard: ScryfallCard = {
        object: 'card',
        id: '123',
        name: 'Test Card',
      } as ScryfallCard

      const { result } = renderHook(() => useCardSearch())

      act(() => {
        result.current.selectCard(mockCard)
      })

      expect(result.current.selectedCard).toEqual(mockCard)

      act(() => {
        result.current.clearSelection()
      })

      expect(result.current.selectedCard).toBeNull()
    })
  })

  describe('autocomplete error handling', () => {
    it('should handle autocomplete errors gracefully', async () => {
      mockAutocomplete.mockRejectedValue(new Error('Autocomplete failed'))

      const { result } = renderHook(() => useCardSearch())

      act(() => {
        result.current.setQuery('test')
      })

      act(() => {
        jest.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(mockAutocomplete).toHaveBeenCalled()
      })

      // Should not crash and suggestions should be empty
      expect(result.current.suggestions).toEqual([])
    })
  })

  describe('pagination', () => {
    beforeEach(() => {
      mockAutocomplete.mockResolvedValue([])
    })

    it('loads more results when loadMore is called', async () => {
      // First page response
      const firstPageCards = [
        { id: '1', name: 'Card 1', type_line: 'Creature' } as any,
        { id: '2', name: 'Card 2', type_line: 'Creature' } as any,
      ]
      const secondPageCards = [
        { id: '3', name: 'Card 3', type_line: 'Creature' } as any,
      ]

      mockSearchCards.mockResolvedValueOnce({
        object: 'list',
        total_cards: 3,
        has_more: true,
        next_page: 'https://api.scryfall.com/cards/search?page=2',
        data: firstPageCards,
      })

      mockFetchSearchPage.mockResolvedValueOnce({
        object: 'list',
        total_cards: 3,
        has_more: false,
        data: secondPageCards,
      })

      const { result } = renderHook(() => useCardSearch())

      // Search initial query
      act(() => {
        result.current.setQuery('o:draw')
      })
      await act(async () => {
        await result.current.search()
      })

      await waitFor(() => {
        expect(result.current.results).toHaveLength(2)
        expect(result.current.hasMore).toBe(true)
      })

      // Load more results
      await act(async () => {
        await result.current.loadMore()
      })

      await waitFor(() => {
        expect(result.current.results).toHaveLength(3)
        expect(result.current.hasMore).toBe(false)
        expect(result.current.isLoadingMore).toBe(false)
      })
    })

    it('does not load more when hasMore is false', async () => {
      mockSearchCards.mockResolvedValue({
        object: 'list',
        total_cards: 1,
        has_more: false,
        data: [{ id: '1', name: 'Card 1' } as any],
      })

      const { result } = renderHook(() => useCardSearch())

      act(() => {
        result.current.setQuery('test')
      })
      await act(async () => {
        await result.current.search()
      })

      await waitFor(() => {
        expect(result.current.hasMore).toBe(false)
      })

      const initialCallCount = mockFetchSearchPage.mock.calls.length

      await act(async () => {
        await result.current.loadMore()
      })

      expect(mockFetchSearchPage.mock.calls.length).toBe(initialCallCount)
    })

    it('sets isLoadingMore to true while loading more results', async () => {
      const firstPageCards = [{ id: '1', name: 'Card 1' } as any]
      const secondPageCards = [{ id: '2', name: 'Card 2' } as any]

      let resolveSecondPage: (value: any) => void
      const secondPagePromise = new Promise(resolve => {
        resolveSecondPage = resolve
      })

      mockSearchCards.mockResolvedValueOnce({
        object: 'list',
        total_cards: 2,
        has_more: true,
        next_page: 'https://api.scryfall.com/cards/search?page=2',
        data: firstPageCards,
      })

      mockFetchSearchPage.mockReturnValueOnce(secondPagePromise as any)

      const { result } = renderHook(() => useCardSearch())

      act(() => {
        result.current.setQuery('test')
      })
      await act(async () => {
        await result.current.search()
      })

      // Start loading more
      act(() => {
        result.current.loadMore()
      })

      // Should be loading
      expect(result.current.isLoadingMore).toBe(true)

      // Resolve the second page
      await act(async () => {
        resolveSecondPage!({
          object: 'list',
          total_cards: 2,
          has_more: false,
          data: secondPageCards,
        })
        await secondPagePromise
      })

      await waitFor(() => {
        expect(result.current.isLoadingMore).toBe(false)
      })
    })

    it('appends new results to existing results', async () => {
      const firstPageCards = [
        { id: '1', name: 'Card 1' } as any,
        { id: '2', name: 'Card 2' } as any,
      ]
      const secondPageCards = [
        { id: '3', name: 'Card 3' } as any,
        { id: '4', name: 'Card 4' } as any,
      ]

      mockSearchCards.mockResolvedValueOnce({
        object: 'list',
        total_cards: 4,
        has_more: true,
        next_page: 'https://api.scryfall.com/cards/search?page=2',
        data: firstPageCards,
      })

      mockFetchSearchPage.mockResolvedValueOnce({
        object: 'list',
        total_cards: 4,
        has_more: false,
        data: secondPageCards,
      })

      const { result } = renderHook(() => useCardSearch())

      act(() => {
        result.current.setQuery('test')
      })
      await act(async () => {
        await result.current.search()
      })

      expect(result.current.results).toEqual(firstPageCards)

      await act(async () => {
        await result.current.loadMore()
      })

      await waitFor(() => {
        expect(result.current.results).toEqual([...firstPageCards, ...secondPageCards])
      })
    })

    it('handles loadMore errors gracefully', async () => {
      mockSearchCards.mockResolvedValueOnce({
        object: 'list',
        total_cards: 2,
        has_more: true,
        next_page: 'https://api.scryfall.com/cards/search?page=2',
        data: [{ id: '1', name: 'Card 1' } as any],
      })

      mockFetchSearchPage.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useCardSearch())

      act(() => {
        result.current.setQuery('test')
      })
      await act(async () => {
        await result.current.search()
      })

      await act(async () => {
        await result.current.loadMore()
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Network error')
        expect(result.current.isLoadingMore).toBe(false)
      })
    })
  })
})
