import { act, renderHook } from '@testing-library/react'
import { useTokenTray } from '../useTokenTray'

beforeEach(() => localStorage.clear())

test('keeps quantities through remount and supports undoing a clear', () => {
  const first = renderHook(() => useTokenTray())
  act(() => { first.result.current.change('Treasure', 1); first.result.current.change('Treasure', 1) })
  expect(first.result.current.counts.Treasure).toBe(2)
  first.unmount()
  const second = renderHook(() => useTokenTray())
  expect(second.result.current.counts.Treasure).toBe(2)
  act(() => second.result.current.clear())
  expect(second.result.current.counts).toEqual({})
  act(() => second.result.current.undoClear())
  expect(second.result.current.counts.Treasure).toBe(2)
})

test('bounds quantities and rejects unknown or corrupted stored entries', () => {
  localStorage.setItem('thestack-token-tray-v1', JSON.stringify({ version: 1, counts: { Treasure: -2, Clue: 1.5, Unknown: 4, Food: 3 } }))
  const { result } = renderHook(() => useTokenTray())
  expect(result.current.counts).toEqual({ Food: 3 })
  act(() => { result.current.change('Unknown', 1); result.current.change('Treasure', -1); result.current.change('Food', 10000) })
  expect(result.current.counts).toEqual({ Food: 999 })
})

test('remains usable when browser storage is unavailable', () => {
  const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
  const { result } = renderHook(() => useTokenTray())
  act(() => result.current.change('Treasure', 1))
  expect(result.current.counts.Treasure).toBe(1)
  expect(result.current.storageError).toBe(true)
  spy.mockRestore()
})
