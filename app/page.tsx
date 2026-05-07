'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Fleuron, GoldRule } from '@/components/Fleuron'
import { useNews } from '@/hooks/useNews'

const tools = [
  {
    href: '/tracker',
    title: 'Life Tracker',
    kind: 'Core',
    accent: 'primary',
    blurb:
      'Life totals, commander damage, and poison counters in one obsidian console.',
    icon: 'heart',
  },
  {
    href: '/toolkit',
    title: 'Card Lookup',
    kind: 'Search',
    accent: 'teal',
    blurb: 'Summon oracle text, rulings, and legality with fast Scryfall queries.',
    icon: 'search',
  },
  {
    href: '/glossary',
    title: 'Keywords Glossary',
    kind: 'Learn',
    accent: 'crimson',
    blurb: 'Immediate references for abilities, reminder text, and edge cases.',
    icon: 'book',
  },
  {
    href: '/stack',
    title: 'Stack Reference',
    kind: 'Rules',
    accent: 'purple',
    blurb: 'A visual breakdown of priority and last-in, first-out resolution.',
    icon: 'layers',
  },
  {
    href: '/rules',
    title: 'Rules',
    kind: 'Reference',
    accent: 'primary',
    blurb: 'Comprehensive rules search with concise, table-ready snippets.',
    icon: 'scroll',
  },
  {
    href: '/tokens',
    title: 'Tokens',
    kind: 'Reference',
    accent: 'teal',
    blurb: 'Common token reference with power, toughness, and color identity.',
    icon: 'coins',
  },
  {
    href: '/new-players',
    title: 'New Players',
    kind: 'Learn',
    accent: 'purple',
    blurb: 'A guided primer on turn flow, combat, and the stack.',
    icon: 'sparkles',
  },
  {
    href: '/dice',
    title: 'Dice',
    kind: 'Utility',
    accent: 'crimson',
    blurb: 'All seven faces of fate. Tap to roll, with a tasteful history.',
    icon: 'dice',
  },
] as const

const accentMap: Record<string, string> = {
  primary: 'text-[hsl(42_75%_65%)] bg-[hsl(42_75%_55%/0.10)] border-[hsl(42_75%_55%/0.30)]',
  teal: 'text-[hsl(170_50%_55%)] bg-[hsl(170_50%_45%/0.10)] border-[hsl(170_50%_45%/0.25)]',
  crimson: 'text-[hsl(0_70%_60%)] bg-[hsl(0_65%_50%/0.10)] border-[hsl(0_65%_50%/0.25)]',
  purple: 'text-[hsl(270_50%_70%)] bg-[hsl(270_40%_55%/0.10)] border-[hsl(270_40%_55%/0.25)]',
}

const comingSoon = [
  {
    title: 'Game Replay',
    desc: 'Step through any session — every life change, every cast, every priority pass.',
  },
  {
    title: 'Playgroups',
    desc: 'Saved tables, win-rate dashboards, and rivalry rosters across pods.',
  },
  {
    title: 'Pod Sync',
    desc: 'Real-time table sync across phones — one source of truth for the game state.',
  },
]

function ToolIcon({ name }: { name: string }) {
  const cls = 'w-5 h-5'
  switch (name) {
    case 'heart':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    case 'search':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    case 'book':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    case 'layers':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      )
    case 'scroll':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    case 'coins':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <ellipse cx="12" cy="6" rx="8" ry="3" />
          <path strokeLinecap="round" d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
        </svg>
      )
    case 'sparkles':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>
      )
    case 'dice':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="8" cy="8" r="1.3" fill="currentColor" />
          <circle cx="16" cy="8" r="1.3" fill="currentColor" />
          <circle cx="8" cy="16" r="1.3" fill="currentColor" />
          <circle cx="16" cy="16" r="1.3" fill="currentColor" />
          <circle cx="12" cy="12" r="1.3" fill="currentColor" />
        </svg>
      )
    default:
      return null
  }
}

function StackingCardsBg() {
  return (
    <div
      className="pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 hidden md:block opacity-[0.35]"
      aria-hidden
    >
      <svg width="420" height="320" viewBox="0 0 420 320" fill="none">
        <defs>
          <linearGradient id="cg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(45 80% 75%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(38 65% 45%)" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {[0, 1, 2].map((i) => (
          <motion.rect
            key={i}
            x={120 + i * 14}
            y={80 - i * 18}
            width={170}
            height={230}
            rx={8}
            stroke="url(#cg)"
            strokeWidth="1.2"
            fill="hsl(220 15% 10%)"
            initial={{ y: 80 - i * 18, opacity: 0 }}
            animate={{
              y: [80 - i * 18, 70 - i * 18, 80 - i * 18],
              opacity: 1,
            }}
            transition={{
              duration: 6 + i,
              delay: i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>
    </div>
  )
}

function formatNewsDate(iso: string) {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function Home() {
  const { items, isLoading, error } = useNews()

  return (
    <>
      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-4 md:px-8 pt-8 md:pt-16">
        <div className="panel codex-glow panel-gilded relative overflow-hidden p-8 md:p-14">
          <StackingCardsBg />
          <div className="relative">
            <div className="flex items-center gap-3 text-[10px] md:text-xs font-display tracking-[0.32em] uppercase text-[hsl(38_15%_60%/0.8)]">
              <GoldRule />
              <span>Vault of the Stack</span>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="font-display text-gold-gradient mt-5 text-5xl md:text-7xl tracking-wide leading-[1.05]"
            >
              TheStack.gg
            </motion.h1>
            <div className="mt-3 mb-6 flex items-center gap-3 text-[hsl(42_75%_65%/0.7)]">
              <span className="w-1 h-1 rotate-45 bg-[hsl(42_75%_55%/0.7)]" />
              <span className="font-prose italic text-base md:text-lg">
                Command your table.
              </span>
            </div>
            <p className="font-prose text-[hsl(38_30%_88%/0.85)] text-lg md:text-xl max-w-2xl leading-snug">
              Dark-mode tools for life totals, the stack, and spell sequencing —
              fast, focused, beautiful, and right at hand.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/tracker"
                className="px-5 py-2.5 bg-[hsl(42_75%_55%)] text-[hsl(220_15%_7%)] rounded-md font-medium hover-elevate inline-flex items-center gap-2"
                data-testid="button-hero-tracker"
              >
                <ToolIcon name="heart" />
                Open Life Tracker
              </Link>
              <Link
                href="/toolkit"
                className="px-5 py-2.5 panel-elevated rounded-md text-[hsl(38_30%_88%)] hover-elevate inline-flex items-center gap-2"
                data-testid="button-hero-cards"
              >
                <ToolIcon name="search" />
                Card Lookup
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Toolkit */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 mt-12 md:mt-20">
        <div className="text-center">
          <Fleuron />
          <h2 className="font-display tracking-[0.18em] uppercase text-xs text-[hsl(38_15%_60%)]">
            The Toolkit
          </h2>
          <p className="font-prose italic text-2xl md:text-3xl mt-2 text-[hsl(38_30%_88%/0.9)]">
            Eight instruments. One obsidian console.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              data-testid={`tile-${tool.title.toLowerCase().replace(/\s/g, '-')}`}
            >
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="panel codex-glow p-6 h-full group relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-10 h-10 rounded-md border flex items-center justify-center ${
                      accentMap[tool.accent]
                    }`}
                  >
                    <ToolIcon name={tool.icon} />
                  </div>
                  <span className="font-display tracking-[0.22em] text-[10px] uppercase text-[hsl(38_15%_60%/0.8)]">
                    {tool.kind}
                  </span>
                </div>
                <h3 className="font-display tracking-wide text-2xl mt-6 text-[hsl(38_30%_88%)] group-hover:text-[hsl(42_75%_65%)] transition-colors">
                  {tool.title}
                </h3>
                <span className="block w-7 h-px bg-[hsl(42_75%_55%/0.4)] mt-2" />
                <p className="font-prose text-[hsl(38_30%_88%/0.8)] text-base leading-snug mt-3">
                  {tool.blurb}
                </p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-[hsl(42_75%_65%)] text-sm">
                  Enter tool →
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Coming soon */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 mt-16 md:mt-24">
        <div className="text-center">
          <Fleuron />
          <h2 className="font-display tracking-[0.18em] uppercase text-xs text-[hsl(38_15%_60%)]">
            On the Horizon
          </h2>
          <p className="font-prose italic text-2xl md:text-3xl mt-2 text-[hsl(38_30%_88%/0.9)]">
            In the workshop.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {comingSoon.map((c) => (
            <div key={c.title} className="panel p-6 relative">
              <span className="font-display tracking-[0.22em] text-[10px] uppercase text-[hsl(42_75%_65%/0.7)]">
                Coming soon
              </span>
              <h3 className="font-display text-xl mt-4 text-[hsl(38_30%_88%)]">
                {c.title}
              </h3>
              <span className="block w-7 h-px bg-[hsl(42_75%_55%/0.3)] mt-2" />
              <p className="font-prose text-[hsl(38_30%_88%/0.7)] mt-2 leading-snug">
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Mana feed (live) */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 mt-16 md:mt-24 mb-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 text-xs font-display tracking-[0.22em] uppercase text-[hsl(38_15%_60%)]">
              <span className="text-[hsl(42_75%_65%/0.7)]">◆</span> Mana Feed
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-[hsl(38_30%_88%)] mt-2 tracking-wide">
              Dispatches.
            </h2>
          </div>
          <span className="text-sm text-[hsl(38_15%_60%)]">Updated daily</span>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading && (
            <>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="panel p-5 animate-pulse h-32 opacity-60"
                />
              ))}
            </>
          )}
          {error && (
            <div className="panel p-5 col-span-full text-sm text-[hsl(0_70%_60%)]">
              Couldn&apos;t reach the mana feed. Try again later.
            </div>
          )}
          {!isLoading &&
            !error &&
            items.slice(0, 6).map((post) => (
              <a
                key={post.link}
                href={post.link}
                target="_blank"
                rel="noreferrer"
                className="panel p-5 hover-elevate cursor-pointer block"
              >
                <div className="flex items-center justify-between text-[10px] font-display tracking-[0.22em] uppercase">
                  <span className="text-[hsl(42_75%_65%/0.85)]">
                    {post.category || 'Mana Feed'}
                  </span>
                  <span className="text-[hsl(38_15%_60%/0.8)]">
                    {formatNewsDate(post.pubDate)}
                  </span>
                </div>
                <h3 className="font-display text-lg mt-3 text-[hsl(38_30%_88%)] leading-snug">
                  {post.title}
                </h3>
                {post.description && (
                  <p className="font-prose text-[hsl(38_30%_88%/0.75)] mt-2 leading-snug line-clamp-3">
                    {post.description}
                  </p>
                )}
              </a>
            ))}
        </div>
      </section>
    </>
  )
}
