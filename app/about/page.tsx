import Link from 'next/link'
import { Fleuron, GoldRule } from '@/components/Fleuron'
import { Logo } from '@/components/Logo'

export const metadata = {
  title: 'About | TheStack.gg',
  description: 'TheStack.gg is a premium, mobile-first companion for Magic: The Gathering — built by players for the table.',
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  )
}
function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function Mission({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="panel p-4">
      <span className="text-primary">{icon}</span>
      <h4 className="font-display text-base tracking-wide mt-3 text-[hsl(38_30%_88%)]">{title}</h4>
      <span className="block w-6 h-px bg-primary/40 mt-1.5 mb-2" />
      <p className="font-prose text-[hsl(38_30%_88%)]/80 text-base leading-snug">{body}</p>
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 pt-6 md:pt-12">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center"><GoldRule /></div>
        <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)] mt-3">A Note from the Workshop</p>
        <h1 className="font-display text-gold-gradient text-3xl md:text-5xl mt-3 tracking-wide">About</h1>
      </header>

      <article className="panel codex-glow panel-gilded p-6 md:p-10">
        <div className="flex items-center gap-3 mb-6"><Logo size={36} withWord /></div>
        <p className="drop-cap font-prose text-lg md:text-xl leading-snug text-[hsl(38_30%_88%)]/90">
          TheStack.gg is a premium, mobile-first companion for Magic: The Gathering — built by players, for the table. We believe the best tools disappear into the moment of play. Every choice here, from the gold-flecked typography to the obsidian surfaces and the snap of a counter, is made to feel as deliberate as a well-sequenced turn.
        </p>
        <Fleuron />
        <div className="grid md:grid-cols-3 gap-4">
          <Mission icon={<HeartIcon />} title="Mission" body="Replace cluttered, ad-laden trackers with one obsidian console — fast, focused, and quietly beautiful." />
          <Mission icon={<LayersIcon />} title="Approach" body="Native web. No accounts, no third-party trackers, no cross-site profile — just lightweight, anonymous usage analytics so we know what to fix next." />
          <Mission icon={<SearchIcon />} title="Built On" body="Card data is supplied by Scryfall. Rules text is summarized from the comprehensive rules. Long-form guides live in the Codex. Type by Cinzel and Inter." />
        </div>
        <Fleuron />
        <h3 className="font-display tracking-[0.18em] uppercase text-[10px] text-[hsl(38_15%_60%)]">The Team</h3>
        <p className="font-prose mt-2 text-[hsl(38_30%_88%)]/85">
          A small, opinionated group of MTG players, designers, and engineers. We meet on Friday nights and disagree about Bolt-the-Bird more than we should.
        </p>
      </article>

      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Link href="/tracker" className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-display tracking-wide" data-testid="cta-tracker">
          Open Life Tracker
        </Link>
        <Link href="/toolkit" className="px-4 py-2 panel hover-elevate font-display tracking-wide" data-testid="cta-cards">
          Card Lookup
        </Link>
      </div>
    </div>
  )
}
