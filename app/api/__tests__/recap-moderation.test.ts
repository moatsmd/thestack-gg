/**
 * @jest-environment node
 *
 * Integration test for /api/recap name moderation.
 *
 * Calls the route handler directly (not via HTTP) so we don't have to
 * spin up Next dev. Confirms that slurs in any name field reject the
 * recap with status 422 and a friendly user-facing error.
 */
import { POST } from '../recap/route'
import { __clearRecapStoreForTests } from '@/lib/recap-store'

beforeEach(() => {
  delete process.env.REDIS_URL
  delete process.env.STACK_RECAP_REDIS_URL
  delete process.env.stack_recap_REDIS_URL
  __clearRecapStoreForTests()
})

const baseBody = (overrides: Record<string, unknown> = {}) => ({
  format: 'Commander 40',
  startingLife: 40,
  players: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ],
  events: [
    {
      type: 'game_start',
      seq: 0,
      timestamp: 1_000,
      format: 'Commander 40',
      startingLife: 40,
      players: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ],
    },
    { type: 'game_end', seq: 1, timestamp: 2_000, winnerId: 2 },
  ],
  winnerId: 2,
  ...overrides,
})

const post = (body: unknown) =>
  POST(
    new Request('http://localhost/api/recap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  )

describe('/api/recap moderation', () => {
  it('accepts a clean recap', async () => {
    const res = await post(baseBody({ podName: 'Friday Crew' }))
    expect(res.status).toBe(200)
  })

  it('accepts casual swearing in names', async () => {
    const res = await post(
      baseBody({
        podName: 'Shitfaced Friday',
        players: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Dick Move Dan' },
        ],
      }),
    )
    expect(res.status).toBe(200)
  })

  it('rejects a slur in a player name', async () => {
    const res = await post(
      baseBody({
        players: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'NiggerKing' },
        ],
      }),
    )
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.field).toContain('NiggerKing')
    expect(body.error).toMatch(/different name/i)
  })

  it('rejects a slur in the pod name', async () => {
    const res = await post(baseBody({ podName: 'Faggot Friday' }))
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.field).toBe('Pod name')
  })

  it('rejects a slur in a commander name', async () => {
    const res = await post(
      baseBody({
        players: [
          { id: 1, name: 'Alice', commander: 'Tranny Crew' },
          { id: 2, name: 'Bob' },
        ],
      }),
    )
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.field).toMatch(/Commander/)
  })

  it('rejects leetspeak slurs', async () => {
    const res = await post(
      baseBody({
        players: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'n1gger' },
        ],
      }),
    )
    expect(res.status).toBe(422)
  })
})
