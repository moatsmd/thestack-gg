import { createRecap, __clearRecapStoreForTests } from '../recap-store'
import {
  createPod,
  attachRecapToPod,
  getPod,
  listViewerPods,
  __clearPodStoreForTests,
} from '../pod-store'
import type { GameEvent, RecapPlayer } from '@/types/replay'

beforeEach(() => {
  delete process.env.REDIS_URL
  delete process.env.STACK_RECAP_REDIS_URL
  delete process.env.stack_recap_REDIS_URL
  __clearPodStoreForTests()
  __clearRecapStoreForTests()
})

const players: RecapPlayer[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Carol' },
]

const events = (winnerId: number, t = 0): GameEvent[] => [
  {
    type: 'game_start',
    seq: 0,
    timestamp: 1_000 + t,
    format: 'Commander 40',
    startingLife: 40,
    players,
  },
  { type: 'game_end', seq: 1, timestamp: 2_000 + t, winnerId },
]

describe('recap → pod end-to-end', () => {
  it('creates a pod from a recap, then attaches a second recap, surfacing both in the viewer index', async () => {
    const r1 = await createRecap({
      players,
      format: 'Commander 40',
      startingLife: 40,
      events: events(1),
      winnerId: 1,
    })
    const pod = await createPod({
      name: 'Friday Crew',
      recap: r1,
      ownerViewerId: 'viewer-abc',
    })
    expect(pod.recapIds).toEqual([r1.id])
    expect(pod.members).toHaveLength(3)

    const r2 = await createRecap({
      players,
      format: 'Commander 40',
      startingLife: 40,
      events: events(2, 10_000),
      winnerId: 2,
    })
    const updated = await attachRecapToPod(pod.id, r2)
    expect(updated?.recapIds).toEqual([r1.id, r2.id])

    const stored = await getPod(pod.id)
    expect(stored?.recapIds).toHaveLength(2)
    expect(stored?.members).toHaveLength(3)

    const indexed = await listViewerPods('viewer-abc')
    expect(indexed).toContain(pod.id)
  })
})
