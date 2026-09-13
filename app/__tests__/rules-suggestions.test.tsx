import { fireEvent, render, screen } from '@testing-library/react'
import RulesPage from '../rules/page'
import { useCardSearch } from '@/hooks/useCardSearch'

jest.mock('@/hooks/useCardSearch')

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
