import { ImageResponse } from 'next/og'
import { getRecap } from '@/lib/recap-store'
import { buildHeadline, buildCommanderDamageTotals } from '@/lib/recap-analysis'

export const runtime = 'nodejs'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }
export const alt = 'TheStack.gg pod recap'

export default async function OG({ params }: { params: { id: string } }) {
  const recap = await getRecap(params.id)

  if (!recap) {
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
          Recap not found
        </div>
      ),
      { ...size },
    )
  }

  const headline = buildHeadline(recap)
  const cmdTotals = buildCommanderDamageTotals(recap)

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
          position: 'relative',
        }}
      >
        {/* gold rule */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            marginBottom: 24,
          }}
        >
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
          }}
        >
          {recap.podName ? recap.podName : 'Pod Recap'} · {recap.format}
        </div>

        <div
          style={{
            fontSize: 64,
            lineHeight: 1.15,
            color: '#f0d97a',
            textAlign: 'center',
            margin: '24px 0 16px',
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {headline.length > 90 ? headline.slice(0, 87) + '…' : headline}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 20,
            flexWrap: 'wrap',
            marginTop: 24,
          }}
        >
          {recap.players.slice(0, 6).map((p) => {
            const cmd = cmdTotals[p.id] ?? 0
            const isWinner = recap.winnerId === p.id
            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px 24px',
                  background: 'rgba(212, 175, 55, 0.06)',
                  border: `1px solid ${isWinner ? '#d4af37' : 'rgba(212,175,55,0.25)'}`,
                  borderRadius: 8,
                  minWidth: 180,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    letterSpacing: 4,
                    textTransform: 'uppercase',
                    color: isWinner ? '#d4af37' : '#a89770',
                    display: 'flex',
                  }}
                >
                  {isWinner ? 'Winner' : 'Player'}
                </div>
                <div
                  style={{
                    fontSize: 28,
                    color: '#e5d9b6',
                    marginTop: 6,
                    display: 'flex',
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: '#a89770',
                    marginTop: 4,
                    display: 'flex',
                  }}
                >
                  {cmd} cmd dmg
                </div>
              </div>
            )
          })}
        </div>

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
          <div style={{ display: 'flex' }}>Track your own pod →</div>
        </div>
      </div>
    ),
    { ...size },
  )
}
