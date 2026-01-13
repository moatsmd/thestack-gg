import { renderHook, waitFor } from '@testing-library/react'
import { useCardRulings } from '../useCardRulings'
import * as scryfallApi from '@/lib/scryfall-api'
import { ScryfallCard, ScryfallRulingsResponse } from '@/types/scryfall'

jest.mock('@/lib/scryfall-api')

const mockGetCardRulings = scryfallApi.getCardRulings as jest.MockedFunction<
  typeof scryfallApi.getCardRulings
>

describe('useCardRulings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not fetch when card is null', () => {
    renderHook(() => useCardRulings(null))

    expect(mockGetCardRulings).not.toHaveBeenCalled()
  })

  it('fetches rulings for the selected card', async () => {
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

    mockGetCardRulings.mockResolvedValue(mockResponse)

    const card = {
      id: '123',
      name: 'Test Card',
      rulings_uri: 'https://api.scryfall.com/cards/123/rulings',
    } as ScryfallCard

    const { result } = renderHook(() => useCardRulings(card))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.rulings).toEqual(mockResponse.data)
  })
})
