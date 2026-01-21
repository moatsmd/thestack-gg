'use client'

import Link from 'next/link'


const COMBAT_FLOW = [
  'Declare attackers (tap attackers).',
  'Declare blockers (defender assigns).',
  'Combat damage (first strike, then regular).',
  'Creatures with lethal damage are destroyed.',
]

const KEY_CONCEPTS = [
  'Creatures without summoning sickness can attack or tap for abilities.',
  'Combat tricks are instants cast before damage.',
  'Trample assigns lethal to blockers, then the rest to the player.',
  'Vigilance means attacking without tapping.',
  'First strike deals damage before regular damage.',
]

const COMBAT_TERMS = [
  {
    term: 'Summoning sickness',
    definition: 'A creature cannot attack or tap the turn it enters unless it has haste.',
  },
  {
    term: 'Declare attackers',
    definition: 'The attacking player chooses all attackers at once.',
  },
  {
    term: 'Declare blockers',
    definition: 'Defending player assigns blockers after attackers are declared.',
  },
  {
    term: 'Lethal damage',
    definition: 'Damage equal to a creature’s toughness destroys it after damage.',
  },
]

export default function NewPlayersCombatPage() {
  return (
    <div className="min-h-screen arcane-shell text-[var(--ink)]">

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
        <header className="arcane-panel mana-border rounded-3xl px-6 py-8">
          <p className="text-xs uppercase tracking-[0.5em] text-[var(--muted)]">New players</p>
          <h1 className="mt-3 text-4xl font-semibold text-[var(--ink)]">Combat</h1>
          <div className="frame-divider mt-4 w-20" />
          <p className="mt-4 text-[var(--muted)]">
            Combat is a clear sequence. Announce it so the table can respond.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="arcane-panel mana-border rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-[var(--ink)]">Combat Flow</h2>
            <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              {COMBAT_FLOW.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-2)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="arcane-panel mana-border rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-[var(--ink)]">Key Concepts</h2>
            <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              {KEY_CONCEPTS.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-1)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="arcane-panel mana-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-[var(--ink)]">Combat Terms</h2>
          <div className="frame-divider mt-3 w-16" />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {COMBAT_TERMS.map((item) => (
              <div key={item.term} className="rounded-xl border border-white/10 p-4">
                <p className="text-sm font-semibold text-[var(--ink)]">{item.term}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{item.definition}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-[var(--muted)]">
            If a term is unfamiliar, cross-check it in the glossary.
          </p>
          <Link
            href="/glossary"
            className="mt-3 inline-flex min-h-tap rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/5 transition"
          >
            Open Glossary
          </Link>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/new-players/basics"
            className="min-h-tap rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/5 transition"
          >
            Back: Basics
          </Link>
          <Link
            href="/new-players/stack"
            className="min-h-tap rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/5 transition"
          >
            Next: Stack and Priority
          </Link>
        </div>
      </div>
    </div>
  )
}
