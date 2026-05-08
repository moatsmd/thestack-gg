import {
  createPod,
  getPod,
  attachRecapToPod,
  listViewerPods,
  memberKey,
  mergeMembers,
  recapToSummary,
  __clearPodStoreForTests,
} from '../pod-store'
import type { Recap } from '@/types/replay'

beforeEach(() => {
  delete process.env.REDIS_URL
  delete process.env.STACK_RECAP_REDIS_URL
  delete process.env.stack_recap_REDIS_URL
  __clearPodStoreForTests()
})

const baseRecap = (overrides: Partial<Recap> = {}): Recap => ({
  id: 'r-' + Math.random().toString(16).slice(2, 8),
  players: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ],
  format: 'Commander 40',
  startingLife: 40,
  winnerId: 2,
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
  startedAt: 1_000,
  endedAt: 2_000,
  createdAt: 1_500,
  ...overrides,
})

describe('memberKey', () => {
  it('lowercases and trims', () => {
    expect(memberKey('  Alice  ')).toBe('alice')
    expect(memberKey('BOB')).toBe('bob')
  })
})

describe('mergeMembers', () => {
  it('keeps existing display name and folds in new keys', () => {
    const merged = mergeMembers(
      [{ key: 'alice', displayName: 'Alice', topCommander: 'Atraxa' }],
      [
        { key: 'alice', displayName: 'ALICE', topCommander: 'Korvold' },
        { key: 'bob', displayName: 'Bob' },
      ],
    )
    expect(merged).toHaveLength(2)
    const alice = merged.find((m) => m.key === 'alice')!
    // existing displayName preserved
    expect(alice.displayName).toBe('Alice')
    // newest non-empty commander wins
    expect(alice.topCommander).toBe('Korvold')
    expect(merged.find((m) => m.key === 'bob')).toBeDefined()
  })
})

describe('createPod / getPod', () => {
  it('creates a pod from a recap and returns it via getPod', async () => {
    const recap = baseRecap()
    const pod = await createPod({ name: 'Friday Crew', recap })
    expect(pod.name).toBe('Friday Crew')
    expect(pod.recapIds).toEqual([recap.id])
    expect(pod.members.map((m) => m.key).sort()).toEqual(['alice', 'bob'])
    const loaded = await getPod(pod.id)
    expect(loaded?.id).toBe(pod.id)
  })

  it('falls back to "Untitled pod" when name is empty', async () => {
    const pod = await createPod({ name: '   ', recap: baseRecap() })
    expect(pod.name).toBe('Untitled pod')
  })
})

describe('attachRecapToPod', () => {
  it('appends a recap and merges members; idempotent on re-attach', async () => {
    const recap1 = baseRecap()
    const pod = await createPod({ name: 'Crew', recap: recap1 })

    const recap2 = baseRecap({
      id: 'recap-2',
      players: [
        { id: 1, name: 'alice' }, // case-different match
        { id: 3, name: 'Carol' },
      ],
      events: [
        {
          type: 'game_start',
          seq: 0,
          timestamp: 5_000,
          format: 'Commander 40',
          startingLife: 40,
          players: [
            { id: 1, name: 'alice' },
            { id: 3, name: 'Carol' },
          ],
        },
        { type: 'game_end', seq: 1, timestamp: 6_000, winnerId: 1 },
      ],
      startedAt: 5_000,
      endedAt: 6_000,
      winnerId: 1,
    })
    const updated = await attachRecapToPod(pod.id, recap2)
    expect(updated?.recapIds).toEqual([recap1.id, 'recap-2'])
    expect(updated?.members.map((m) => m.key).sort()).toEqual([
      'alice',
      'bob',
      'carol',
    ])

    // Re-attach the same recap — no duplication.
    const again = await attachRecapToPod(pod.id, recap2)
    expect(again?.recapIds).toEqual([recap1.id, 'recap-2'])
  })

  it('returns null when the pod does not exist', async () => {
    const result = await attachRecapToPod('does-not-exist', baseRecap())
    expect(result).toBeNull()
  })
})

describe('listViewerPods', () => {
  it('indexes pods under the owning viewer (newest first)', async () => {
    const podA = await createPod({
      name: 'A',
      recap: baseRecap({ id: 'a' }),
      ownerViewerId: 'viewer-1',
    })
    const podB = await createPod({
      name: 'B',
      recap: baseRecap({ id: 'b' }),
      ownerViewerId: 'viewer-1',
    })
    const list = await listViewerPods('viewer-1')
    // newest first
    expect(list[0]).toBe(podB.id)
    expect(list[1]).toBe(podA.id)
  })

  it('returns [] for an unknown viewer', async () => {
    const list = await listViewerPods('nobody')
    expect(list).toEqual([])
  })
})

describe('recapToSummary', () => {
  it('lifts a compact summary from a recap document', () => {
    const recap = baseRecap()
    const summary = recapToSummary(recap, 'Bob clinched it')
    expect(summary.recapId).toBe(recap.id)
    expect(summary.format).toBe('Commander 40')
    expect(summary.winnerId).toBe(2)
    expect(summary.headline).toBe('Bob clinched it')
    expect(summary.players).toHaveLength(2)
  })
})
