import { ImageResponse } from 'next/og'
import { getPod, recapToSummary } from '@/lib/pod-store'
import { getRecap } from '@/lib/recap-store'
import { buildLeaderboard, buildPodSummary } from '@/lib/pod-analysis'

export const runtime = 'nodejs'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }
export const alt = 'TheStack.gg pod profile'

export default async function OG({ params }: { params: { id: string } }) {
  const pod = await getPod(params.id)

  if (!pod) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0c0d10',
            color: '#e5d9b6',
            fontSize: 56,
            fontFamily: 'serif',
          }}
        >
          Pod not found
        </div>
      ),
      { ...size },
    )
  }

  const recaps = []
  for (const rid of pod.recapIds) {
    const recap = await getRecap(rid)
    if (recap) recaps.push(recapToSummary(recap))
  }
  const summary = buildPodSummary(pod, recaps)
  const leaderboard = buildLeaderboard(pod, recaps).slice(0, 3)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background:
            'linear-gradient(180deg, #0a0b0e 0%, #14110a 60%, #0a0b0e 100%)',
          color: '#e5d9b6',
          padding: '64px 72px',
          fontFamily: 'serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div
            style={{
              width: 240,
              height: 2,
              background:
                'linear-gradient(90deg, transparent, #d4af37, transparent)',
            }}
          />
        </div>

        <div
          style={{
            fontSize: 22,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: '#a89770',
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            marginTop: 24,
          }}
        >
          Pod Profile {summary.topFormat ? `\u00b7 ${summary.topFormat}` : ''}
        </div>

        <div
          style={{
            fontSize: 64,
            lineHeight: 1.15,
            color: '#f0d97a',
            textAlign: 'center',
            margin: '20px 0 8px',
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {pod.name.length > 40 ? pod.name.slice(0, 37) + '\u2026' : pod.name}
        </div>

        <div
          style={{
            fontSize: 22,
            color: '#a89770',
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 28,
          }}
        >
          {summary.totalGames} games \u00b7 {pod.members.length} players
        </div>

        {leaderboard.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              padding: '16px 24px',
              background: 'rgba(212, 175, 55, 0.06)',
              border: '1px solid rgba(212,175,55,0.25)',
              borderRadius: 8,
              alignSelf: 'center',
              minWidth: 520,
            }}
          >
            <div
              style={{
                fontSize: 16,
                letterSpacing: 4,
                textTransform: 'uppercase',
                color: '#a89770',
                display: 'flex',
              }}
            >
              Top of the pod
            </div>
            {leaderboard.map((row, i) => (
              <div
                key={row.memberKey}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 26,
                }}
              >
                <div style={{ display: 'flex', color: '#e5d9b6' }}>
                  <span style={{ color: '#d4af37', marginRight: 12, display: 'flex' }}>
                    {i + 1}.
                  </span>
                  {row.displayName}
                </div>
                <div style={{ display: 'flex', color: '#d4af37' }}>
                  {Math.round(row.winRate * 100)}%
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ flex: 1 }} />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#a89770',
            fontSize: 22,
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          <div style={{ display: 'flex' }}>thestack.gg</div>
          <div style={{ display: 'flex' }}>Track your next game \u2192</div>
        </div>
      </div>
    ),
    { ...size },
  )
}
