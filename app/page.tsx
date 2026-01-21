'use client'

import Link from 'next/link'
import { NewsSection } from '@/components/NewsSection'
import { useNews } from '@/hooks/useNews'

export default function Home() {
  const { items, isLoading, error } = useNews()

  return (
    <div className="relative min-h-screen overflow-hidden arcane-shell px-4 py-10 text-[var(--ink)]">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-70 arcane-sigil float-slower" />
      <div className="pointer-events-none absolute top-32 right-[-40px] h-56 w-56 rounded-full bg-[var(--accent-2)]/20 blur-3xl float-slow" />
      <div className="pointer-events-none absolute bottom-10 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--accent-3)]/20 blur-3xl float-slower" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="arcane-panel mana-border rounded-3xl px-6 py-10 md:px-10 md:py-12 reveal">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.5em] text-[var(--muted)]">
                Vault of the stack
              </p>
              <h1 className="text-5xl md:text-6xl font-semibold text-[var(--ink)]">
                TheStack.gg
              </h1>
              <div className="frame-divider w-24" />
              <p className="max-w-xl text-lg text-[var(--muted)]">
                Command your table with dark-mode tools for life totals, rules, and spell
                sequencing.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/tracker"
            className="tool-card arcane-glow reveal reveal-delay-1 rounded-2xl p-6 min-h-tap transition hover:-translate-y-1"
            style={{ ['--accent' as string]: 'var(--accent-1)' }}
          >
            <div className="flex items-center justify-between">
              <span className="tool-accent h-10 w-10 rounded-full shadow-[0_0_18px_rgba(214,178,90,0.45)]" />
              <span className="text-[10px] uppercase tracking-[0.35em] text-[var(--muted)]">
                Core
              </span>
            </div>
            <h2 className="mt-6 text-3xl font-semibold text-[var(--ink)]">Life Tracker</h2>
            <div className="frame-divider mt-3 w-16" />
            <p className="mt-3 text-sm text-[var(--muted)]">
              Life totals, commander damage, and poison counters in one obsidian console.
            </p>
            <p className="mt-6 text-sm font-semibold text-[var(--accent-1)]">Enter tool →</p>
          </Link>

          <Link
            href="/toolkit"
            className="tool-card arcane-glow reveal reveal-delay-2 rounded-2xl p-6 min-h-tap transition hover:-translate-y-1"
            style={{ ['--accent' as string]: 'var(--accent-2)' }}
          >
            <div className="flex items-center justify-between">
              <span className="tool-accent h-10 w-10 rounded-full shadow-[0_0_18px_rgba(63,183,194,0.45)]" />
              <span className="text-[10px] uppercase tracking-[0.35em] text-[var(--muted)]">
                Search
              </span>
            </div>
            <h2 className="mt-6 text-3xl font-semibold text-[var(--ink)]">Card Lookup</h2>
            <div className="frame-divider mt-3 w-16" />
            <p className="mt-3 text-sm text-[var(--muted)]">
              Summon oracle text, rulings, and legality with fast Scryfall queries.
            </p>
            <p className="mt-6 text-sm font-semibold text-[var(--accent-2)]">Enter tool →</p>
          </Link>

          <Link
            href="/glossary"
            className="tool-card arcane-glow reveal reveal-delay-3 rounded-2xl p-6 min-h-tap transition hover:-translate-y-1"
            style={{ ['--accent' as string]: 'var(--accent-3)' }}
          >
            <div className="flex items-center justify-between">
              <span className="tool-accent h-10 w-10 rounded-full shadow-[0_0_18px_rgba(193,79,74,0.45)]" />
              <span className="text-[10px] uppercase tracking-[0.35em] text-[var(--muted)]">
                Learn
              </span>
            </div>
            <h2 className="mt-6 text-3xl font-semibold text-[var(--ink)]">Keywords Glossary</h2>
            <div className="frame-divider mt-3 w-16" />
            <p className="mt-3 text-sm text-[var(--muted)]">
              Immediate references for abilities, reminder text, and edge cases.
            </p>
            <p className="mt-6 text-sm font-semibold text-[var(--accent-3)]">Enter tool →</p>
          </Link>

          <Link
            href="/new-players"
            className="tool-card arcane-glow reveal reveal-delay-3 rounded-2xl p-6 min-h-tap transition hover:-translate-y-1"
            style={{ ['--accent' as string]: 'var(--accent-4)' }}
          >
            <div className="flex items-center justify-between">
              <span className="tool-accent h-10 w-10 rounded-full shadow-[0_0_18px_rgba(123,105,255,0.45)]" />
              <span className="text-[10px] uppercase tracking-[0.35em] text-[var(--muted)]">
                Learn
              </span>
            </div>
            <h2 className="mt-6 text-3xl font-semibold text-[var(--ink)]">New Players</h2>
            <div className="frame-divider mt-3 w-16" />
            <p className="mt-3 text-sm text-[var(--muted)]">
              A guided primer on turn flow, combat, and the stack.
            </p>
            <p className="mt-6 text-sm font-semibold text-[var(--accent-4)]">Enter guide →</p>
          </Link>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="arcane-panel mana-border rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Mana feed</p>
                <h3 className="text-2xl font-semibold text-[var(--ink)]">Latest MTG News</h3>
                <div className="frame-divider mt-3 w-16" />
              </div>
              <div className="hidden md:block text-sm text-[var(--muted)]">
                Updated daily
              </div>
            </div>
            <div className="mt-6">
              <NewsSection items={items} isLoading={isLoading} error={error} />
            </div>
          </div>

          <div className="arcane-panel-soft mana-border rounded-2xl p-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Coming soon</p>
            <h3 className="text-2xl font-semibold text-[var(--ink)]">Next on the stack</h3>
            <ul className="space-y-3 text-sm text-[var(--muted)]">
              <li>Deck tracking with commander sync</li>
              <li>Stack visualizer presets per pod</li>
              <li>Offline rules and glossary packs</li>
            </ul>
            <div className="rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-[var(--muted)]">
              New tools arrive with each set release.
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
