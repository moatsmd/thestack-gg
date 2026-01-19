import { useCallback, useEffect, useMemo, useState } from 'react'
import type { StackItem, StackItemInput, StackPlayer, StackState, ResolvedItem } from '@/types/stack'

const STORAGE_KEY = 'manadork-stack-state'

type SerializedStackItem = Omit<StackItem, 'addedAt'> & { addedAt: string }
type SerializedResolvedItem = Omit<ResolvedItem, 'addedAt' | 'resolvedAt'> & { addedAt: string; resolvedAt: string }
type SerializedStackState = Omit<StackState, 'items' | 'resolved'> & {
  items: SerializedStackItem[]
  resolved: SerializedResolvedItem[]
}

const createDefaultPlayers = (): StackPlayer[] => ([
  { id: 'player-1', name: 'Player 1' },
  { id: 'player-2', name: 'Player 2' },
])

const createDefaultState = (): StackState => {
  const players = createDefaultPlayers()
  return {
    items: [],
    resolved: [],
    players,
    priorityPlayerId: players[0]?.id ?? '',
  }
}

const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `stack-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const serializeState = (state: StackState): SerializedStackState => ({
  ...state,
  items: state.items.map((item) => ({
    ...item,
    addedAt: item.addedAt.toISOString(),
  })),
  resolved: state.resolved.map((item) => ({
    ...item,
    addedAt: item.addedAt.toISOString(),
    resolvedAt: item.resolvedAt.toISOString(),
  })),
})

const deserializeState = (raw: string): StackState | null => {
  try {
    const parsed = JSON.parse(raw) as SerializedStackState
    if (!parsed || !Array.isArray(parsed.items) || !Array.isArray(parsed.players)) {
      return null
    }

    return {
      ...parsed,
      items: parsed.items.map((item) => ({
        ...item,
        addedAt: new Date(item.addedAt),
      })),
      resolved: parsed.resolved.map((item) => ({
        ...item,
        addedAt: new Date(item.addedAt),
        resolvedAt: new Date(item.resolvedAt),
      })),
    }
  } catch (error) {
    console.error('Failed to parse stack state:', error)
    return null
  }
}

export interface UseStackResult {
  state: StackState
  addItem: (item: StackItemInput) => void
  resolveTop: () => void
  passPriority: () => void
  clearStack: () => void
  resetStack: () => void
  addPlayer: (name: string) => void
  removePlayer: (id: string) => void
  updatePlayerName: (id: string, name: string) => void
  setPriorityPlayerId: (id: string) => void
}

export function useStack(): UseStackResult {
  const [state, setState] = useState<StackState>(() => {
    if (typeof window === 'undefined') {
      return createDefaultState()
    }

    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return createDefaultState()
    }

    return deserializeState(stored) ?? createDefaultState()
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState(state)))
  }, [state])

  const playersById = useMemo(() => {
    return new Map(state.players.map((player) => [player.id, player]))
  }, [state.players])

  const addItem = useCallback((item: StackItemInput) => {
    setState((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          ...item,
          id: createId(),
          addedAt: new Date(),
        },
      ],
    }))
  }, [])

  const resolveTop = useCallback(() => {
    setState((prev) => {
      if (prev.items.length === 0) {
        return prev
      }

      const items = [...prev.items]
      const top = items.pop()
      if (!top) {
        return prev
      }

      const resolvedItem: ResolvedItem = {
        ...top,
        resolvedAt: new Date(),
      }

      return {
        ...prev,
        items,
        resolved: [resolvedItem, ...prev.resolved],
      }
    })
  }, [])

  const passPriority = useCallback(() => {
    setState((prev) => {
      if (prev.players.length <= 1) {
        return prev
      }

      const currentIndex = prev.players.findIndex((player) => player.id === prev.priorityPlayerId)
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % prev.players.length

      return {
        ...prev,
        priorityPlayerId: prev.players[nextIndex]?.id ?? '',
      }
    })
  }, [])

  const clearStack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      items: [],
      resolved: [],
    }))
  }, [])

  const resetStack = useCallback(() => {
    setState(createDefaultState())
  }, [])

  const addPlayer = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) {
      return
    }

    setState((prev) => {
      const nextPlayer: StackPlayer = {
        id: createId(),
        name: trimmed,
      }
      const players = [...prev.players, nextPlayer]

      return {
        ...prev,
        players,
        priorityPlayerId: prev.priorityPlayerId || nextPlayer.id,
      }
    })
  }, [])

  const removePlayer = useCallback((id: string) => {
    setState((prev) => {
      const players = prev.players.filter((player) => player.id !== id)
      const priorityPlayerId =
        prev.priorityPlayerId === id ? players[0]?.id ?? '' : prev.priorityPlayerId

      return {
        ...prev,
        players,
        priorityPlayerId,
      }
    })
  }, [])

  const updatePlayerName = useCallback((id: string, name: string) => {
    setState((prev) => ({
      ...prev,
      players: prev.players.map((player) =>
        player.id === id ? { ...player, name } : player
      ),
    }))
  }, [])

  const setPriorityPlayerId = useCallback((id: string) => {
    if (!playersById.has(id)) {
      return
    }

    setState((prev) => ({
      ...prev,
      priorityPlayerId: id,
    }))
  }, [playersById])

  return {
    state,
    addItem,
    resolveTop,
    passPriority,
    clearStack,
    resetStack,
    addPlayer,
    removePlayer,
    updatePlayerName,
    setPriorityPlayerId,
  }
}
