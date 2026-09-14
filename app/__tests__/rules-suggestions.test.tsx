import { fireEvent, render, screen } from '@testing-library/react'
import RulesPage from '../rules/page'
import { useCardSearch } from '@/hooks/useCardSearch'

jest.mock('@/hooks/useCardSearch')
let mockQuery = ''
jest.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(mockQuery) }))

test('selecting a card suggestion searches that exact card immediately', () => {
  const search = jest.fn().mockResolvedValue(undefined)
  ;(useCardSearch as jest.Mock).mockReturnValue({
    query: 'sol', results: [], suggestions: ['Sol Ring'], selectedCard: null,
    isLoading: false, isLoadingMore: false, hasMore: false, error: null,
    setQuery: jest.fn(), selectCard: jest.fn(), clearSelection: jest.fn(), search, loadMore: jest.fn(),
  })
  render(<RulesPage />)
  fireEvent.click(screen.getByRole('option', { name: 'Sol Ring' }))
  expect(search).toHaveBeenCalledWith('Sol Ring')
  expect(search).toHaveBeenCalledTimes(1)
})

test('a card-rulings link opens and searches the named card', () => {
  mockQuery = 'q=Sol%20Ring'
  const search = jest.fn().mockResolvedValue(undefined)
  ;(useCardSearch as jest.Mock).mockReturnValue({ query: '', suggestions: [], selectedCard: null, isLoading: false, error: null, setQuery: jest.fn(), search })
  render(<RulesPage />)
  expect(search).toHaveBeenCalledWith('Sol Ring')
  mockQuery = ''
})
