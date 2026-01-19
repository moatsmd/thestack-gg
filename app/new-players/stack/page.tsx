'use client'

import Link from 'next/link'
import { HamburgerMenu } from '@/components/HamburgerMenu'

const STACK_POINTS = [
  'Spells and abilities go on the stack.',
  'Last in, first out: the newest item resolves first.',
  'Players pass priority around the table.',
  'If everyone passes, the top item resolves.',
]

const EXAMPLES = [
  'Player A casts a spell.',
  'Player B responds with an instant.',
  'Player A responds again.',
  'Resolve in reverse order.',
]

const STACK_TERMS = [
  {
    term: 'Priority',
    definition: 'Permission to cast a spell or activate an ability.',
  },
  {
    term: 'Respond',
    definition: 'Add another spell or ability to the stack before the top resolves.',
  },
  {
    term: 'Resolve',
    definition: 'The top stack item finishes and its effect happens.',
  },
  {
    term: 'Active player',
    definition: 'The player whose turn it is.',
  },
]

export default function NewPlayersStackPage() {
  return (
    <div className="min-h-screen arcane-shell text-[var(--ink)]">
      <div className="fixed top-4 right-4 z-10">
        <HamburgerMenu />
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
        <header className="arcane-panel mana-border rounded-3xl px-6 py-8">
          <p className="text-xs uppercase tracking-[0.5em] text-[var(--muted)]">New players</p>
          <h1 className="mt-3 text-4xl font-semibold text-[var(--ink)]">Stack and Priority</h1>
          <div className="frame-divider mt-4 w-20" />
          <p className="mt-4 text-[var(--muted)]">
            The stack is the heart of interaction. Learn how responses resolve.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="arcane-panel mana-border rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-[var(--ink)]">Core Rules</h2>
            <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              {STACK_POINTS.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-3)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="arcane-panel mana-border rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-[var(--ink)]">Example</h2>
            <ol className="mt-4 space-y-2 text-sm text-[var(--muted)] list-decimal list-inside">
              {EXAMPLES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <Link
              href="/stack"
              className="mt-4 inline-flex min-h-tap rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/5 transition"
            >
              Practice in the Stack Visualizer
            </Link>
          </div>
        </section>

        <section className="arcane-panel mana-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-[var(--ink)]">Stack Terms</h2>
          <div className="frame-divider mt-3 w-16" />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {STACK_TERMS.map((item) => (
              <div key={item.term} className="rounded-xl border border-white/10 p-4">
                <p className="text-sm font-semibold text-[var(--ink)]">{item.term}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{item.definition}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Practice responses with the stack visualizer to see the order.
          </p>
          <Link
            href="/stack"
            className="mt-3 inline-flex min-h-tap rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/5 transition"
          >
            Open Stack Visualizer
          </Link>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/new-players/combat"
            className="min-h-tap rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/5 transition"
          >
            Back: Combat
          </Link>
          <Link
            href="/new-players"
            className="min-h-tap rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/5 transition"
          >
            Back to guide
          </Link>
        </div>
      </div>
    </div>
  )
}
