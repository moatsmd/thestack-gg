'use client'

import Link from 'next/link'
import { Fleuron, GoldRule } from '@/components/Fleuron'

const sections = [
  {
    title: 'Basics',
    blurb: 'Turn structure, card types, zones — the bones of the game.',
    bullets: [
      'Turn phases: Beginning · Main 1 · Combat · Main 2 · End',
      'Zones: Library, Hand, Battlefield, Stack, Graveyard, Exile',
      'Card types: Creature, Artifact, Enchantment, Sorcery, Instant, Land, Planeswalker, Battle',
    ],
    href: '/new-players/basics',
    accent: 'primary',
  },
  {
    title: 'Combat',
    blurb: 'Attack, block, deal damage. The clock you build at the table.',
    bullets: [
      'Declare attackers — they tap unless they have vigilance',
      'Declare blockers — multiple blockers can block one attacker',
      'Combat damage uses power, dealt simultaneously per damage step',
    ],
    href: '/new-players/combat',
    accent: 'crimson',
  },
  {
    title: 'Stack & Priority',
    blurb: 'Spells resolve last-in, first-out. Master priority and you master Magic.',
    bullets: [
      'Active player gets priority first each step',
      'Pass priority to let the top of the stack resolve',
      "Mana abilities don't use the stack — they resolve immediately",
    ],
    href: '/new-players/stack',
    accent: 'purple',
  },
]

const checklist = [
  'Build a 60-card deck (or use a precon)',
  'Shuffle, draw 7, mulligan if needed',
  'Decide who goes first — winner of a coin flip chooses',
  'Untap, upkeep, draw — then play',
  "Track life with TheStack.gg's Life Tracker",
  'Lookup unknown cards with Card Lookup',
]

const tips = [
  'Read the card. Then read it again. Most rules questions are answered on the card.',
  'When in doubt, the active player has priority first in each step.',
  'Tap mana before casting; declare targets last so opponents can respond.',
  'Triggered abilities use "when" or "whenever" — they go on the stack the next time priority is passed.',
]

const accentMap: Record<string, string> = {
  primary: 'text-primary border-primary/30 bg-primary/10',
  crimson: 'text-[hsl(0_70%_60%)] border-[hsl(0_65%_50%/0.3)] bg-[hsl(0_65%_50%/0.10)]',
  purple: 'text-[hsl(270_50%_70%)] border-[hsl(270_40%_55%/0.3)] bg-[hsl(270_40%_55%/0.10)]',
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  )
}
function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  )
}
function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
function DiceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
      <circle cx="16" cy="8" r="1" fill="currentColor" />
      <circle cx="8" cy="16" r="1" fill="currentColor" />
      <circle cx="16" cy="16" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}
function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3z" />
    </svg>
  )
}
function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

export default function NewPlayersPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 pt-6 md:pt-12">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center"><GoldRule /></div>
        <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)] mt-3">First Casts</p>
        <h1 className="font-display text-gold-gradient text-3xl md:text-5xl mt-3 tracking-wide">Learn Magic</h1>
        <p className="font-prose italic text-[hsl(38_30%_88%)]/80 mt-1">A guided primer on turn flow, combat, and the stack.</p>
      </header>

      <article className="panel codex-glow panel-gilded p-6 md:p-10">
        <p className="drop-cap font-prose text-lg md:text-xl text-[hsl(38_30%_88%)]/90 leading-snug">
          Magic: The Gathering is a turn-based duel of resources, timing, and reading the table. You build a deck around a strategy, summon creatures, cast spells, and try to reduce your opponent to zero life — or run them out of cards. The complexity rewards careful sequencing, and the elegance is in the rules.
        </p>
      </article>

      <Fleuron />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="panel codex-glow p-6 hover-elevate block"
            data-testid={`module-${s.title.toLowerCase().replace(/\s/g, '-').replace(/&/g, 'and')}`}
          >
            <span className={`inline-flex w-9 h-9 items-center justify-center rounded-md border ${accentMap[s.accent]}`}>
              {s.title === 'Basics' ? <BookIcon /> : s.title === 'Combat' ? <HeartIcon /> : <LayersIcon />}
            </span>
            <h2 className="font-display text-2xl tracking-wide mt-4 text-[hsl(38_30%_88%)]">{s.title}</h2>
            <span className="block w-7 h-px bg-primary/40 mt-2" />
            <p className="font-prose text-[hsl(38_30%_88%)]/85 text-base leading-snug mt-3">{s.blurb}</p>
            <ul className="mt-4 space-y-1.5 text-sm text-[hsl(38_30%_88%)]/80">
              {s.bullets.map((b) => (
                <li key={b} className="flex gap-2"><span className="text-primary/70 mt-0.5">·</span> {b}</li>
              ))}
            </ul>
            <span className="inline-flex items-center gap-1 mt-4 text-xs font-display tracking-wider text-primary">
              Open guide <ArrowRight />
            </span>
          </Link>
        ))}
      </div>

      <Fleuron />

      <div className="grid md:grid-cols-2 gap-4">
        <section className="panel p-6">
          <h2 className="font-display text-xl tracking-wide text-[hsl(38_30%_88%)]">First Game Checklist</h2>
          <span className="block w-7 h-px bg-primary/40 mt-2 mb-3" />
          <ol className="space-y-2 text-sm">
            {checklist.map((c, i) => (
              <li key={c} className="flex gap-3 panel-elevated p-3">
                <span className="font-display text-primary text-base w-6">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[hsl(38_30%_88%)]/85 flex-1">{c}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="panel p-6">
          <h2 className="font-display text-xl tracking-wide text-[hsl(38_30%_88%)]">Learning Tips</h2>
          <span className="block w-7 h-px bg-primary/40 mt-2 mb-3" />
          <ul className="space-y-3 font-prose text-base text-[hsl(38_30%_88%)]/85">
            {tips.map((t) => (
              <li key={t} className="flex gap-3"><span className="text-primary mt-1.5 flex-shrink-0"><SparkIcon /></span>{t}</li>
            ))}
          </ul>
        </section>
      </div>

      <Fleuron />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-4">
        {[
          { href: '/tracker', label: 'Life Tracker', icon: <HeartIcon /> },
          { href: '/toolkit', label: 'Card Lookup', icon: <SearchIcon /> },
          { href: '/glossary', label: 'Glossary', icon: <BookIcon /> },
          { href: '/dice', label: 'Dice', icon: <DiceIcon /> },
        ].map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className="panel hover-elevate p-4 flex items-center gap-3"
            data-testid={`shortcut-${label.toLowerCase().replace(/\s/g, '-')}`}
          >
            <span className="text-primary">{icon}</span>
            <span className="font-display text-sm flex-1 text-[hsl(38_30%_88%)]">{label}</span>
            <span className="text-[hsl(38_15%_60%)]"><ArrowRight /></span>
          </Link>
        ))}
      </div>
    </div>
  )
}
