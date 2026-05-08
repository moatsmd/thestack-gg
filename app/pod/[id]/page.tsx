import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPod, recapToSummary } from '@/lib/pod-store'
import { getRecap } from '@/lib/recap-store'
import { buildHeadline } from '@/lib/recap-analysis'
import {
  buildLeaderboard,
  buildHeadToHead,
  buildPodSummary,
} from '@/lib/pod-analysis'
import { Fleuron, GoldRule } from '@/components/Fleuron'
import { Logo } from '@/components/Logo'
import { PodShareButtons } from '@/components/PodShareButtons'
import type { PodRecapSummary } from '@/types/pod'

const SITE_URL = 'https://www.thestack.gg'

type PageProps = { params: { id: string } }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const pod = await getPod(params.id)
  if (!pod) return { title: 'Pod not found' }
  const url = `${SITE_URL}/pod/${pod.id}`
  const description = `${pod.recapIds.length} games \u00b7 ${pod.members.length} players \u00b7 follow this pod's leaderboard, head-to-head, and recaps.`
  return {
    title: `${pod.name} \u2014 Pod`,
    description,
    openGraph: {
      title: pod.name,
      description,
      url,
      type: 'article',
      siteName: 'TheStack.gg',
    },
    twitter: { card: 'summary_large_image', title: pod.name, description },
    alternates: { canonical: url },
  }
}

const formatDate = (ms: number) => {
  const d = new Date(ms)
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const winnerName = (recap: PodRecapSummary): string | undefined => {
  if (recap.winnerId === undefined) return undefined
  return recap.players.find((p) => p.id === recap.winnerId)?.name
}

export default async function PodPage({ params }: PageProps) {
  const pod = await getPod(params.id)
  if (!pod) notFound()

  const recaps: PodRecapSummary[] = []
  for (const rid of pod.recapIds) {
    const recap = await getRecap(rid)
    if (!recap) continue
    recaps.push(recapToSummary(recap, buildHeadline(recap)))
  }
  recaps.sort((a, b) => b.endedAt - a.endedAt)

  const leaderboard = buildLeaderboard(pod, recaps)
  const headToHead = buildHeadToHead(pod, recaps)
  const summary = buildPodSummary(pod, recaps)
  const url = `${SITE_URL}/pod/${pod.id}`

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 pt-6 md:pt-12 pb-16">
      {/* Hero */}
      <header className="text-center mb-8">
        <div className="flex items-center justify-center"><GoldRule /></div>
        <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)] mt-3">
          Pod Profile {summary.topFormat ? `\u00b7 ${summary.topFormat}` : ''}
        </p>
        <h1
          className="font-display text-gold-gradient text-3xl md:text-5xl mt-3 tracking-wide"
          data-testid="text-pod-name"
        >
          {pod.name}
        </h1>
        <p className="font-prose text-[hsl(38_30%_88%)]/80 text-base md:text-lg mt-2">
          {summary.totalGames} games \u00b7 {pod.members.length} players \u00b7 last
          played {formatDate(summary.lastPlayedAt)}
        </p>
      </header>

      {/* Member chips */}
      <section className="panel codex-glow panel-gilded p-6 md:p-8 mb-8">
        <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)]">
          Members
        </p>
        <span className="block w-12 h-px bg-primary/40 mt-2 mb-4" />
        <ul className="flex flex-wrap gap-3">
          {pod.members.map((m) => (
            <li
              key={m.key}
              className="panel px-4 py-2 flex flex-col"
              data-testid={`chip-member-${m.key}`}
            >
              <span className="font-display text-[hsl(38_30%_88%)]">{m.displayName}</span>
              {m.topCommander && (
                <span className="font-prose italic text-[hsl(38_30%_88%)]/70 text-sm">
                  {m.topCommander}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Leaderboard */}
      {leaderboard.length > 0 && summary.totalGames > 0 && (
        <section className="panel codex-glow p-6 md:p-8 mb-8">
          <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)]">
            Leaderboard
          </p>
          <span className="block w-12 h-px bg-primary/40 mt-2 mb-4" />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)]">
                  <th className="py-2 pr-4">Player</th>
                  <th className="py-2 pr-4 text-right">Games</th>
                  <th className="py-2 pr-4 text-right">Wins</th>
                  <th className="py-2 pr-4 text-right">Win rate</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, i) => (
                  <tr
                    key={row.memberKey}
                    className="border-t border-[hsl(38_15%_60%)]/15"
                    data-testid={`row-leader-${row.memberKey}`}
                  >
                    <td className="py-2 pr-4 font-display text-[hsl(38_30%_88%)]">
                      <span className="text-[hsl(42_75%_55%)] mr-2">{i + 1}.</span>
                      {row.displayName}
                    </td>
                    <td className="py-2 pr-4 text-right font-prose text-[hsl(38_30%_88%)]/85">
                      {row.games}
                    </td>
                    <td className="py-2 pr-4 text-right font-prose text-[hsl(38_30%_88%)]/85">
                      {row.wins}
                    </td>
                    <td className="py-2 pr-4 text-right font-display text-[hsl(42_75%_55%)]">
                      {Math.round(row.winRate * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Rivalries */}
      {headToHead.rivalries.length > 0 && (
        <section className="panel codex-glow p-6 md:p-8 mb-8">
          <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)]">
            Rivalries
          </p>
          <span className="block w-12 h-px bg-primary/40 mt-2 mb-4" />
          <ul className="space-y-2">
            {headToHead.rivalries.slice(0, 5).map((r) => (
              <li
                key={`${r.aKey}|${r.bKey}`}
                className="panel p-3 flex items-center justify-between"
                data-testid={`rivalry-${r.aKey}-${r.bKey}`}
              >
                <span className="font-display text-[hsl(38_30%_88%)]">
                  {r.aDisplay} vs {r.bDisplay}
                </span>
                <span className="font-display text-[hsl(42_75%_55%)]">
                  {r.aWins}\u2013{r.bWins}
                  <span className="font-prose text-[hsl(38_30%_88%)]/65 text-sm ml-2">
                    ({r.games} games)
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Recap timeline */}
      <section className="panel codex-glow p-6 md:p-8 mb-8">
        <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)]">
          Games
        </p>
        <span className="block w-12 h-px bg-primary/40 mt-2 mb-4" />
        {recaps.length === 0 ? (
          <p className="font-prose text-[hsl(38_30%_88%)]/70">
            All recaps for this pod have expired. Add a new game to refresh.
          </p>
        ) : (
          <ul className="space-y-3">
            {recaps.map((r) => {
              const winner = winnerName(r)
              return (
                <li key={r.recapId} className="panel p-4" data-testid={`row-recap-${r.recapId}`}>
                  <Link href={`/recap/${r.recapId}`} className="block hover-elevate">
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <span className="font-display text-[hsl(38_30%_88%)] text-base">
                        {r.headline ?? `${r.format} \u2014 ${formatDate(r.endedAt)}`}
                      </span>
                      <span className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)]">
                        {formatDate(r.endedAt)}
                      </span>
                    </div>
                    {winner && (
                      <div className="font-prose italic text-[hsl(38_30%_88%)]/75 text-sm mt-1">
                        Winner: {winner}
                      </div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <Fleuron />

      {/* Share */}
      <section className="panel panel-gilded p-6 md:p-8 mt-8 mb-8">
        <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)]">
          Share this pod
        </p>
        <span className="block w-12 h-px bg-primary/40 mt-2 mb-4" />
        <PodShareButtons url={url} podName={pod.name} games={summary.totalGames} />
        <p className="font-prose text-[hsl(38_30%_88%)]/65 text-sm mt-4">
          Anyone with this link can view the pod. New games stay attached for 90 days
          past the most recent one.
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
          Track your next game \u2192
        </Link>
        <p className="font-prose text-[hsl(38_30%_88%)]/65 text-sm mt-3">
          Free. Mobile-first. No sign-up.
        </p>
      </section>
    </div>
  )
}
