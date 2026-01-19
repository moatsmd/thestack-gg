'use client'

import Link from 'next/link'
import { HamburgerMenu } from '@/components/HamburgerMenu'

const QUICK_LINKS = [
  { href: '/stack', label: 'Stack Visualizer' },
  { href: '/rules', label: 'Card Rulings + Rules' },
  { href: '/glossary', label: 'Keyword Glossary' },
  { href: '/tracker', label: 'Life Tracker' },
]

const GUIDE_MODULES = [
  {
    title: 'Basics',
    summary: 'Turn structure, card types, and zones.',
    href: '/new-players/basics',
  },
  {
    title: 'Combat',
    summary: 'Attacking, blocking, damage, and common keywords.',
    href: '/new-players/combat',
  },
  {
    title: 'Stack and Priority',
    summary: 'Responding to spells and resolving in LIFO order.',
    href: '/new-players/stack',
  },
]

const LEARNING_TIPS = [
  'Say your actions out loud to confirm timing with the table.',
  'If you are unsure, pause and check the rules or glossary.',
  'Use tokens or dice to track counters and temporary effects.',
  'Focus on one step at a time; the stack will handle the rest.',
]

export default function NewPlayersPage() {
  return (
    <div className="min-h-screen arcane-shell text-[var(--ink)]">
      <div className="fixed top-4 right-4 z-10">
        <HamburgerMenu />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
        <header className="arcane-panel mana-border rounded-3xl px-6 py-10 md:px-10 md:py-12">
          <p className="text-xs uppercase tracking-[0.5em] text-[var(--muted)]">
            New player guide
          </p>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold text-[var(--ink)]">
            Learn Magic the Gathering
          </h1>
          <div className="frame-divider mt-4 w-24" />
          <p className="mt-4 max-w-2xl text-lg text-[var(--muted)]">
            A fast, table-ready introduction to core rules, turn flow, and combat. Use
            these sections alongside the stack visualizer and rules lookup to build
            confidence while you play.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="min-h-tap rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/5 transition"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {GUIDE_MODULES.map((module) => (
            <Link
              key={module.title}
              href={module.href}
              className="arcane-panel mana-border rounded-2xl p-6 space-y-3 hover:bg-white/5 transition"
            >
              <h2 className="text-2xl font-semibold text-[var(--ink)]">{module.title}</h2>
              <p className="text-sm text-[var(--muted)]">{module.summary}</p>
              <span className="text-sm font-semibold text-[var(--accent-2)]">Open guide →</span>
            </Link>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="arcane-panel mana-border rounded-2xl p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-[var(--ink)]">First Game Checklist</h2>
            <div className="frame-divider w-20" />
            <div className="grid gap-3 md:grid-cols-2 text-sm text-[var(--muted)]">
              <div className="rounded-xl border border-white/10 p-4">
                Start at 20 life (Commander uses 40).
              </div>
              <div className="rounded-xl border border-white/10 p-4">
                Shuffle, draw 7 cards, take a free mulligan if needed.
              </div>
              <div className="rounded-xl border border-white/10 p-4">
                Play one land per turn, cast spells with your mana.
              </div>
              <div className="rounded-xl border border-white/10 p-4">
                Announce attacks and blocks clearly.
              </div>
            </div>
          </div>

          <div className="arcane-panel-soft mana-border rounded-2xl p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-[var(--ink)]">Learning Tips</h2>
            <div className="frame-divider w-16" />
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              {LEARNING_TIPS.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-2)]" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="arcane-panel mana-border rounded-2xl p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-[var(--ink)]">Practice With Tools</h2>
          <div className="frame-divider w-20" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/stack"
              className="rounded-xl border border-white/10 p-4 text-sm text-[var(--muted)] hover:bg-white/5 transition"
            >
              Learn priority and LIFO resolution with the stack visualizer.
            </Link>
            <Link
              href="/rules"
              className="rounded-xl border border-white/10 p-4 text-sm text-[var(--muted)] hover:bg-white/5 transition"
            >
              Search the comprehensive rules when a timing question comes up.
            </Link>
            <Link
              href="/glossary"
              className="rounded-xl border border-white/10 p-4 text-sm text-[var(--muted)] hover:bg-white/5 transition"
            >
              Look up keywords like trample, vigilance, and ward.
            </Link>
            <Link
              href="/tracker"
              className="rounded-xl border border-white/10 p-4 text-sm text-[var(--muted)] hover:bg-white/5 transition"
            >
              Track life totals and counters during your first game.
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
