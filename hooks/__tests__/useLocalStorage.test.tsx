import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '../useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return initial value when no stored value exists', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    expect(result.current[0]).toBe('initial')
  })

  it('should store and retrieve value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('new value')
    })

    expect(result.current[0]).toBe('new value')
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new value'))
  })

  it('should load existing value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored value'))

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    expect(result.current[0]).toBe('stored value')
  })

  it('should handle localStorage not available gracefully', () => {
    const mockGetItem = jest.spyOn(Storage.prototype, 'getItem')
    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGetItem.mockImplementation(() => {
      throw new Error('localStorage not available')
    })

    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'))

    expect(result.current[0]).toBe('fallback')
    expect(mockConsoleError).toHaveBeenCalled()

    mockConsoleError.mockRestore()
    mockGetItem.mockRestore()
  })
})
