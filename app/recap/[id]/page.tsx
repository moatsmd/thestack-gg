import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getRecap } from '@/lib/recap-store'
import {
  buildHeadline,
  buildHighlights,
  buildCommanderDamageTotals,
  getDurationMinutes,
} from '@/lib/recap-analysis'
import { Fleuron, GoldRule } from '@/components/Fleuron'
import { Logo } from '@/components/Logo'
import { RecapShareButtons } from '@/components/RecapShareButtons'
import { RecapLifeGraph } from '@/components/RecapLifeGraph'
import { RecapPodActions } from '@/components/RecapPodActions'

const SITE_URL = 'https://www.thestack.gg'

type PageProps = { params: { id: string } }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const recap = await getRecap(params.id)
  if (!recap) {
    return { title: 'Recap not found' }
  }
  const headline = buildHeadline(recap)
  const title = recap.podName ? `${recap.podName} — Recap` : 'Pod Recap'
  const description = headline
  const url = `${SITE_URL}/recap/${recap.id}`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'TheStack.gg',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: { canonical: url },
  }
}

export default async function RecapPage({ params }: PageProps) {
  const recap = await getRecap(params.id)
  if (!recap) {
    notFound()
  }

  const headline = buildHeadline(recap)
  const highlights = buildHighlights(recap)
  const cmdTotals = buildCommanderDamageTotals(recap)
  const durationMin = getDurationMinutes(recap)
  const winner = recap.winnerId !== undefined
    ? recap.players.find((p) => p.id === recap.winnerId)
    : undefined
  const url = `${SITE_URL}/recap/${recap.id}`

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 pt-6 md:pt-12 pb-16">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center"><GoldRule /></div>
        <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)] mt-3">
          {recap.podName ? recap.podName : 'Pod Recap'} · {recap.format}
        </p>
        <h1
          className="font-display text-gold-gradient text-3xl md:text-5xl mt-3 tracking-wide"
          data-testid="text-recap-headline"
        >
          {headline}
        </h1>
        <p className="font-prose text-[hsl(38_30%_88%)]/80 text-base md:text-lg mt-2">
          {recap.players.length} players · {durationMin} min · started at life {recap.startingLife}
        </p>
      </header>

      {/* Standings */}
      <section className="panel codex-glow panel-gilded p-6 md:p-8 mb-8">
        <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)]">
          Final standings
        </p>
        <span className="block w-12 h-px bg-primary/40 mt-2 mb-4" />
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recap.players.map((p) => {
            const isWinner = winner?.id === p.id
            const cmd = cmdTotals[p.id] ?? 0
            return (
              <li
                key={p.id}
                className="panel p-4 flex items-start justify-between gap-3"
                data-testid={`row-player-${p.id}`}
              >
                <div>
                  <div className="font-display text-lg text-[hsl(38_30%_88%)] flex items-center gap-2">
                    {p.name}
                    {isWinner && (
                      <span className="text-[hsl(42_75%_55%)] text-xs uppercase tracking-[0.16em]">Winner</span>
                    )}
                  </div>
                  {p.commander && (
                    <div className="font-prose italic text-[hsl(38_30%_88%)]/75 text-sm mt-0.5">
                      {p.commander}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-display text-sm tracking-[0.16em] uppercase text-[hsl(38_15%_60%)]">cmd dmg</div>
                  <div className="font-display text-2xl text-[hsl(42_75%_55%)]">{cmd}</div>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Life graph */}
      <section className="panel codex-glow p-6 md:p-8 mb-8">
        <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)]">
          Life over time
        </p>
        <span className="block w-12 h-px bg-primary/40 mt-2 mb-4" />
        <RecapLifeGraph recap={recap} />
      </section>

      {/* Highlights */}
      {highlights.length > 0 && (
        <section className="panel codex-glow p-6 md:p-8 mb-8">
          <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)]">
            Highlights
          </p>
          <span className="block w-12 h-px bg-primary/40 mt-2 mb-4" />
          <ul className="space-y-3">
            {highlights.map((h, i) => (
              <li key={i} className="panel p-4" data-testid={`highlight-${h.kind}`}>
                <div className="font-display text-base text-[hsl(42_75%_55%)] tracking-wide">
                  {h.title}
                </div>
                <div className="font-prose text-[hsl(38_30%_88%)]/85 mt-1">{h.body}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Fleuron />

      {/* Pod actions */}
      <section className="panel codex-glow p-6 md:p-8 mt-8 mb-8">
        <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)]">
          Make this a pod
        </p>
        <span className="block w-12 h-px bg-primary/40 mt-2 mb-4" />
        <RecapPodActions recapId={recap.id} />
      </section>

      {/* Share */}
      <section className="panel panel-gilded p-6 md:p-8 mt-8 mb-8">
        <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)]">
          Share this recap
        </p>
        <span className="block w-12 h-px bg-primary/40 mt-2 mb-4" />
        <RecapShareButtons url={url} headline={headline} podName={recap.podName} />
        <p className="font-prose text-[hsl(38_30%_88%)]/65 text-sm mt-4">
          Anyone with this link can view the recap. It will be available for 30 days.
        </p>
      </section>

      {/* CTA */}
      <section className="text-center mt-12">
        <div className="flex items-center justify-center mb-3"><Logo size={28} withWord /></div>
        <Link
          href="/tracker"
          className="inline-block px-5 py-2.5 bg-[hsl(42_75%_55%)] text-[hsl(220_15%_7%)] rounded-md font-medium hover-elevate"
          data-testid="link-track-pod"
        >
          Track your own pod →
        </Link>
        <p className="font-prose text-[hsl(38_30%_88%)]/65 text-sm mt-3">
          Free. Mobile-first. No sign-up.
        </p>
      </section>
    </div>
  )
}
