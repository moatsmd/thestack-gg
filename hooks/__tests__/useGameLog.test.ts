import { renderHook, act } from '@testing-library/react'
import { useGameLog } from '../useGameLog'

describe('useGameLog', () => {
  it('starts with an empty event log', () => {
    const { result } = renderHook(() => useGameLog())
    expect(result.current.events).toEqual([])
  })

  it('records a game_start event with monotonic seq', () => {
    const { result } = renderHook(() => useGameLog())
    act(() => {
      result.current.start({
        format: 'Commander 40',
        startingLife: 40,
        players: [
          { id: 1, name: 'A' },
          { id: 2, name: 'B' },
        ],
      })
    })
    expect(result.current.events).toHaveLength(1)
    expect(result.current.events[0].type).toBe('game_start')
    expect(result.current.events[0].seq).toBe(0)
  })

  it('appends life/poison/cmd events with increasing seq', () => {
    const { result } = renderHook(() => useGameLog())
    act(() => {
      result.current.start({
        format: 'Commander 40',
        startingLife: 40,
        players: [{ id: 1, name: 'A' }],
      })
    })
    act(() => {
      result.current.life(1, -3, 37)
      result.current.poison(1, 1, 1)
      result.current.cmd(1, 4, 4)
    })
    const seqs = result.current.events.map((e) => e.seq)
    expect(seqs).toEqual([0, 1, 2, 3])
    const types = result.current.events.map((e) => e.type)
    expect(types).toEqual([
      'game_start',
      'life_change',
      'poison_change',
      'commander_damage',
    ])
  })

  it('skips zero-delta events', () => {
    const { result } = renderHook(() => useGameLog())
    act(() => {
      result.current.start({
        format: 'Commander 40',
        startingLife: 40,
        players: [{ id: 1, name: 'A' }],
      })
    })
    act(() => {
      result.current.life(1, 0, 40)
      result.current.poison(1, 0, 0)
      result.current.cmd(1, 0, 0)
    })
    expect(result.current.events).toHaveLength(1)
  })

  it('drops events after end()', () => {
    const { result } = renderHook(() => useGameLog())
    act(() => {
      result.current.start({
        format: 'Commander 40',
        startingLife: 40,
        players: [{ id: 1, name: 'A' }],
      })
    })
    act(() => {
      result.current.end(1)
    })
    act(() => {
      result.current.life(1, -5, 35)
    })
    const types = result.current.events.map((e) => e.type)
    expect(types).toEqual(['game_start', 'game_end'])
  })

  it('drops events before start()', () => {
    const { result } = renderHook(() => useGameLog())
    act(() => {
      result.current.life(1, -5, 35)
    })
    expect(result.current.events).toEqual([])
  })

  it('reset() wipes the log', () => {
    const { result } = renderHook(() => useGameLog())
    act(() => {
      result.current.start({
        format: 'Commander 40',
        startingLife: 40,
        players: [{ id: 1, name: 'A' }],
      })
      result.current.life(1, -3, 37)
    })
    act(() => {
      result.current.reset()
    })
    expect(result.current.events).toEqual([])
  })

  it('start() after reset() begins a fresh seq=0', () => {
    const { result } = renderHook(() => useGameLog())
    act(() => {
      result.current.start({
        format: 'Commander 40',
        startingLife: 40,
        players: [{ id: 1, name: 'A' }],
      })
      result.current.life(1, -3, 37)
    })
    act(() => {
      result.current.reset()
    })
    act(() => {
      result.current.start({
        format: 'Commander 40',
        startingLife: 40,
        players: [{ id: 1, name: 'A' }],
      })
    })
    expect(result.current.events).toHaveLength(1)
    expect(result.current.events[0].seq).toBe(0)
  })
})
