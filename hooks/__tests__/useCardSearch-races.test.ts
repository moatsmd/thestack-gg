import { act, cleanup, renderHook } from '@testing-library/react'
import { useCardSearch } from '../useCardSearch'
import { autocomplete, fetchSearchPage, searchCards } from '@/lib/scryfall-api'
import { ScryfallCard, ScryfallSearchResponse } from '@/types/scryfall'

jest.mock('@/lib/scryfall-api')
const searchApi = searchCards as jest.MockedFunction<typeof searchCards>
const autocompleteApi = autocomplete as jest.MockedFunction<typeof autocomplete>
const pageApi = fetchSearchPage as jest.MockedFunction<typeof fetchSearchPage>
const card = (name: string) => ({ id: name, name } as ScryfallCard)
const page = (...names: string[]): ScryfallSearchResponse => ({ object: 'list', total_cards: names.length, has_more: false, data: names.map(card) })
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

describe('card search correctness under rapid input', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.useFakeTimers()
    autocompleteApi.mockResolvedValue([])
  })
  afterEach(() => {
    cleanup()
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('shows an exact name match before alphabetically earlier substring matches', async () => {
    searchApi.mockResolvedValue(page('Solemn Offering', 'Sol Ring'))
    const { result } = renderHook(() => useCardSearch())
    act(() => result.current.setQuery('  sol ring  '))
    await act(async () => result.current.search())
    expect(result.current.selectedCard?.name).toBe('Sol Ring')
    expect(result.current.results.map((item) => item.name)).toEqual(['Sol Ring', 'Solemn Offering'])
  })

  it('searches current input when submission happens in the same render batch', async () => {
    searchApi.mockResolvedValue(page('Sol Ring'))
    const { result } = renderHook(() => useCardSearch())
    await act(async () => {
      result.current.setQuery('Sol Ring')
      await result.current.search()
    })
    expect(searchApi).toHaveBeenCalledWith('Sol Ring')
    expect(result.current.selectedCard?.name).toBe('Sol Ring')
  })

  it('ignores an old search result that resolves after the newer search', async () => {
    const old = deferred<ScryfallSearchResponse>()
    searchApi.mockReturnValueOnce(old.promise).mockResolvedValueOnce(page('Sol Ring'))
    const { result } = renderHook(() => useCardSearch())
    act(() => result.current.setQuery('Solemn'))
    let pending!: Promise<void>
    act(() => { pending = result.current.search() })
    act(() => result.current.setQuery('Sol Ring'))
    await act(async () => result.current.search())
    await act(async () => { old.resolve(page('Solemn Offering')); await pending })
    expect(result.current.selectedCard?.name).toBe('Sol Ring')
    expect(result.current.results.map((item) => item.name)).toEqual(['Sol Ring'])
  })

  it('clears the old card immediately when a different query is entered', async () => {
    searchApi.mockResolvedValue(page('Solemn Offering'))
    const { result } = renderHook(() => useCardSearch())
    act(() => result.current.setQuery('Solemn'))
    await act(async () => result.current.search())
    act(() => result.current.setQuery('Sol Ring'))
    expect(result.current.selectedCard).toBeNull()
    expect(result.current.results).toEqual([])
  })

  it('does not reopen suggestions when pending autocomplete finishes after search', async () => {
    const old = deferred<string[]>()
    autocompleteApi.mockReturnValue(old.promise)
    searchApi.mockResolvedValue(page('Sol Ring'))
    const { result } = renderHook(() => useCardSearch())
    act(() => result.current.setQuery('Sol Ring'))
    act(() => jest.advanceTimersByTime(300))
    await act(async () => result.current.search())
    await act(async () => old.resolve(['Sol Ring']))
    expect(result.current.suggestions).toEqual([])
  })

  it('ignores autocomplete for an earlier query', async () => {
    const old = deferred<string[]>()
    autocompleteApi.mockReturnValueOnce(old.promise).mockResolvedValueOnce(['Sol Ring'])
    const { result } = renderHook(() => useCardSearch())
    act(() => result.current.setQuery('Solemn'))
    act(() => jest.advanceTimersByTime(300))
    act(() => result.current.setQuery('Sol Ring'))
    await act(async () => jest.advanceTimersByTime(300))
    await act(async () => old.resolve(['Solemn Offering']))
    expect(result.current.suggestions).toEqual(['Sol Ring'])
  })

  it('does not append an old result page into a different search', async () => {
    const old = deferred<ScryfallSearchResponse>()
    searchApi.mockResolvedValueOnce({ ...page('Solemn Offering'), has_more: true, next_page: 'https://api.scryfall.com/cards/search?page=2' }).mockResolvedValueOnce(page('Sol Ring'))
    pageApi.mockReturnValue(old.promise)
    const { result } = renderHook(() => useCardSearch())
    act(() => result.current.setQuery('Solemn'))
    await act(async () => result.current.search())
    let pending!: Promise<void>
    act(() => { pending = result.current.loadMore() })
    act(() => result.current.setQuery('Sol Ring'))
    await act(async () => result.current.search())
    await act(async () => { old.resolve(page('Solemn Simulacrum')); await pending })
    expect(result.current.results.map((item) => item.name)).toEqual(['Sol Ring'])
  })
})
