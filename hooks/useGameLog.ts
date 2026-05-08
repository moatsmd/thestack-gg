'use client'

/**
 * useGameLog — append-only event recorder for the tracker.
 *
 * The tracker keeps its existing Player[] state shape exactly as it is. This
 * hook layers an append-only event log on top, so the visual tracker behaviour
 * is unchanged but we capture enough history to render a recap at end-game.
 *
 * Usage pattern in the tracker:
 *   const log = useGameLog()
 *   // when starting:           log.start({ format, startingLife, players })
 *   // on a life delta:         log.life(playerId, delta, lifeAfter)
 *   // on a poison delta:       log.poison(playerId, delta, poisonAfter)
 *   // on a cmd damage delta:   log.cmd(playerId, delta, cmdAfter)
 *   // on end-game:             log.end(winnerId?)
 *
 * The hook deliberately doesn't try to interpret state. It records events
 * in the order they happen. The recap page does all the analysis.
 */
import { useCallback, useRef, useState } from 'react'
import type {
  GameEvent,
  RecapPlayer,
} from '@/types/replay'

export type UseGameLog = {
  events: GameEvent[]
  /** True after start() has been called and end() has not. */
  isRecording: boolean
  /** True after end() has been called. */
  hasEnded: boolean
  start: (args: {
    format: string
    startingLife: number
    players: RecapPlayer[]
  }) => void
  life: (playerId: number, delta: number, lifeAfter: number) => void
  poison: (playerId: number, delta: number, poisonAfter: number) => void
  cmd: (
    playerId: number,
    delta: number,
    cmdAfter: number,
    sourcePlayerId?: number,
  ) => void
  end: (winnerId?: number) => void
  /** Wipe the log (used when the user resets the tracker). */
  reset: () => void
}

export function useGameLog(): UseGameLog {
  const [events, setEvents] = useState<GameEvent[]>([])
  const seqRef = useRef(0)
  const isRecordingRef = useRef(false)
  const hasEndedRef = useRef(false)

  const append = useCallback((make: (seq: number, timestamp: number) => GameEvent) => {
    const seq = seqRef.current++
    const timestamp = Date.now()
    const event = make(seq, timestamp)
    setEvents((prev) => [...prev, event])
  }, [])

  const start = useCallback<UseGameLog['start']>((args) => {
    seqRef.current = 0
    isRecordingRef.current = true
    hasEndedRef.current = false
    setEvents([
      {
        type: 'game_start',
        seq: 0,
        timestamp: Date.now(),
        format: args.format,
        startingLife: args.startingLife,
        players: args.players,
      },
    ])
    seqRef.current = 1
  }, [])

  const life = useCallback<UseGameLog['life']>((playerId, delta, lifeAfter) => {
    if (!isRecordingRef.current || hasEndedRef.current) return
    if (delta === 0) return
    append((seq, timestamp) => ({
      type: 'life_change',
      seq,
      timestamp,
      playerId,
      delta,
      lifeAfter,
    }))
  }, [append])

  const poison = useCallback<UseGameLog['poison']>((playerId, delta, poisonAfter) => {
    if (!isRecordingRef.current || hasEndedRef.current) return
    if (delta === 0) return
    append((seq, timestamp) => ({
      type: 'poison_change',
      seq,
      timestamp,
      playerId,
      delta,
      poisonAfter,
    }))
  }, [append])

  const cmd = useCallback<UseGameLog['cmd']>(
    (playerId, delta, cmdAfter, sourcePlayerId) => {
      if (!isRecordingRef.current || hasEndedRef.current) return
      if (delta === 0) return
      append((seq, timestamp) => ({
        type: 'commander_damage',
        seq,
        timestamp,
        playerId,
        delta,
        cmdAfter,
        sourcePlayerId,
      }))
    },
    [append],
  )

  const end = useCallback<UseGameLog['end']>((winnerId) => {
    if (!isRecordingRef.current || hasEndedRef.current) return
    hasEndedRef.current = true
    isRecordingRef.current = false
    append((seq, timestamp) => ({
      type: 'game_end',
      seq,
      timestamp,
      winnerId,
    }))
  }, [append])

  const reset = useCallback(() => {
    seqRef.current = 0
    isRecordingRef.current = false
    hasEndedRef.current = false
    setEvents([])
  }, [])

  return {
    events,
    isRecording: isRecordingRef.current,
    hasEnded: hasEndedRef.current,
    start,
    life,
    poison,
    cmd,
    end,
    reset,
  }
}
