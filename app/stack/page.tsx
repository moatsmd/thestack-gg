'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Fleuron, GoldRule } from '@/components/Fleuron'

const sequence = [
  'Player A casts Lightning Bolt targeting Player B (3 dmg).',
  'Player B responds with Counterspell targeting Lightning Bolt.',
  'Player A responds with Red Elemental Blast targeting Counterspell.',
  'Stack resolves top to bottom.',
  'Red Elemental Blast resolves: Counterspell is countered.',
  'Counterspell is removed without effect.',
  'Lightning Bolt resolves: Player B takes 3 damage.',
]

type StackEntry = { id: number; text: string }

export default function StackPage() {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setStep((s) => (s + 1) % sequence.length), 2200)
    return () => clearInterval(id)
  }, [playing])

  let stack: StackEntry[] = []
  if (step < 3) {
    stack = sequence.slice(0, step + 1).map((s, i) => ({
      id: i,
      text: s
        .replace(/^Player [AB] (casts|responds with) /, '')
        .replace(/ targeting.*$/, ''),
    }))
  } else if (step === 4) {
    stack = [
      { id: 0, text: 'Lightning Bolt' },
      { id: 1, text: 'Counterspell' },
    ]
  } else if (step === 5 || step === 6) {
    stack = [{ id: 0, text: 'Lightning Bolt' }]
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 pt-6 md:pt-12">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center">
          <GoldRule />
        </div>
        <h1 className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)] mt-3">
          Last In, First Out
        </h1>
        <p className="font-display text-gold-gradient text-3xl md:text-5xl mt-3 tracking-wide">
          The Stack
        </p>
        <p className="font-prose italic text-[hsl(38_30%_88%/0.85)] mt-1">
          Spells resolve in reverse — the last cast is the first to land.
        </p>
      </header>

      <div className="grid md:grid-cols-[320px_1fr] gap-6">
        <div className="panel codex-glow panel-gilded p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-display tracking-[0.18em] uppercase text-[10px] text-[hsl(38_15%_60%)]">
              The Stack
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="panel hover-elevate p-1.5 inline-flex items-center justify-center text-[hsl(38_30%_88%)]"
                aria-label={playing ? 'Pause' : 'Play'}
                data-testid="button-play"
              >
                {playing ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={() => setStep(0)}
                className="panel hover-elevate p-1.5 inline-flex items-center justify-center text-[hsl(38_30%_88%)]"
                aria-label="Reset"
                data-testid="button-reset-stack"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </button>
            </div>
          </div>

          <div className="relative h-72">
            <AnimatePresence>
              {stack.length === 0 ? (
                <motion.div
                  key="empty"
                  className="absolute inset-0 grid place-items-center text-[hsl(38_15%_60%)] text-sm font-prose italic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  The stack is empty.
                </motion.div>
              ) : (
                stack.map((item, idx) => (
                  <motion.div
                    key={`${step}-${item.id}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: idx * 56 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.35 }}
                    className={`absolute left-0 right-0 panel-elevated p-3 rounded-md border ${
                      idx === 0
                        ? 'border-[hsl(42_75%_55%/0.6)] codex-glow-strong'
                        : 'border-[hsl(40_30%_22%)]'
                    }`}
                  >
                    <div className="font-display text-sm tracking-wide text-[hsl(38_30%_88%)]">
                      {item.text}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[hsl(38_15%_60%)] mt-0.5">
                      {idx === 0
                        ? 'Top — resolves next'
                        : `Position ${stack.length - idx}`}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[hsl(38_15%_60%)]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
            Cast adds to top
            <span>·</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            Resolves top first
          </div>
        </div>

        <div className="panel p-6" data-testid="priority-flow">
          <h3 className="font-display text-lg tracking-wide text-[hsl(38_30%_88%)]">
            Sequence
          </h3>
          <span className="block w-7 h-px bg-[hsl(42_75%_55%/0.4)] mt-2 mb-4" />
          <ol className="space-y-2 text-sm">
            {sequence.map((s, i) => (
              <li
                key={i}
                className={`p-3 rounded-md border ${
                  i === step
                    ? 'border-[hsl(42_75%_55%/0.6)] bg-[hsl(42_75%_55%/0.05)]'
                    : 'border-[hsl(40_30%_20%)] bg-[hsl(220_15%_10%/0.4)]'
                }`}
              >
                <span className="font-display tracking-wider text-[10px] uppercase text-[hsl(38_15%_60%)] mr-2">
                  {i + 1}
                </span>
                <span
                  className={
                    i === step
                      ? 'text-[hsl(38_30%_88%)]'
                      : 'text-[hsl(38_30%_88%/0.8)]'
                  }
                >
                  {s}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <Fleuron />

      <section
        className="grid md:grid-cols-3 gap-4"
        data-testid="key-rules"
      >
        <RuleCard
          title="Priority"
          body="Players take turns receiving priority. The active player gets it first each step. You may only cast spells or activate abilities while you have priority."
        />
        <RuleCard
          title="LIFO Resolution"
          body="The stack is last-in, first-out. The most recently cast spell or activated ability resolves first."
        />
        <RuleCard
          title="Pass to Resolve"
          body="When all players pass priority in succession with no spells or abilities being added, the top of the stack resolves."
        />
      </section>

      <Fleuron />

      <section
        className="grid md:grid-cols-3 gap-4 mb-12"
        data-testid="scenarios"
      >
        <RuleCard
          title="Counterspell on your spell"
          body="Counterspell goes on top. You still have priority and can cast another spell or ability before it resolves."
        />
        <RuleCard
          title="Triggered ability"
          body="The trigger goes on the stack and both players receive priority before it resolves. Either player can respond."
        />
        <RuleCard
          title="Two spells in a row"
          body="The second spell goes on top of the first. Your second spell resolves first, then your first spell resolves."
        />
      </section>
    </div>
  )
}

function RuleCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="panel p-5">
      <h4 className="font-display text-base tracking-wide text-[hsl(38_30%_88%)]">
        {title}
      </h4>
      <span className="block w-6 h-px bg-[hsl(42_75%_55%/0.4)] mt-1.5 mb-2" />
      <p className="font-prose text-[hsl(38_30%_88%/0.85)] text-base leading-snug">
        {body}
      </p>
    </div>
  )
}
