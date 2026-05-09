'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import QRCode from 'qrcode'
import { GoldRule } from '@/components/Fleuron'
import { track } from '@/lib/analytics'
import { YourPods } from '@/components/YourPods'
import { useGameLog, type UseGameLog } from '@/hooks/useGameLog'
import { useSync, type UseSyncResult } from '@/lib/use-sync'
import type { RecapPlayer } from '@/types/replay'

/* ────────────────────────────────────────────────────────────
 * Inline SVG icons (lucide-react is not installed in prod).
 * These mirror the line-weight + 24px viewBox of the source.
 * ──────────────────────────────────────────────────────────── */
type IconProps = { className?: string; strokeWidth?: number }

const Icon = ({
  children,
  className = '',
  strokeWidth = 2,
}: IconProps & { children: React.ReactNode }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
)

const Plus = (p: IconProps) => (
  <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>
)
const Minus = (p: IconProps) => (
  <Icon {...p}><path d="M5 12h14" /></Icon>
)
const RotateCcw = (p: IconProps) => (
  <Icon {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></Icon>
)
const Share2 = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
  </Icon>
)
const X = (p: IconProps) => (
  <Icon {...p}><path d="M18 6 6 18M6 6l12 12" /></Icon>
)
const Skull = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="9" cy="12" r="1" />
    <circle cx="15" cy="12" r="1" />
    <path d="M8 20v2h8v-2" />
    <path d="M12.5 17l-.5-1-.5 1h1z" />
    <path d="M16 20a2 2 0 0 0 1.56-3.25 9 9 0 1 0-11.12 0A2 2 0 0 0 8 20" />
  </Icon>
)
const Droplet = (p: IconProps) => (
  <Icon {...p}><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" /></Icon>
)
const Swords = (p: IconProps) => (
  <Icon {...p}>
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
    <line x1="13" y1="19" x2="19" y2="13" />
    <line x1="16" y1="16" x2="20" y2="20" />
    <line x1="19" y1="21" x2="21" y2="19" />
    <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
    <line x1="5" y1="14" x2="9" y2="18" />
    <line x1="7" y1="17" x2="4" y2="20" />
    <line x1="3" y1="19" x2="5" y2="21" />
  </Icon>
)
const Sparkles = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3l1.9 4.6L18 9.5l-4.1 1.9L12 16l-1.9-4.6L6 9.5l4.1-1.9L12 3z" />
    <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
    <path d="M5 15l.6 1.4L7 17l-1.4.6L5 19l-.6-1.4L3 17l1.4-.6L5 15z" />
  </Icon>
)
const Zap = (p: IconProps) => (
  <Icon {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></Icon>
)
const Eye = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
)
const Sun = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </Icon>
)
const ArrowLeft = (p: IconProps) => (
  <Icon {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></Icon>
)
const Trophy = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 9H4a2 2 0 0 1-2-2V5h4" />
    <path d="M18 9h2a2 2 0 0 0 2-2V5h-4" />
    <path d="M6 5h12v6a6 6 0 0 1-12 0V5z" />
    <path d="M9 21h6" />
    <path d="M12 17v4" />
  </Icon>
)
const Pencil = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </Icon>
)
const Wifi = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12.55a11 11 0 0 1 14 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </Icon>
)

/* ────────────────────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────────────────── */

type Mode = 'solo' | 'multi'
type GameMode = { name: string; life: number }
type Counter = 'energy' | 'experience' | 'poison' | 'mana' | 'cmd'

type Player = {
  id: number
  name: string
  life: number
  /** Highest single-source commander damage taken (max of cmdFrom). Kept for
   * back-compat with badge color and recap payload. */
  cmd: number
  /** Per-opponent commander damage map. Key is opponent player id, value is
   * damage dealt to this player by that opponent's commander. The 21-damage
   * rule triggers off any single value here, not the sum. */
  cmdFrom: Record<number, number>
  poison: number
  mana: number
  energy: number
  experience: number
}

function maxCmdFrom(cmdFrom: Record<number, number> | undefined): number {
  if (!cmdFrom) return 0
  const values = Object.values(cmdFrom)
  return values.length === 0 ? 0 : Math.max(0, ...values)
}

type Step = 'mode' | 'players' | 'rules' | 'counters' | 'play'

const gameModes: GameMode[] = [
  { name: 'Standard 20', life: 20 },
  { name: 'Commander 40', life: 40 },
  { name: 'Brawl 30', life: 30 },
  { name: 'Custom', life: 20 },
]

const counterOptions: { id: Counter; label: string; Icon: (p: IconProps) => JSX.Element; color: string }[] = [
  { id: 'cmd', label: 'Commander Damage', Icon: Swords, color: 'text-primary' },
  { id: 'poison', label: 'Poison', Icon: Skull, color: 'text-[hsl(120_40%_55%)]' },
  { id: 'mana', label: 'Mana Pool', Icon: Droplet, color: 'text-[hsl(200_60%_60%)]' },
  { id: 'energy', label: 'Energy', Icon: Zap, color: 'text-[hsl(50_75%_60%)]' },
  { id: 'experience', label: 'Experience', Icon: Sparkles, color: 'text-[hsl(270_50%_70%)]' },
]

/* ────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────── */

export default function TrackerPage() {
  const [step, setStep] = useState<Step>('mode')
  const [mode, setMode] = useState<Mode>('multi')
  const [playerCount, setPlayerCount] = useState(4)
  const [gameMode, setGameMode] = useState<GameMode>(gameModes[1])
  const [customLife, setCustomLife] = useState(20)
  const [enabledCounters, setEnabledCounters] = useState<Counter[]>(['cmd', 'poison', 'mana'])
  const [players, setPlayers] = useState<Player[]>([])
  const [keepScreenOn, setKeepScreenOn] = useState(true)
  const wakeLockRef = useRef<any>(null)
  const log = useGameLog()
  const sync = useSync()

  // Join flow state — driven by ?join=CODE on the URL.
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [joinCode, setJoinCode] = useState<string>('')
  const [joinError, setJoinError] = useState<string | null>(null)
  const [joinClaiming, setJoinClaiming] = useState<number | null>(null)
  const joinAttemptedRef = useRef(false)

  // Detect ?join=CODE on mount; open the join modal and resolve the code.
  useEffect(() => {
    if (joinAttemptedRef.current) return
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    const code = url.searchParams.get('join')
    if (!code) return
    joinAttemptedRef.current = true
    setJoinCode(code)
    setJoinModalOpen(true)
    // Strip the join param from the URL so a refresh doesn't re-trigger.
    url.searchParams.delete('join')
    window.history.replaceState({}, '', url.toString())
  }, [])

  // Once we have a deviceId AND the modal is open with a code, resolve it.
  useEffect(() => {
    if (!joinModalOpen) return
    if (!sync.deviceId) return
    if (sync.session) return // already joined
    if (sync.status === 'creating') return
    if (!joinCode) return
    let cancelled = false
    ;(async () => {
      const res = await sync.joinSession(joinCode)
      if (cancelled) return
      if (!res) {
        setJoinError('Pod not found or expired.')
      } else {
        setJoinError(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [joinModalOpen, joinCode, sync.deviceId, sync.session, sync.status, sync])

  /**
   * Claim a seat as the joiner. On success, hydrate local players from the
   * server snapshot and drop straight into ActiveTracker as a viewer.
   */
  async function claimAndEnter(seatId: number) {
    setJoinClaiming(seatId)
    setJoinError(null)
    try {
      const seats = await sync.claimSeat(seatId)
      if (!seats) {
        setJoinError('Could not claim that seat. It may be taken.')
        return
      }
      // Seed local Player[] from the snapshot so the tracker renders.
      const snap = sync.snapshot
      if (snap && snap.players.length > 0) {
        setPlayers(
          snap.players.map<Player>((p) => ({
            id: p.id,
            name: p.name,
            life: p.life,
            cmd: p.cmd,
            cmdFrom: p.cmdFrom,
            poison: p.poison,
            mana: p.mana,
            energy: p.energy,
            experience: p.experience,
          })),
        )
        setGameMode({
          name: snap.gameMode.name,
          life: snap.gameMode.life,
        } as GameMode)
        setCustomLife(snap.customLife)
        setEnabledCounters(snap.enabledCounters as Counter[])
      }
      setJoinModalOpen(false)
      setStep('play')
      track('tracker_joined_pod', { seat_id: seatId })
    } finally {
      setJoinClaiming(null)
    }
  }

  function cancelJoin() {
    setJoinModalOpen(false)
    setJoinError(null)
    setJoinCode('')
    sync.teardown()
  }

  // Default keep-screen-on ON when entering tracker — request wake lock if available
  useEffect(() => {
    if (step !== 'play' || !keepScreenOn) return
    let cancelled = false
    const req = async () => {
      try {
        // @ts-ignore
        if ('wakeLock' in navigator) {
          // @ts-ignore
          const lock = await navigator.wakeLock.request('screen')
          if (!cancelled) wakeLockRef.current = lock
        }
      } catch {}
    }
    req()
    return () => {
      cancelled = true
      if (wakeLockRef.current) wakeLockRef.current.release?.()
      wakeLockRef.current = null
    }
  }, [step, keepScreenOn])

  function startGame() {
    const n = mode === 'solo' ? 1 : playerCount
    const startLife = gameMode.name === 'Custom' ? customLife : gameMode.life
    const newPlayers: Player[] = Array.from({ length: n }, (_, i) => ({
      id: i + 1,
      name: mode === 'solo' ? 'You' : `Player ${i + 1}`,
      life: startLife,
      cmd: 0,
      cmdFrom: {},
      poison: 0,
      mana: 0,
      energy: 0,
      experience: 0,
    }))
    setPlayers(newPlayers)
    log.start({
      format: gameMode.name === 'Custom' ? `Custom (${customLife})` : gameMode.name,
      startingLife: startLife,
      players: newPlayers.map<RecapPlayer>((p) => ({ id: p.id, name: p.name })),
    })
    track('tracker_started', {
      mode,
      players: n,
      format: gameMode.name,
      starting_life: startLife,
      counters: enabledCounters.join(','),
    })
    setStep('play')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6 md:pt-12 pb-12">
      {step !== 'play' && <YourPods />}
      {step !== 'play' && (
        <Wizard
          step={step}
          setStep={setStep}
          mode={mode}
          setMode={setMode}
          playerCount={playerCount}
          setPlayerCount={setPlayerCount}
          gameMode={gameMode}
          setGameMode={setGameMode}
          customLife={customLife}
          setCustomLife={setCustomLife}
          enabledCounters={enabledCounters}
          setEnabledCounters={setEnabledCounters}
          startGame={startGame}
        />
      )}
      {step === 'play' && (
        <ActiveTracker
          players={players}
          setPlayers={setPlayers}
          gameMode={gameMode}
          customLife={customLife}
          enabledCounters={enabledCounters}
          keepScreenOn={keepScreenOn}
          setKeepScreenOn={setKeepScreenOn}
          onExit={() => {
            log.reset()
            sync.teardown()
            setStep('mode')
          }}
          log={log}
          sync={sync}
        />
      )}
      <JoinModal
        open={joinModalOpen}
        code={joinCode}
        deviceId={sync.deviceId}
        status={sync.status}
        seats={sync.seats}
        snapshot={sync.snapshot}
        error={joinError}
        claiming={joinClaiming}
        onClaim={claimAndEnter}
        onCancel={cancelJoin}
      />
    </div>
  )
}

/* ──────────────────────────────────────────────
 * Join Modal
 * ──────────────────────────────────────────────────────────── */

type JoinModalProps = {
  open: boolean
  code: string
  deviceId: string | null
  status: UseSyncResult['status']
  seats: UseSyncResult['seats']
  snapshot: UseSyncResult['snapshot']
  error: string | null
  claiming: number | null
  onClaim: (seatId: number) => void
  onCancel: () => void
}

function JoinModal({
  open,
  code,
  status,
  seats,
  snapshot,
  error,
  claiming,
  onClaim,
  onCancel,
}: JoinModalProps) {
  const formattedCode = code
    ? `${code.slice(0, 3)}-${code.slice(3)}`.toUpperCase()
    : ''
  const unclaimedSeats = seats.filter((s) => !s.ownerDeviceId)
  const resolving = status === 'creating' || (status === 'idle' && !error)
  const ended = status === 'ended'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-testid="join-dialog"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            className="relative panel-elevated arcane-glow-strong p-6 max-w-sm w-full text-center"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            role="dialog"
            aria-label="Join pod"
          >
            <button
              onClick={onCancel}
              className="absolute right-3 top-3 p-1.5 rounded-md hover:bg-accent/40"
              data-testid="button-close-join"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
            <h3 className="font-display tracking-wide text-xl">Join pod</h3>
            {formattedCode && (
              <div
                className="mt-3 px-4 py-2 panel rounded-md font-display tracking-[0.3em] text-lg"
                data-testid="join-code"
              >
                {formattedCode}
              </div>
            )}

            {error && (
              <p
                className="mt-4 text-sm text-destructive"
                data-testid="join-error"
              >
                {error}
              </p>
            )}

            {!error && resolving && (
              <p className="mt-4 font-prose italic text-foreground/70 text-sm">
                Resolving pod…
              </p>
            )}

            {!error && ended && (
              <p className="mt-4 font-prose italic text-foreground/70 text-sm">
                This pod has ended.
              </p>
            )}

            {!error &&
              !resolving &&
              !ended &&
              snapshot &&
              seats.length > 0 && (
                <>
                  <p className="font-prose italic text-foreground/70 text-sm mt-3">
                    Pick the seat you want to control.
                  </p>
                  <div
                    className="mt-4 grid grid-cols-1 gap-2"
                    data-testid="join-seat-picker"
                  >
                    {seats.map((s) => {
                      const taken = !!s.ownerDeviceId
                      const isClaiming = claiming === s.seatId
                      return (
                        <button
                          key={s.seatId}
                          disabled={taken || claiming !== null}
                          onClick={() => onClaim(s.seatId)}
                          className={`panel hover-elevate text-sm py-3 px-4 flex items-center justify-between rounded-md ${
                            taken ? 'opacity-40 cursor-not-allowed' : ''
                          }`}
                          data-testid={`join-seat-${s.seatId}`}
                        >
                          <span className="font-display tracking-wide">
                            {s.name}
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            {taken
                              ? 'Taken'
                              : isClaiming
                              ? 'Claiming…'
                              : 'Open'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  {unclaimedSeats.length === 0 && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      All seats are claimed. Ask the host to make room.
                    </p>
                  )}
                </>
              )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ────────────────────────────────────────────────────────────
 * Wizard
 * ──────────────────────────────────────────────────────────── */

type WizardProps = {
  step: Step
  setStep: (s: Step) => void
  mode: Mode
  setMode: (m: Mode) => void
  playerCount: number
  setPlayerCount: (n: number) => void
  gameMode: GameMode
  setGameMode: (g: GameMode) => void
  customLife: number
  setCustomLife: (n: number) => void
  enabledCounters: Counter[]
  setEnabledCounters: (c: Counter[]) => void
  startGame: () => void
}

function Wizard(p: WizardProps) {
  const stepIndex = ['mode', 'players', 'rules', 'counters'].indexOf(p.step)
  return (
    <div className="max-w-2xl mx-auto">
      <header className="text-center">
        <div className="flex items-center justify-center"><GoldRule /></div>
        <h1 className="font-display tracking-[0.16em] uppercase text-xs text-muted-foreground mt-3">Prepare the Table</h1>
        <p className="font-display text-gold-gradient text-3xl md:text-5xl mt-3 tracking-wide">Life Tracker</p>
        <p className="font-prose italic text-foreground/80 mt-1">Conjure your game state.</p>
      </header>

      <div className="mt-8 panel arcane-glow panel-gilded p-6 md:p-10">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 text-[10px] font-display tracking-[0.2em] uppercase text-muted-foreground">
          {['Mode', 'Players', 'Rules', 'Counters'].map((s, i) => (
            <div key={s} className="flex-1 flex items-center">
              <div
                className={`w-6 h-6 rounded-full grid place-items-center border ${
                  i <= stepIndex ? 'border-primary text-primary' : 'border-border text-muted-foreground/60'
                }`}
              >
                {i + 1}
              </div>
              <span className={`ml-2 hidden sm:inline ${i === stepIndex ? 'text-primary' : ''}`}>{s}</span>
              {i < 3 && (
                <div className={`flex-1 mx-2 h-px ${i < stepIndex ? 'bg-primary/60' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {p.step === 'mode' && (
            <StepShell key="mode" title="Choose your mode" subtitle="Solo for personal tracking, Multiplayer for the table.">
              <div className="grid grid-cols-2 gap-3">
                {(['solo', 'multi'] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => p.setMode(m)}
                    data-testid={`mode-${m}`}
                    className={`panel p-5 text-left hover-elevate ${
                      p.mode === m ? 'border-primary/60 arcane-glow-strong' : ''
                    }`}
                  >
                    <div className="font-display text-xl">{m === 'solo' ? 'Solo' : 'Multiplayer'}</div>
                    <p className="font-prose text-foreground/70 mt-1">
                      {m === 'solo' ? 'One panel for personal life tracking.' : 'Two to four panels for pod play.'}
                    </p>
                  </button>
                ))}
              </div>
              <Nav onNext={() => p.setStep(p.mode === 'solo' ? 'rules' : 'players')} />
            </StepShell>
          )}
          {p.step === 'players' && (
            <StepShell key="players" title="How many at the table?" subtitle="Choose between two and four.">
              <div className="grid grid-cols-3 gap-3">
                {[2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => p.setPlayerCount(n)}
                    data-testid={`players-${n}`}
                    className={`panel p-6 text-center hover-elevate ${
                      p.playerCount === n ? 'border-primary/60 arcane-glow-strong' : ''
                    }`}
                  >
                    <div className="font-display text-4xl text-gold-gradient">{n}</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-2">players</div>
                  </button>
                ))}
              </div>
              <Nav onBack={() => p.setStep('mode')} onNext={() => p.setStep('rules')} />
            </StepShell>
          )}
          {p.step === 'rules' && (
            <StepShell key="rules" title="Pick a format" subtitle="Sets your starting life total.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {gameModes.map((g) => (
                  <button
                    key={g.name}
                    onClick={() => p.setGameMode(g)}
                    data-testid={`format-${g.name.toLowerCase().replace(/\s/g, '-')}`}
                    className={`panel p-5 text-left hover-elevate ${
                      p.gameMode.name === g.name ? 'border-primary/60 arcane-glow-strong' : ''
                    }`}
                  >
                    <div className="font-display text-lg">{g.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {g.name === 'Custom' ? 'Custom life total' : `Start at ${g.life} life`}
                    </div>
                  </button>
                ))}
              </div>
              {p.gameMode.name === 'Custom' && (
                <div className="mt-4 panel p-4 flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Starting life</span>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={p.customLife}
                    onChange={(e) => p.setCustomLife(parseInt(e.target.value || '20'))}
                    className="bg-input border border-border rounded-md px-3 py-1.5 w-24 text-foreground"
                    data-testid="input-custom-life"
                  />
                </div>
              )}
              <Nav onBack={() => p.setStep(p.mode === 'solo' ? 'mode' : 'players')} onNext={() => p.setStep('counters')} />
            </StepShell>
          )}
          {p.step === 'counters' && (
            <StepShell key="counters" title="Optional counters" subtitle="Toggle which counters appear on each player panel.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {counterOptions.map(({ id, label, Icon, color }) => {
                  const on = p.enabledCounters.includes(id)
                  return (
                    <button
                      key={id}
                      data-testid={`counter-${id}`}
                      onClick={() =>
                        p.setEnabledCounters(
                          on ? p.enabledCounters.filter((c) => c !== id) : [...p.enabledCounters, id]
                        )
                      }
                      className={`panel p-4 flex items-center gap-3 text-left hover-elevate ${on ? 'border-primary/60' : ''}`}
                    >
                      <Icon className={`w-5 h-5 ${color}`} />
                      <span className="font-display text-base flex-1">{label}</span>
                      <span className={`w-9 h-5 rounded-full relative transition-colors ${on ? 'bg-primary' : 'bg-border'}`}>
                        <span
                          className={`absolute top-0.5 ${on ? 'left-[18px]' : 'left-0.5'} w-4 h-4 rounded-full bg-foreground transition-all`}
                        />
                      </span>
                    </button>
                  )
                })}
              </div>
              <Nav onBack={() => p.setStep('rules')} onNext={p.startGame} nextLabel="Begin" />
            </StepShell>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function StepShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
    >
      <h3 className="font-display text-2xl tracking-wide">{title}</h3>
      <p className="font-prose italic text-foreground/70 mt-1 mb-6">{subtitle}</p>
      {children}
    </motion.div>
  )
}

function Nav({
  onBack,
  onNext,
  nextLabel = 'Continue',
}: {
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      {onBack ? (
        <button
          onClick={onBack}
          className="px-4 py-2 panel hover-elevate text-sm text-muted-foreground inline-flex items-center gap-2"
          data-testid="button-wizard-back"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      ) : (
        <span />
      )}
      {onNext && (
        <button
          onClick={onNext}
          className="px-5 py-2 bg-primary text-primary-foreground rounded-md hover-elevate active-elevate-2 font-medium"
          data-testid="button-wizard-next"
        >
          {nextLabel}
        </button>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
 * Active Tracker
 * ──────────────────────────────────────────────────────────── */

type ActiveProps = {
  players: Player[]
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>
  gameMode: GameMode
  customLife: number
  enabledCounters: Counter[]
  keepScreenOn: boolean
  setKeepScreenOn: (b: boolean) => void
  onExit: () => void
  log: UseGameLog
  sync: UseSyncResult
}

function ActiveTracker({
  players,
  setPlayers,
  gameMode,
  customLife,
  enabledCounters,
  keepScreenOn,
  setKeepScreenOn,
  sync,
  onExit,
  log,
}: ActiveProps) {
  const router = useRouter()
  const [shareOpen, setShareOpen] = useState(false)
  const [qrUrl, setQrUrl] = useState<string>('')
  const [syncOpen, setSyncOpen] = useState(false)
  const [syncStarting, setSyncStarting] = useState(false)
  const [syncQrUrl, setSyncQrUrl] = useState<string>('')
  const [endOpen, setEndOpen] = useState(false)
  const [endingGame, setEndingGame] = useState(false)
  const [endError, setEndError] = useState<string | null>(null)
  const [winnerId, setWinnerId] = useState<number | undefined>(undefined)
  const [podName, setPodName] = useState('')
  const [commanders, setCommanders] = useState<Record<number, string>>({})

  /**
   * Centralized update — every player mutation routes through here so the
   * game log captures life / cmd / poison deltas. Other counters (mana,
   * energy, experience) are not part of the recap v1.
   */
  function update(id: number, patch: Partial<Player>) {
    setPlayers((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
      const before = prev.find((p) => p.id === id)
      const after = next.find((p) => p.id === id)
      if (before && after) {
        if (typeof patch.life === 'number' && after.life !== before.life) {
          const delta = after.life - before.life
          log.life(id, delta, after.life)
          sync.emit({ type: 'life', seatId: id, delta })
        }
        if (typeof patch.poison === 'number' && after.poison !== before.poison) {
          const delta = after.poison - before.poison
          log.poison(id, delta, after.poison)
          sync.emit({ type: 'counter', seatId: id, counter: 'poison', delta })
        }
        if (typeof patch.mana === 'number' && after.mana !== before.mana) {
          sync.emit({
            type: 'counter',
            seatId: id,
            counter: 'mana',
            delta: after.mana - before.mana,
          })
        }
        if (typeof patch.energy === 'number' && after.energy !== before.energy) {
          sync.emit({
            type: 'counter',
            seatId: id,
            counter: 'energy',
            delta: after.energy - before.energy,
          })
        }
        if (
          typeof patch.experience === 'number' &&
          after.experience !== before.experience
        ) {
          sync.emit({
            type: 'counter',
            seatId: id,
            counter: 'experience',
            delta: after.experience - before.experience,
          })
        }
        if (typeof patch.name === 'string' && after.name !== before.name) {
          sync.emit({ type: 'rename', seatId: id, name: after.name })
        }
      }
      return next
    })
  }

  /**
   * Bump per-opponent commander damage by a delta. Reads from the freshest
   * setPlayers prev state to avoid stale closures on rapid clicks. Also
   * derives the legacy cmd value as the max single-source amount and logs a
   * commander_damage event with the source player id for the recap.
   */
  function bumpCmdFrom(targetId: number, sourceId: number, delta: number) {
    setPlayers((prev) => {
      const before = prev.find((p) => p.id === targetId)
      if (!before) return prev
      const beforeAmt = before.cmdFrom?.[sourceId] ?? 0
      const afterAmt = Math.max(0, beforeAmt + delta)
      if (afterAmt === beforeAmt) return prev
      const nextCmdFrom = { ...(before.cmdFrom ?? {}), [sourceId]: afterAmt }
      const nextCmd = maxCmdFrom(nextCmdFrom)
      const next = prev.map((p) =>
        p.id === targetId ? { ...p, cmdFrom: nextCmdFrom, cmd: nextCmd } : p
      )
      const appliedDelta = afterAmt - beforeAmt
      log.cmd(targetId, appliedDelta, nextCmd, sourceId)
      sync.emit({
        type: 'cmd_from',
        seatId: targetId,
        sourceId,
        delta: appliedDelta,
      })
      return next
    })
  }

  const startLife = gameMode.name === 'Custom' ? customLife : gameMode.life

  function reset() {
    setPlayers((prev) =>
      prev.map((p) => ({ ...p, life: startLife, cmd: 0, cmdFrom: {}, poison: 0, mana: 0, energy: 0, experience: 0 }))
    )
    // Restart the log so the next game gets a clean recap.
    log.start({
      format: gameMode.name === 'Custom' ? `Custom (${customLife})` : gameMode.name,
      startingLife: startLife,
      players: players.map<RecapPlayer>((p) => ({ id: p.id, name: p.name })),
    })
    track('tracker_reset', { players: players.length, format: gameMode.name })
    sync.emit({ type: 'reset' })
  }

  // Only show End Game once at least one log entry beyond game_start exists.
  const canEndGame = log.events.length > 1

  async function submitRecap() {
    setEndingGame(true)
    setEndError(null)
    try {
      log.end(winnerId)
      // Build the events array including the end event we just appended.
      // Since setEvents is async, build the end event ourselves for the POST.
      const events = [...log.events]
      const endEvent = {
        type: 'game_end' as const,
        seq: events[events.length - 1]?.seq != null ? (events[events.length - 1]!.seq + 1) : events.length,
        timestamp: Date.now(),
        winnerId,
      }
      const finalPlayers: RecapPlayer[] = players.map((p) => ({
        id: p.id,
        name: p.name,
        commander: commanders[p.id]?.trim() || undefined,
      }))
      const res = await fetch('/api/recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          podName: podName.trim() || undefined,
          format: gameMode.name === 'Custom' ? `Custom (${customLife})` : gameMode.name,
          startingLife: startLife,
          players: finalPlayers,
          winnerId,
          events: [...events, endEvent],
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || `Server returned ${res.status}`)
      }
      const data = (await res.json()) as { id: string; url: string }
      track('recap_created', {
        players: players.length,
        format: gameMode.name,
        events: events.length + 1,
        had_winner: winnerId != null,
      })
      sync.emit({ type: 'end_game', winnerSeatId: winnerId })
      router.push(`/recap/${data.id}`)
    } catch (err) {
      setEndError(err instanceof Error ? err.message : 'Could not save recap')
      setEndingGame(false)
    }
  }

  async function openShare() {
    const state = encodeURIComponent(
      JSON.stringify({
        mode: gameMode.name,
        life: startLife,
        players: players.map((p) => ({ n: p.name, l: p.life, c: p.cmd, p: p.poison })),
      })
    )
    const url = `${window.location.origin}/tracker?state=${state}`
    const dataUrl = await QRCode.toDataURL(url, { color: { dark: '#d4a93a', light: '#0f1115' }, width: 320, margin: 1 })
    setQrUrl(dataUrl)
    setShareOpen(true)
    track('tracker_share_opened', { players: players.length })
  }

  // Render a QR for the sync joinUrl whenever it changes. The QR encodes
  // the join URL so a phone camera + a single tap drops the joiner into
  // /tracker?join=CODE.
  useEffect(() => {
    let cancelled = false
    if (!sync.joinUrl) {
      setSyncQrUrl('')
      return
    }
    QRCode.toDataURL(sync.joinUrl, {
      color: { dark: '#d4a93a', light: '#0f1115' },
      width: 240,
      margin: 1,
    })
      .then((url) => {
        if (!cancelled) setSyncQrUrl(url)
      })
      .catch(() => {
        if (!cancelled) setSyncQrUrl('')
      })
    return () => {
      cancelled = true
    }
  }, [sync.joinUrl])

  /**
   * Reconcile local Player[] state from remote ops authored by other devices.
   * Own-device ops are filtered out by useSync, so we only see ops from
   * other seats here. Mirrors the server's applySyncOp logic but on the
   * tracker's Player[] shape (life/cmd/poison/mana/energy/experience/name).
   * Reset and end_game are surfaced too so non-host viewers see those.
   */
  useEffect(() => {
    const unsub = sync.subscribeRemoteOps((env) => {
      const op = env.op
      if (op.type === 'life') {
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === op.seatId ? { ...p, life: p.life + op.delta } : p,
          ),
        )
      } else if (op.type === 'counter') {
        setPlayers((prev) =>
          prev.map((p) => {
            if (p.id !== op.seatId) return p
            const cur = (p[op.counter] as number) ?? 0
            const nextVal = Math.max(0, cur + op.delta)
            return { ...p, [op.counter]: nextVal }
          }),
        )
      } else if (op.type === 'cmd_from') {
        setPlayers((prev) =>
          prev.map((p) => {
            if (p.id !== op.seatId) return p
            const cmdFrom = { ...(p.cmdFrom ?? {}) }
            const cur = cmdFrom[op.sourceId] ?? 0
            const nextAmt = Math.max(0, cur + op.delta)
            cmdFrom[op.sourceId] = nextAmt
            return { ...p, cmdFrom, cmd: maxCmdFrom(cmdFrom) }
          }),
        )
      } else if (op.type === 'rename') {
        const trimmed = op.name.trim().slice(0, 32)
        if (!trimmed) return
        setPlayers((prev) =>
          prev.map((p) => (p.id === op.seatId ? { ...p, name: trimmed } : p)),
        )
      } else if (op.type === 'reset') {
        setPlayers((prev) =>
          prev.map((p) => ({
            ...p,
            life: startLife,
            cmd: 0,
            cmdFrom: {},
            poison: 0,
            mana: 0,
            energy: 0,
            experience: 0,
          })),
        )
      }
      // end_game state surfaces via sync.status === 'ended'; tracker UI
      // reads that to show the post-game summary. No local mutation needed.
    })
    return unsub
  }, [sync, setPlayers, startLife])

  const cols =
    players.length === 1
      ? 'grid-cols-1'
      : players.length === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : players.length === 3
      ? 'grid-cols-1 md:grid-cols-3'
      : 'grid-cols-2'

  return (
    <div className="-mt-2">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="panel hover-elevate p-2 rounded-md"
            data-testid="button-exit-game"
            aria-label="Exit game"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <div className="font-display tracking-[0.18em] uppercase text-[10px] text-muted-foreground">Now playing</div>
            <div className="font-display text-lg text-foreground">
              {gameMode.name}
              {gameMode.name === 'Custom' && ` (${customLife})`} <span className="text-muted-foreground">·</span>{' '}
              <span className="text-muted-foreground">
                {players.length} player{players.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setKeepScreenOn(!keepScreenOn)}
            className={`px-3 py-1.5 panel hover-elevate text-sm inline-flex items-center gap-2 ${
              keepScreenOn ? 'text-primary' : 'text-muted-foreground'
            }`}
            data-testid="button-keep-screen-on"
          >
            <Sun className={`w-4 h-4 ${keepScreenOn ? 'text-primary' : ''}`} /> Keep screen on
          </button>
          <button
            onClick={openShare}
            className="px-3 py-1.5 panel hover-elevate text-sm inline-flex items-center gap-2"
            data-testid="button-share"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
          {players.length > 1 && (
            <button
              onClick={() => setSyncOpen(true)}
              className={`px-3 py-1.5 panel hover-elevate text-sm inline-flex items-center gap-2 ${
                sync.status === 'active' ? 'text-primary' : ''
              } ${sync.status === 'offline' ? 'text-[hsl(42_75%_55%)]' : ''} ${
                sync.status === 'ended' ? 'text-muted-foreground' : ''
              }`}
              data-testid="button-sync"
              aria-label="Sync game across players"
            >
              <Wifi className={`w-4 h-4 ${sync.status === 'active' ? 'text-primary' : ''}`} />
              {sync.status === 'active'
                ? 'Synced'
                : sync.status === 'offline'
                ? 'Reconnecting'
                : sync.status === 'ended'
                ? 'Ended'
                : 'Sync'}
              {(sync.status === 'active' ||
                sync.status === 'offline' ||
                sync.status === 'ended') && (
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    sync.status === 'active'
                      ? 'bg-primary'
                      : sync.status === 'offline'
                      ? 'bg-[hsl(42_75%_55%)]'
                      : 'bg-muted-foreground'
                  }`}
                  data-testid="sync-button-status-dot"
                  aria-hidden="true"
                />
              )}
              {sync.pendingCount > 0 && (
                <span
                  className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-[hsl(42_75%_55%)]"
                  data-testid="sync-pending-dot"
                  aria-label={`${sync.pendingCount} ops pending`}
                />
              )}
            </button>
          )}
          {canEndGame && (
            <button
              onClick={() => setEndOpen(true)}
              className="px-3 py-1.5 bg-[hsl(42_75%_55%)] text-[hsl(220_15%_7%)] rounded-md hover-elevate text-sm inline-flex items-center gap-2 font-medium"
              data-testid="button-end-game"
            >
              <Trophy className="w-4 h-4" /> End game
            </button>
          )}
          <button
            onClick={reset}
            className="px-3 py-1.5 bg-destructive text-destructive-foreground rounded-md hover-elevate text-sm inline-flex items-center gap-2"
            data-testid="button-reset"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      <div className={`grid ${cols} gap-3 md:gap-4`}>
        {players.map((p) => (
          <PlayerPanel
            key={p.id}
            player={p}
            opponents={players.filter((o) => o.id !== p.id)}
            startLife={startLife}
            enabledCounters={enabledCounters}
            update={(patch) => update(p.id, patch)}
            bumpCmdFrom={(sourceId, delta) => bumpCmdFrom(p.id, sourceId, delta)}
          />
        ))}
      </div>

      <Tip />
      <NameHint multi={players.length > 1} />

      <AnimatePresence>
        {shareOpen && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShareOpen(false)} />
            <motion.div
              className="relative panel-elevated arcane-glow-strong p-6 max-w-sm w-full text-center"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            >
              <button
                onClick={() => setShareOpen(false)}
                className="absolute right-3 top-3 p-1.5 rounded-md hover:bg-accent/40"
                data-testid="button-close-share"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
              <h3 className="font-display tracking-wide text-xl">Share game state</h3>
              <p className="font-prose italic text-foreground/70 text-sm mt-1">Scan to load this table on another device.</p>
              {qrUrl && <img src={qrUrl} alt="QR code" className="mx-auto mt-4 rounded-md border border-border" />}
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-3">
                Snapshot only — read-only on the receiving device.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pod Sync modal */}
      <AnimatePresence>
        {syncOpen && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-testid="sync-dialog"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSyncOpen(false)} />
            <motion.div
              className="relative panel-elevated arcane-glow-strong p-6 max-w-sm w-full text-center"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              role="dialog"
              aria-label="Pod Sync"
            >
              <button
                onClick={() => setSyncOpen(false)}
                className="absolute right-3 top-3 p-1.5 rounded-md hover:bg-accent/40"
                data-testid="button-close-sync"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
              <h3 className="font-display tracking-wide text-xl">Pod Sync</h3>
              {sync.status !== 'active' && sync.status !== 'offline' && (
                <>
                  <p className="font-prose italic text-foreground/70 text-sm mt-1">
                    Sync this game to your friends&rsquo; devices. Each player controls their own life total — everyone sees changes live.
                  </p>
                  <button
                    onClick={async () => {
                      setSyncStarting(true)
                      try {
                        await sync.createSession({
                          players: players.map((p) => ({
                            id: p.id,
                            name: p.name,
                            life: p.life,
                            cmd: p.cmd,
                            cmdFrom: p.cmdFrom,
                            poison: p.poison,
                            mana: p.mana,
                            energy: p.energy,
                            experience: p.experience,
                          })),
                          gameMode: { name: gameMode.name, life: gameMode.life },
                          customLife,
                          enabledCounters,
                        })
                      } finally {
                        setSyncStarting(false)
                      }
                    }}
                    disabled={syncStarting || sync.status === 'creating'}
                    className="mt-5 px-4 py-2 bg-primary text-primary-foreground rounded-md hover-elevate text-sm font-medium inline-flex items-center gap-2 disabled:opacity-50"
                    data-testid="button-start-sync"
                  >
                    <Wifi className="w-4 h-4" />
                    {sync.status === 'creating' || syncStarting ? 'Starting…' : 'Start sync'}
                  </button>
                </>
              )}
              {(sync.status === 'active' || sync.status === 'offline') && sync.session && (
                <>
                  <p className="font-prose italic text-foreground/70 text-sm mt-1">
                    Share this code with your friends. They&rsquo;ll join the same game.
                  </p>
                  <div
                    className="mt-4 px-4 py-3 panel rounded-md font-display tracking-[0.3em] text-2xl"
                    data-testid="sync-code"
                  >
                    {sync.session.code.slice(0, 3)}-{sync.session.code.slice(3)}
                  </div>
                  {syncQrUrl && (
                    <img
                      src={syncQrUrl}
                      alt="Scan to join this pod"
                      className="mx-auto mt-4 rounded-md border border-border"
                      width={240}
                      height={240}
                      data-testid="sync-qr"
                    />
                  )}
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-3">
                    Scan with a phone, or share this link
                  </p>
                  {sync.joinUrl && (
                    <p className="font-mono text-[11px] text-foreground/60 mt-2 break-all" data-testid="sync-join-url">
                      {sync.joinUrl}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        sync.status === 'active'
                          ? 'bg-primary'
                          : sync.status === 'offline'
                          ? 'bg-[hsl(42_75%_55%)]'
                          : 'bg-muted-foreground'
                      }`}
                      data-testid="sync-status-dot"
                    />
                    <span data-testid="sync-status-label">
                      {sync.status === 'active'
                        ? 'Live'
                        : sync.status === 'offline'
                        ? 'Reconnecting…'
                        : 'Ended'}
                    </span>
                    {sync.pendingCount > 0 && (
                      <span data-testid="sync-pending-count">· {sync.pendingCount} pending</span>
                    )}
                  </div>
                </>
              )}
              {sync.status === 'ended' && (
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <span
                      className="inline-block w-2 h-2 rounded-full bg-muted-foreground"
                      data-testid="sync-status-dot"
                    />
                    <span data-testid="sync-status-label">Ended</span>
                  </div>
                  <p className="font-prose italic text-foreground/70 text-sm mt-2">
                    This pod has ended.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* End Game / Recap modal */}
      <AnimatePresence>
        {endOpen && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => !endingGame && setEndOpen(false)}
            />
            <motion.div
              className="relative panel-elevated arcane-glow-strong p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            >
              <button
                onClick={() => !endingGame && setEndOpen(false)}
                className="absolute right-3 top-3 p-1.5 rounded-md hover:bg-accent/40"
                aria-label="Close"
                data-testid="button-close-end-game"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
              <h3 className="font-display tracking-wide text-xl text-center">End the game?</h3>
              <p className="font-prose italic text-foreground/70 text-sm mt-1 text-center">
                We&rsquo;ll save a shareable recap with the full life history. All fields below are optional.
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="recap-pod-name"
                    className="font-display tracking-[0.16em] uppercase text-[10px] text-muted-foreground block mb-1.5"
                  >
                    Pod name
                  </label>
                  <input
                    id="recap-pod-name"
                    value={podName}
                    onChange={(e) => setPodName(e.target.value)}
                    placeholder="Friday Night Crew"
                    className="w-full panel px-3 py-2 text-sm bg-transparent outline-none focus:ring-1 focus:ring-primary/40 rounded-md"
                    data-testid="input-pod-name"
                    maxLength={60}
                  />
                </div>

                <div>
                  <div className="font-display tracking-[0.16em] uppercase text-[10px] text-muted-foreground mb-1.5">
                    Winner
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setWinnerId(undefined)}
                      className={`panel hover-elevate text-sm py-2 ${
                        winnerId === undefined ? 'border-primary/60 text-primary' : 'text-muted-foreground'
                      }`}
                      data-testid="button-winner-none"
                    >
                      Skip
                    </button>
                    {players.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setWinnerId(p.id)}
                        className={`panel hover-elevate text-sm py-2 truncate ${
                          winnerId === p.id ? 'border-primary/60 text-primary' : ''
                        }`}
                        data-testid={`button-winner-${p.id}`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="font-display tracking-[0.16em] uppercase text-[10px] text-muted-foreground mb-1.5">
                    Commanders (optional)
                  </div>
                  <div className="space-y-1.5">
                    {players.map((p) => (
                      <div key={p.id} className="flex items-center gap-2">
                        <span className="font-display tracking-wide text-xs w-20 truncate text-muted-foreground">
                          {p.name}
                        </span>
                        <input
                          value={commanders[p.id] || ''}
                          onChange={(e) =>
                            setCommanders((prev) => ({ ...prev, [p.id]: e.target.value }))
                          }
                          placeholder="e.g. Atraxa, Praetors' Voice"
                          className="flex-1 panel px-3 py-1.5 text-xs bg-transparent outline-none rounded-md"
                          data-testid={`input-commander-${p.id}`}
                          maxLength={80}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {endError && (
                <p className="mt-4 text-sm text-destructive" role="alert" data-testid="text-recap-error">
                  {endError}
                </p>
              )}

              <div className="mt-6 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setEndOpen(false)}
                  disabled={endingGame}
                  className="panel hover-elevate text-sm py-2.5 text-muted-foreground disabled:opacity-50"
                  data-testid="button-cancel-end-game"
                >
                  Keep playing
                </button>
                <button
                  onClick={submitRecap}
                  disabled={endingGame}
                  className="bg-[hsl(42_75%_55%)] text-[hsl(220_15%_7%)] rounded-md hover-elevate text-sm py-2.5 font-medium disabled:opacity-60"
                  data-testid="button-confirm-end-game"
                >
                  {endingGame ? 'Saving recap…' : 'End & save recap'}
                </button>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-3 text-center">
                Recaps are public to anyone with the link, kept for 30 days.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function lifeColor(life: number, start: number) {
  const ratio = life / start
  if (life <= 0) return 'text-destructive'
  if (ratio <= 0.25) return 'text-destructive'
  if (ratio <= 0.5) return 'text-[hsl(50_75%_60%)]'
  return 'text-foreground'
}

function PlayerPanel({
  player,
  opponents,
  startLife,
  enabledCounters,
  update,
  bumpCmdFrom,
}: {
  player: Player
  opponents: Player[]
  startLife: number
  enabledCounters: Counter[]
  update: (p: Partial<Player>) => void
  bumpCmdFrom: (sourceId: number, delta: number) => void
}) {
  const [showBadge, setShowBadge] = useState<Counter | null>(null)
  const [lastDelta, setLastDelta] = useState<number>(0)
  const prevLifeRef = useRef<number>(player.life)

  const cmdFrom = player.cmdFrom ?? {}
  const maxCmd = maxCmdFrom(cmdFrom)
  const lethalFromCmd = maxCmd >= 21
  const defaultName = opponents.length === 0 ? 'You' : `Player ${player.id}`
  const tier =
    player.life <= 0
      ? 'lethal'
      : player.life / startLife <= 0.25
      ? 'lethal'
      : player.life / startLife <= 0.5
      ? 'warn'
      : 'full'
  const prevTierRef = useRef<string>(tier)
  const [tierFlash, setTierFlash] = useState<string | null>(null)

  useEffect(() => {
    const delta = player.life - prevLifeRef.current
    if (delta !== 0) setLastDelta(delta)
    prevLifeRef.current = player.life
    if (tier !== prevTierRef.current) {
      setTierFlash(tier)
      const id = setTimeout(() => setTierFlash(null), 700)
      prevTierRef.current = tier
      return () => clearTimeout(id)
    }
  }, [player.life, tier])

  const lifeCls = lifeColor(player.life, startLife)

  function bump(field: keyof Player, n: number, min = 0) {
    const cur = player[field] as number
    update({ [field]: Math.max(min, cur + n) } as any)
  }

  const badgeColor = (val: number, danger: number, warn: number) =>
    val >= danger
      ? 'text-destructive border-destructive/50 bg-destructive/10'
      : val >= warn
      ? 'text-[hsl(50_75%_60%)] border-[hsl(50_75%_50%/0.5)] bg-[hsl(50_75%_50%/0.10)]'
      : 'text-muted-foreground border-border bg-muted'

  return (
    <div
      className={`panel arcane-glow panel-gilded p-5 relative overflow-hidden ${
        lethalFromCmd
          ? 'ring-2 ring-destructive/70 shadow-[0_0_24px_hsl(0_70%_45%/0.45)]'
          : ''
      }`}
      data-lethal-cmd={lethalFromCmd ? 'true' : 'false'}
    >
      {/* Tier-change flash overlay */}
      <AnimatePresence>
        {tierFlash && (
          <motion.div
            key={tierFlash}
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.55, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              background:
                tierFlash === 'lethal'
                  ? 'radial-gradient(circle at 50% 40%, hsl(0 65% 50% / 0.55), transparent 65%)'
                  : tierFlash === 'warn'
                  ? 'radial-gradient(circle at 50% 40%, hsl(50 75% 55% / 0.45), transparent 65%)'
                  : 'radial-gradient(circle at 50% 40%, hsl(170 50% 50% / 0.4), transparent 65%)',
            }}
          />
        )}
      </AnimatePresence>
      <div className="flex items-center justify-between">
        <div className="group relative flex items-center gap-1.5 min-w-0 flex-1 max-w-[180px]">
          <input
            value={player.name}
            onChange={(e) => update({ name: e.target.value })}
            onBlur={(e) => {
              if (!e.target.value.trim()) {
                update({ name: defaultName })
              }
            }}
            placeholder={defaultName}
            aria-label="Player name (tap to rename)"
            className="font-display tracking-wide text-base bg-transparent outline-none w-full pb-0.5 border-b border-dotted border-[hsl(42_75%_55%/0.35)] hover:border-[hsl(42_75%_55%/0.7)] focus:border-solid focus:border-[hsl(42_75%_55%)] transition-colors placeholder:text-[hsl(38_30%_88%/0.4)]"
            data-testid={`input-name-${player.id}`}
          />
          <Pencil
            className="w-3 h-3 text-[hsl(42_75%_55%)] opacity-0 group-hover:opacity-50 group-focus-within:opacity-70 transition-opacity flex-shrink-0"
            strokeWidth={2}
          />
        </div>
        <div className="flex items-center gap-1">
          {enabledCounters.includes('cmd') && opponents.length > 0 && (
            <button
              onClick={() => setShowBadge(showBadge === 'cmd' ? null : 'cmd')}
              className={`px-1.5 py-0.5 rounded text-[10px] tracking-wider border ${badgeColor(maxCmd, 21, 14)}`}
              data-testid={`badge-cmd-${player.id}`}
              aria-label={`Commander damage: highest single source ${maxCmd}`}
            >
              CMD {maxCmd}
            </button>
          )}
          {enabledCounters.includes('poison') && (
            <button
              onClick={() => setShowBadge(showBadge === 'poison' ? null : 'poison')}
              className={`p-1 rounded border ${badgeColor(player.poison, 10, 6)}`}
              data-testid={`badge-poison-${player.id}`}
              aria-label="Poison"
            >
              <Skull className="w-3.5 h-3.5" />
              <span className="sr-only">{player.poison}</span>
            </button>
          )}
          {enabledCounters.includes('mana') && (
            <button
              onClick={() => setShowBadge(showBadge === 'mana' ? null : 'mana')}
              className={`p-1 rounded border ${
                player.mana > 0
                  ? 'text-[hsl(200_60%_60%)] border-[hsl(200_60%_50%/0.4)] bg-[hsl(200_60%_50%/0.10)]'
                  : 'text-muted-foreground border-border bg-muted'
              }`}
              data-testid={`badge-mana-${player.id}`}
            >
              <Droplet className="w-3.5 h-3.5" />
            </button>
          )}
          {enabledCounters.includes('energy') && (
            <button
              onClick={() => setShowBadge(showBadge === 'energy' ? null : 'energy')}
              className={`p-1 rounded border ${
                player.energy > 0
                  ? 'text-[hsl(50_75%_60%)] border-[hsl(50_75%_50%/0.4)] bg-[hsl(50_75%_50%/0.10)]'
                  : 'text-muted-foreground border-border bg-muted'
              }`}
              data-testid={`badge-energy-${player.id}`}
            >
              <Zap className="w-3.5 h-3.5" />
            </button>
          )}
          {enabledCounters.includes('experience') && (
            <button
              onClick={() => setShowBadge(showBadge === 'experience' ? null : 'experience')}
              className={`p-1 rounded border ${
                player.experience > 0
                  ? 'text-[hsl(270_50%_70%)] border-[hsl(270_40%_55%/0.4)] bg-[hsl(270_40%_55%/0.10)]'
                  : 'text-muted-foreground border-border bg-muted'
              }`}
              data-testid={`badge-exp-${player.id}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="my-5 text-center relative">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={player.life}
            initial={{ y: lastDelta < 0 ? -18 : 18, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: lastDelta < 0 ? 14 : -14, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22, mass: 0.7 }}
            className={`font-display text-7xl md:text-8xl tabular-nums ${lifeCls}`}
            data-testid={`life-${player.id}`}
          >
            {player.life}
          </motion.div>
        </AnimatePresence>
        {/* Floating delta indicator (+1 / -3) that drifts up & fades */}
        <AnimatePresence>
          {lastDelta !== 0 && (
            <motion.div
              key={`${player.id}-delta-${player.life}`}
              aria-hidden
              initial={{ opacity: 0, y: 0, scale: 0.85 }}
              animate={{ opacity: [0, 1, 0], y: lastDelta < 0 ? 22 : -22, scale: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className={`absolute left-1/2 -translate-x-1/2 top-1/2 font-display text-2xl tabular-nums pointer-events-none ${
                lastDelta < 0 ? 'text-[hsl(0_70%_60%)]' : 'text-[hsl(170_55%_60%)]'
              }`}
              style={{
                textShadow:
                  lastDelta < 0 ? '0 0 14px hsl(0 65% 50% / 0.6)' : '0 0 14px hsl(170 50% 45% / 0.6)',
              }}
            >
              {lastDelta > 0 ? `+${lastDelta}` : lastDelta}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="font-display tracking-[0.2em] uppercase text-[10px] text-muted-foreground">Life</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <BigButton onClick={() => bump('life', -1, -999)} variant="minus" testid={`life-minus-${player.id}`} />
        <BigButton onClick={() => bump('life', +1, -999)} variant="plus" testid={`life-plus-${player.id}`} />
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <button
          onClick={() => bump('life', -5, -999)}
          className="panel hover-elevate active-elevate-2 py-2 text-sm text-muted-foreground"
          data-testid={`life-minus5-${player.id}`}
        >
          −5
        </button>
        <button
          onClick={() => bump('life', +5, -999)}
          className="panel hover-elevate active-elevate-2 py-2 text-sm text-muted-foreground"
          data-testid={`life-plus5-${player.id}`}
        >
          +5
        </button>
      </div>

      <AnimatePresence>
        {showBadge === 'cmd' && opponents.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-3"
            data-testid={`cmd-grid-${player.id}`}
          >
            <div className="panel p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-display tracking-wide text-sm">Commander Damage</div>
                <div className="text-[10px] text-muted-foreground tracking-[0.18em] uppercase">21 lethal · per source</div>
              </div>
              <div
                className={`grid gap-2 ${
                  opponents.length <= 1
                    ? 'grid-cols-1'
                    : opponents.length === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-2 sm:grid-cols-3'
                }`}
              >
                {opponents.map((opp) => {
                  const amt = cmdFrom[opp.id] ?? 0
                  const cellLethal = amt >= 21
                  const cellWarn = amt >= 14 && amt < 21
                  const cellCls = cellLethal
                    ? 'border-destructive/60 bg-destructive/10 text-destructive'
                    : cellWarn
                    ? 'border-[hsl(50_75%_50%/0.5)] bg-[hsl(50_75%_50%/0.10)] text-[hsl(50_75%_60%)]'
                    : 'border-border bg-muted/40 text-foreground'
                  return (
                    <div
                      key={opp.id}
                      className={`rounded-md border p-2 flex flex-col items-center gap-1 ${cellCls}`}
                      data-testid={`cmd-cell-${player.id}-from-${opp.id}`}
                      data-cmd-amount={amt}
                      data-cmd-lethal={cellLethal ? 'true' : 'false'}
                    >
                      <div
                        className="text-[10px] tracking-wider uppercase truncate max-w-full"
                        title={opp.name}
                      >
                        {opp.name}
                      </div>
                      <div className="font-display text-2xl tabular-nums leading-none">
                        {amt}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <button
                          onClick={() => bumpCmdFrom(opp.id, -1)}
                          className="w-7 h-7 grid place-items-center panel hover-elevate active-elevate-2"
                          data-testid={`cmd-minus-${player.id}-from-${opp.id}`}
                          aria-label={`Decrease commander damage from ${opp.name}`}
                          disabled={amt <= 0}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => bumpCmdFrom(opp.id, +1)}
                          className="w-7 h-7 grid place-items-center panel hover-elevate active-elevate-2"
                          data-testid={`cmd-plus-${player.id}-from-${opp.id}`}
                          aria-label={`Increase commander damage from ${opp.name}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              {lethalFromCmd && (
                <div
                  className="mt-2 text-[11px] font-display tracking-wider uppercase text-destructive text-center"
                  data-testid={`cmd-lethal-${player.id}`}
                >
                  Lethal · 21 commander damage
                </div>
              )}
            </div>
          </motion.div>
        )}
        {showBadge && showBadge !== 'cmd' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-3"
          >
            <div className="panel p-3 flex items-center justify-between">
              <div className="text-sm">
                <div className="font-display tracking-wide capitalize">{showBadge}</div>
                <div className="text-xs text-muted-foreground">Tap +/- to adjust</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => bump(showBadge as keyof Player, -1)}
                  className="w-8 h-8 grid place-items-center panel hover-elevate active-elevate-2"
                  data-testid={`${showBadge}-minus-${player.id}`}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-display text-xl w-8 text-center">{(player as any)[showBadge]}</span>
                <button
                  onClick={() => bump(showBadge as keyof Player, +1)}
                  className="w-8 h-8 grid place-items-center panel hover-elevate active-elevate-2"
                  data-testid={`${showBadge}-plus-${player.id}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function BigButton({
  onClick,
  variant,
  testid,
}: {
  onClick: () => void
  variant: 'plus' | 'minus'
  testid: string
}) {
  // Each tap spawns a short-lived ripple that radiates from the tap point
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const id = Date.now() + Math.random()
    setRipples((rs) => [...rs, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    setTimeout(() => setRipples((rs) => rs.filter((r) => r.id !== id)), 600)
    onClick()
  }

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.08 }}
      data-testid={testid}
      aria-label={variant === 'minus' ? 'Decrease life' : 'Increase life'}
      className={`relative h-20 md:h-24 rounded-md font-display text-3xl flex items-center justify-center overflow-hidden
        ${variant === 'minus'
          ? 'bg-[hsl(0_60%_30%)] text-[hsl(0_30%_92%)] hover:bg-[hsl(0_60%_34%)]'
          : 'bg-[hsl(170_50%_28%)] text-[hsl(170_30%_92%)] hover:bg-[hsl(170_50%_32%)]'}`}
    >
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            aria-hidden
            initial={{ opacity: 0.55, scale: 0 }}
            animate={{ opacity: 0, scale: 4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: r.x - 20,
              top: r.y - 20,
              width: 40,
              height: 40,
              background:
                variant === 'minus'
                  ? 'radial-gradient(circle, hsl(0 70% 65% / 0.5), transparent 70%)'
                  : 'radial-gradient(circle, hsl(170 60% 70% / 0.5), transparent 70%)',
            }}
          />
        ))}
      </AnimatePresence>
      {variant === 'minus' ? <Minus className="w-7 h-7 relative" strokeWidth={2.4} /> : <Plus className="w-7 h-7 relative" strokeWidth={2.4} />}
    </motion.button>
  )
}

function Tip() {
  const [open, setOpen] = useState(true)
  if (!open) return null
  return (
    <div className="mt-6 panel p-3 flex items-start gap-3 text-sm">
      <Eye className="w-4 h-4 text-primary mt-0.5" />
      <div className="flex-1">
        <span className="font-display tracking-wide text-primary">Tip</span>
        <span className="text-muted-foreground"> — Tap the CMD/poison/mana badges on a player to track that counter inline.</span>
      </div>
      <button
        onClick={() => setOpen(false)}
        className="text-xs text-muted-foreground hover:text-foreground"
        data-testid="button-dismiss-tip"
      >
        Got it
      </button>
    </div>
  )
}

const NAME_HINT_KEY = 'thestack:seen-name-hint'

function NameHint({ multi }: { multi: boolean }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!multi) return
    if (typeof window === 'undefined') return
    try {
      if (localStorage.getItem(NAME_HINT_KEY)) return
    } catch {
      return
    }
    setOpen(true)
    const t = setTimeout(() => {
      setOpen(false)
      try { localStorage.setItem(NAME_HINT_KEY, '1') } catch {}
    }, 8000)
    return () => clearTimeout(t)
  }, [multi])
  function dismiss() {
    setOpen(false)
    try { localStorage.setItem(NAME_HINT_KEY, '1') } catch {}
  }
  if (!open) return null
  return (
    <div className="mt-3 panel p-3 flex items-start gap-3 text-sm" data-testid="hint-rename">
      <Pencil className="w-4 h-4 text-primary mt-0.5" />
      <div className="flex-1">
        <span className="font-display tracking-wide text-primary">Rename</span>
        <span className="text-muted-foreground"> — Tap any player’s name to rename them. Empty names snap back.</span>
      </div>
      <button
        onClick={dismiss}
        className="text-xs text-muted-foreground hover:text-foreground"
        data-testid="button-dismiss-name-hint"
      >
        Got it
      </button>
    </div>
  )
}
