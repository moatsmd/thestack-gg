'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { DiceTray } from './Die3D'
import { GoldRule } from './Fleuron'
import { createRollOff, DICE, DICE_ROLL_MS, parsePlayerNames, rollDie, rollOffRound } from '@/lib/dice-rolloff'
import type { DieResult, DieType, RollEntry, RollOffState } from '@/lib/dice-rolloff'

const STORAGE_KEY = 'thestack-dice-v2'
const DEFAULT_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4']
const COLOR_DOTS = ['#61cbb9', '#8da9e2', '#dd94aa', '#b89cdb', '#d5b36a', '#83be96', '#9bbccc', '#c9b089']

function DieSvg({ sides }: { sides: DieType }) {
  const shapes: Record<DieType, React.ReactNode> = {
    4: <polygon points="12,2 22,20 2,20" />,
    6: <rect x="3" y="3" width="18" height="18" rx="2" />,
    8: <polygon points="12,2 22,12 12,22 2,12" />,
    10: <polygon points="12,2 21,8 18,19 6,19 3,8" />,
    12: <polygon points="12,2 19,5 22,12 19,19 12,22 5,19 2,12 5,5" />,
    20: <><polygon points="12,2 22,8 22,16 12,22 2,16 2,8" /><path d="M12 2 7 15 22 8M7 15l5 7 5-7L2 8M7 15h10" /></>,
    100: <><circle cx="10" cy="10" r="7" /><path d="M16 8a7 7 0 1 1-8 8" /></>,
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.4}>{shapes[sides]}</svg>
}

function validResult(value: unknown): value is DieResult {
  if (!value || typeof value !== 'object') return false
  const item = value as DieResult
  return DICE.includes(item.die) && Number.isInteger(item.result) && item.result >= 1 && item.result <= item.die
}

function validRollOff(value: unknown): value is RollOffState {
  if (!value || typeof value !== 'object') return false
  const state = value as RollOffState
  if (!parsePlayerNames(JSON.stringify(state.names)) || !Array.isArray(state.rounds) || state.rounds.length > 100 || !Array.isArray(state.contenders)) return false
  const validIndex = (index: unknown) => Number.isInteger(index) && Number(index) >= 0 && Number(index) < state.names.length
  if (!(state.winner === null || validIndex(state.winner)) || !state.contenders.length || !state.contenders.every(validIndex)) return false
  let replayed = createRollOff(state.names)
  for (const round of state.rounds) {
    if (!round || !Array.isArray(round.rolls) || !Array.isArray(round.leaders) || !round.leaders.length || replayed.winner !== null || round.rolls.length !== replayed.contenders.length) return false
    if (!round.rolls.every((roll, index) => roll && roll.player === replayed.contenders[index] && Number.isInteger(roll.value) && roll.value >= 1 && roll.value <= 20)) return false
    let index = 0
    replayed = rollOffRound(replayed, () => (round.rolls[index++].value - 0.5) / 20)
    if (JSON.stringify(round.leaders) !== JSON.stringify(replayed.contenders)) return false
  }
  return state.winner === replayed.winner && JSON.stringify(state.contenders) === JSON.stringify(replayed.contenders)
}

export function DiceRoller() {
  const [mode, setMode] = useState<'dice' | 'first'>('dice')
  const [results, setResults] = useState<DieResult[]>([])
  const [history, setHistory] = useState<RollEntry[]>([])
  const [queue, setQueue] = useState<DieType[]>([])
  const [poolMode, setPoolMode] = useState(false)
  const [rolloff, setRolloff] = useState<RollOffState>(() => createRollOff(DEFAULT_NAMES))
  const [isRolling, setIsRolling] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [rollId, setRollId] = useState(0)
  const [hydrated, setHydrated] = useState(false)
  const rollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rollingRef = useRef(false)
  const trayRef = useRef<HTMLElement>(null)
  const entrySequenceRef = useRef(0)

  useEffect(() => {
    let restored: RollOffState | null = null
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
      if (saved && typeof saved === 'object') {
        if (Array.isArray(saved.results) && saved.results.length <= 8 && saved.results.every(validResult)) setResults(saved.results)
        if (Array.isArray(saved.history)) setHistory(saved.history.filter((entry: unknown) => validResult(entry) && typeof (entry as RollEntry).id === 'string' && Number.isFinite((entry as RollEntry).timestamp) && (entry as RollEntry).timestamp >= 0 && (entry as RollEntry).timestamp <= Date.now() + 86400000).slice(0, 10))
        if (saved.mode === 'first') setMode('first')
        if (validRollOff(saved.rolloff)) { restored = saved.rolloff; setRolloff(saved.rolloff) }
      }
    } catch { /* Private mode or corrupt saved state: keep the usable defaults. */ }
    const names = parsePlayerNames(new URL(window.location.href).searchParams.get('players'))
    if (names) {
      setMode('first')
      if (!restored || JSON.stringify(names) !== JSON.stringify(restored.names)) setRolloff(createRollOff(names))
    }
    const media = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
    const updateMotion = () => setReducedMotion(media?.matches ?? true)
    updateMotion()
    media?.addEventListener?.('change', updateMotion)
    setHydrated(true)
    return () => { media?.removeEventListener?.('change', updateMotion); if (rollTimerRef.current) clearTimeout(rollTimerRef.current) }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, results, history, rolloff })) } catch { /* Rolling continues when storage is unavailable. */ }
  }, [hydrated, mode, results, history, rolloff])

  const beginMotion = () => {
    setRollId((id) => id + 1)
    const shouldAnimate = typeof window.matchMedia === 'function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // On phones the controls sit below the tray. Bring the throw into view
    // when the player rolls so the animation and its result are visible.
    trayRef.current?.scrollIntoView?.({ block: 'start', behavior: shouldAnimate ? 'smooth' : 'auto' })
    if (!shouldAnimate) return
    rollingRef.current = true
    setIsRolling(true)
    if (rollTimerRef.current) clearTimeout(rollTimerRef.current)
    rollTimerRef.current = setTimeout(() => { rollingRef.current = false; setIsRolling(false) }, DICE_ROLL_MS)
  }

  const commitRoll = (nextResults: DieResult[]) => {
    if (rollingRef.current || nextResults.length === 0) return
    const timestamp = Date.now()
    const entries = nextResults.map((result) => {
      let id: string
      try { id = crypto.randomUUID() } catch { id = `${timestamp}-${++entrySequenceRef.current}` }
      return { ...result, id, timestamp }
    })
    setResults(nextResults)
    setHistory((previous) => [...entries, ...previous].slice(0, 10))
    setQueue([])
    beginMotion()
  }
  const queueDie = (die: DieType) => { if (!rollingRef.current) setQueue((previous) => previous.length < 8 ? [...previous, die] : previous) }
  const handleDie = (die: DieType) => { if (poolMode) queueDie(die); else if (!rollingRef.current) commitRoll([{ die, result: rollDie(die) }]) }
  const rollForFirst = () => {
    if (rollingRef.current || rolloff.winner !== null) return
    setRolloff(rollOffRound(rolloff.rounds.length ? rolloff : createRollOff(rolloff.names)))
    beginMotion()
  }
  const editName = (index: number, name: string) => setRolloff((previous) => ({ ...createRollOff(previous.names), names: previous.names.map((old, i) => i === index ? name : old) }))
  const changePlayerCount = (amount: number) => setRolloff((previous) => createRollOff(amount > 0 ? [...previous.names, `Player ${previous.names.length + 1}`] : previous.names.slice(0, -1)))
  const latestRound = rolloff.rounds[rolloff.rounds.length - 1]
  const total = results.reduce((sum, result) => sum + result.result, 0)
  const queueCounts = queue.reduce<Partial<Record<DieType, number>>>((counts, die) => ({ ...counts, [die]: (counts[die] || 0) + 1 }), {})
  const trayDice = useMemo<DieResult[]>(() => mode === 'first' ? (latestRound ? latestRound.rolls.map((roll) => ({ die: 20, result: roll.value, colorIndex: roll.player })) : [{ die: 20, result: 20 }]) : results.length ? results : [{ die: 20, result: 20 }], [mode, latestRound, results])
  const tiedNames = rolloff.contenders.map((index) => rolloff.names[index]).join(' and ')
  const announcement = isRolling ? 'Dice are rolling…' : mode === 'first' ? rolloff.winner !== null ? `${rolloff.names[rolloff.winner]} goes first` : latestRound ? `${tiedNames} are tied. Reroll the leaders.` : 'Everyone rolls a d20. Highest roll goes first.' : results.length ? `Rolled ${results.map(({ die, result }) => `d${die}: ${result}`).join(', ')}${results.length > 1 ? `. Total ${total}.` : ''}` : 'Choose a die to begin.'
  const primaryButton = 'w-full min-h-12 px-5 py-3 bg-[hsl(42_75%_62%)] text-[#16140e] font-display font-semibold tracking-wide hover:bg-[hsl(42_80%_71%)] disabled:opacity-50 disabled:cursor-wait transition rounded-md'

  return (
    <div className="min-h-screen text-[hsl(38_30%_88%)]">
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-7 md:pt-12 pb-8 space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div><GoldRule /><p className="font-display tracking-[0.22em] uppercase text-[10px] text-[hsl(42_55%_65%)] mt-3">Cast the bones</p><h1 className="font-display text-gold-gradient text-4xl md:text-5xl mt-2">The rolling table.</h1><p className="font-prose text-lg text-[hsl(38_20%_75%)] mt-2">A little chance. A proper entrance.</p></div>
          <Link href="/tracker" className="text-sm text-[hsl(42_75%_65%)] underline underline-offset-4">Back to your game →</Link>
        </header>
        <div className="inline-flex p-1 gap-1 border border-amber-200/15 bg-black/20 rounded-md" aria-label="Dice mode">
          <button type="button" onClick={() => setMode('dice')} disabled={isRolling} aria-pressed={mode === 'dice'} className={`min-h-11 px-4 sm:px-6 text-sm font-display rounded ${mode === 'dice' ? 'bg-amber-100/10 text-amber-100' : 'text-[var(--muted)]'}`}>Free roll</button>
          <button type="button" onClick={() => setMode('first')} disabled={isRolling} aria-pressed={mode === 'first'} className={`min-h-11 px-4 sm:px-6 text-sm font-display rounded ${mode === 'first' ? 'bg-amber-100/10 text-amber-100' : 'text-[var(--muted)]'}`}>Who goes first?</button>
        </div>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-5 items-start">
          <section ref={trayRef} className="panel codex-glow overflow-hidden border-amber-200/20 scroll-mt-20">
            <DiceTray dice={trayDice} rolling={isRolling} rollId={rollId} reducedMotion={reducedMotion} />
            <div className="relative px-5 py-5 min-h-28 border-t border-amber-100/10 bg-[linear-gradient(110deg,#182422,#14191c)]">
              <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{announcement}</div>
              {mode === 'dice' ? (
                <div aria-hidden="true" className="flex items-center justify-between gap-4">
                  <div><p className="text-[10px] font-display uppercase tracking-[0.2em] text-amber-100/50">{results.length > 1 ? 'Combined total' : results.length ? `d${results[0].die} result` : 'The table is yours'}</p><p className="font-prose text-lg text-amber-50/70 mt-1">{isRolling ? 'Let the dice settle…' : results.length > 1 ? results.map(({ die, result }) => `d${die}: ${result}`).join(' · ') : results[0]?.die === 100 ? 'Percentile dice · 00 + 0 means 100' : 'Choose a die to cast again.'}</p></div>
                  <span data-testid="roll-result" className="font-display text-5xl md:text-6xl tabular-nums text-amber-100">{isRolling ? '…' : results.length ? total : '—'}</span>
                </div>
              ) : (
                <div aria-hidden="true"><p className="text-[10px] font-display uppercase tracking-[0.2em] text-amber-100/50">{latestRound ? `Round ${rolloff.rounds.length} ${isRolling ? 'in motion' : 'complete'}` : 'The first move'}</p><p className="font-display text-2xl text-amber-100 mt-2">{isRolling ? 'Fate is in motion…' : rolloff.winner !== null ? `${rolloff.names[rolloff.winner]} goes first.` : latestRound ? 'A tie at the top.' : 'Gather your pod.'}</p><p className="font-prose text-lg text-amber-50/70 mt-1">{!isRolling && latestRound && rolloff.winner === null ? `${tiedNames} roll again.` : 'One device. A d20 for every player.'}</p></div>
              )}
            </div>
          </section>
          <aside className="space-y-4">
            {mode === 'dice' ? <>
              <div className="panel p-4"><h2 className="font-display text-sm text-amber-100 mb-3">Choose your dice</h2><div className="grid grid-cols-4 gap-2">
                {DICE.map((die) => <button key={die} type="button" disabled={isRolling} onClick={() => handleDie(die)} onContextMenu={(event) => { event.preventDefault(); queueDie(die) }} title={`${poolMode ? 'Add' : 'Roll'} d${die}`} aria-label={`${poolMode ? 'Add' : 'Roll'} d${die}`} data-testid={`die-d${die}`} className="relative min-h-20 py-3 flex flex-col items-center justify-center gap-1.5 bg-amber-50/[0.035] border border-amber-100/10 hover:border-amber-100/40 hover:bg-amber-50/10 disabled:opacity-40 transition rounded-md text-amber-100/80"><DieSvg sides={die} /><span className="font-display text-[10px] tracking-wider">d{die}</span>{queueCounts[die] ? <span className="absolute top-0.5 right-1 text-[10px] text-amber-200">×{queueCounts[die]}</span> : null}</button>)}
              </div><button type="button" disabled={isRolling} onClick={() => setPoolMode(!poolMode)} aria-pressed={poolMode} className="mt-3 min-h-11 w-full border border-amber-100/15 text-sm text-amber-100/70 rounded-md">{poolMode ? 'Dice pool mode on' : 'Build a dice pool'}</button><p className="text-xs text-[var(--muted)] mt-2">{poolMode ? 'Tap to add dice. Up to 8 in one throw.' : 'Tap for one roll, or build a pool for a shared throw.'}</p></div>
              {queue.length > 0 && <div className="panel p-4 space-y-3"><p className="text-sm text-amber-100/75">{queue.map((die) => `d${die}`).join(' + ')}</p><button type="button" disabled={isRolling} onClick={() => commitRoll(queue.map((die) => ({ die, result: rollDie(die) })))} className={primaryButton} data-testid="roll-queue">Roll {queue.length} {queue.length === 1 ? 'die' : 'dice'}</button><button type="button" onClick={() => setQueue([])} className="w-full min-h-11 text-sm text-[var(--muted)]">Clear queue</button></div>}
            </> : <div className="panel p-5 space-y-4">
              <div><h2 className="font-display text-xl text-amber-100">Highest d20 starts.</h2><p className="font-prose text-base text-amber-50/65 mt-2">Roll together on this device. Only players tied for the highest roll continue.</p></div>
              <details open={rolloff.rounds.length === 0} className="border-y border-amber-100/10 py-3"><summary className="cursor-pointer min-h-8 text-sm text-amber-100/80">{rolloff.names.length} players at the table</summary><div className="space-y-2 mt-2">
                {rolloff.names.map((name, index) => <label key={index} className="flex items-center gap-2"><span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLOR_DOTS[index] }} /><input aria-label={`Player ${index + 1} name`} value={name} maxLength={32} disabled={isRolling || rolloff.rounds.length > 0} onChange={(event) => editName(index, event.target.value)} className="w-full min-w-0 px-3 py-2 bg-black/15 border border-amber-100/15 rounded-md text-sm disabled:opacity-60" /></label>)}
                {rolloff.rounds.length === 0 && <div className="flex gap-2"><button type="button" disabled={rolloff.names.length <= 2} onClick={() => changePlayerCount(-1)} className="flex-1 min-h-11 border border-amber-100/15 rounded-md text-sm disabled:opacity-30">− Player</button><button type="button" disabled={rolloff.names.length >= 8} onClick={() => changePlayerCount(1)} className="flex-1 min-h-11 border border-amber-100/15 rounded-md text-sm disabled:opacity-30">+ Player</button></div>}
              </div></details>
              {rolloff.winner === null ? <button type="button" disabled={isRolling} onClick={rollForFirst} className={primaryButton}>{isRolling ? 'Rolling…' : latestRound ? `Reroll ${rolloff.contenders.length} tied players` : 'Roll all d20s'}</button> : <Link href="/tracker" className={`${primaryButton} block text-center`}>Back to the game →</Link>}
              {latestRound && <button type="button" disabled={isRolling} onClick={() => setRolloff(createRollOff(rolloff.names))} className="w-full min-h-11 text-sm text-amber-100/65">New roll-off</button>}
            </div>}
          </aside>
        </div>
        {mode === 'first' && latestRound && !isRolling && <section className="panel p-5 md:p-6"><h2 className="font-display text-lg text-amber-100 mb-4">The table&apos;s record</h2><div className="space-y-5">{rolloff.rounds.map((round, roundIndex) => <div key={roundIndex}><h3 className="text-[10px] font-display uppercase tracking-[0.2em] text-amber-100/50 mb-2">Round {roundIndex + 1}</h3><div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{round.rolls.map((roll) => <div key={roll.player} className={`flex items-center justify-between gap-3 px-3 py-3 border rounded-md ${round.leaders.includes(roll.player) ? 'border-amber-200/35 bg-amber-100/[0.06]' : 'border-amber-100/10'}`}><span className="flex items-center gap-2 min-w-0 text-sm"><span className="w-2 h-2 shrink-0 rounded-full" style={{ background: COLOR_DOTS[roll.player] }} /><span className="truncate">{rolloff.names[roll.player]}</span></span><span className="font-display text-2xl text-amber-100 tabular-nums">{roll.value}</span></div>)}</div></div>)}</div><p className="text-xs text-[var(--muted)] mt-4">This roll-off is saved on this device.</p></section>}
        {mode === 'dice' && !isRolling && history.length > 0 && <section className="panel p-5"><div className="flex items-center justify-between gap-3 mb-2"><h2 className="font-display tracking-[0.18em] uppercase text-[10px] text-amber-100/60">Recent rolls</h2><button type="button" disabled={isRolling} onClick={() => setHistory([])} className="text-xs min-h-11 px-2 text-[var(--muted)]">Clear history</button></div><ul className="grid sm:grid-cols-2 gap-x-8">{history.map((entry) => <li key={entry.id} data-testid="history-entry" className="py-2 border-t border-amber-100/10 flex items-center justify-between gap-4"><span className="font-display text-xs text-amber-100/60">d{entry.die}</span><span className="font-display text-xl text-amber-100 tabular-nums">{entry.result}</span><time className="text-xs text-[var(--muted)]" dateTime={new Date(entry.timestamp).toISOString()}>{new Date(entry.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time></li>)}</ul><p className="text-xs text-[var(--muted)] mt-3">Last 10 rolls · saved on this device</p></section>}
      </div>
    </div>
  )
}
