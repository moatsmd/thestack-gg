'use client'

import Link from 'next/link'
import { HamburgerMenu } from '@/components/HamburgerMenu'

const BASICS = [
  {
    title: 'Turn Flow',
    bullets: [
      'Untap → Upkeep → Draw (ready your cards, then handle upkeep triggers, then draw).',
      'Main phase: play a land and cast sorceries/creatures.',
      'Combat: declare attackers, then blockers, then damage.',
      'Second main phase, then end step and cleanup.',
    ],
  },
  {
    title: 'Card Types',
    bullets: [
      'Lands: one per turn, make mana.',
      'Creatures: attack and block.',
      'Instants: can be cast with priority any time.',
      'Sorceries: cast in main phase when the stack is empty.',
      'Enchantments/Artifacts: permanents that stay on the battlefield.',
    ],
  },
  {
    title: 'Zones',
    bullets: [
      'Library → Hand → Stack → Battlefield → Graveyard.',
      'Exile is a separate zone, usually hard to retrieve from.',
      'Tokens live on the battlefield and disappear when they leave.',
    ],
  },
]

const CORE_TERMS = [
  {
    term: 'Tap',
    definition: 'Rotate a card sideways to show it is used this turn.',
  },
  {
    term: 'Untap',
    definition: 'Return a card to upright; it is ready to use again.',
  },
  {
    term: 'Permanent',
    definition: 'A card that stays on the battlefield (creature, land, artifact, enchantment).',
  },
  {
    term: 'Spell',
    definition: 'A card cast from hand that goes on the stack (not a land).',
  },
]

export default function NewPlayersBasicsPage() {
  return (
    <div className="min-h-screen arcane-shell text-[var(--ink)]">
      <div className="fixed top-4 right-4 z-10">
        <HamburgerMenu />
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
        <header className="arcane-panel mana-border rounded-3xl px-6 py-8">
          <p className="text-xs uppercase tracking-[0.5em] text-[var(--muted)]">New players</p>
          <h1 className="mt-3 text-4xl font-semibold text-[var(--ink)]">Basics</h1>
          <div className="frame-divider mt-4 w-20" />
          <p className="mt-4 text-[var(--muted)]">
            Start here for turn structure, card types, and the most important zones.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {BASICS.map((section) => (
            <div key={section.title} className="arcane-panel mana-border rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-[var(--ink)]">{section.title}</h2>
              <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-1)]" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="arcane-panel mana-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-[var(--ink)]">Core Terms</h2>
          <div className="frame-divider mt-3 w-16" />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {CORE_TERMS.map((item) => (
              <div key={item.term} className="rounded-xl border border-white/10 p-4">
                <p className="text-sm font-semibold text-[var(--ink)]">{item.term}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{item.definition}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Want more? Open the full keyword glossary for deeper rules text.
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
            href="/new-players"
            className="min-h-tap rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/5 transition"
          >
            Back to guide
          </Link>
          <Link
            href="/new-players/combat"
            className="min-h-tap rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/5 transition"
          >
            Next: Combat
          </Link>
        </div>
      </div>
    </div>
  )
}
