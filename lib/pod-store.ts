import { getRedis } from '@/lib/redis'
import type { Pod, PodMember, PodRecapSummary } from '@/types/pod'
import type { Recap } from '@/types/replay'

/**
 * Pod store.
 *
 * Mirrors the recap-store / share-store pattern: Redis with in-memory
 * fallback for dev. Two key prefixes:
 *
 *   pod:<id>                    \u2014 the Pod document
 *   viewer:<viewerId>:pods      \u2014 a JSON array of pod ids the viewer owns
 *
 * Pods carry a 90-day TTL but the timer refreshes whenever a recap is
 * attached, so a recurring weekly group keeps the pod alive as long as
 * they're actively playing.
 */

const POD_TTL_MS = 90 * 24 * 60 * 60 * 1000
const POD_TTL_SEC = Math.floor(POD_TTL_MS / 1000)

const podStore = new Map<string, Pod>()
const viewerStore = new Map<string, string[]>()

const cleanupExpired = () => {
  const now = Date.now()
  podStore.forEach((pod, id) => {
    if (pod.updatedAt + POD_TTL_MS <= now) {
      podStore.delete(id)
    }
  })
}

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  }
  return Math.random().toString(16).slice(2, 14)
}

const podKey = (id: string) => `pod:${id}`
const viewerKey = (viewerId: string) => `viewer:${viewerId}:pods`

/** Build a stable per-pod member identity from a player name. */
export const memberKey = (name: string) => name.trim().toLowerCase()

/** Derive the member roster from a recap. */
const recapToMembers = (recap: Recap): PodMember[] =>
  recap.players.map((p) => ({
    key: memberKey(p.name),
    displayName: p.name.trim() || `Player ${p.id}`,
    topCommander: p.commander,
  }))

/** Merge a new set of members into an existing roster. */
export const mergeMembers = (
  existing: PodMember[],
  incoming: PodMember[],
): PodMember[] => {
  const map = new Map<string, PodMember>()
  for (const m of existing) map.set(m.key, m)
  for (const m of incoming) {
    const prev = map.get(m.key)
    if (!prev) {
      map.set(m.key, m)
    } else {
      // Keep the earliest display name; bias topCommander toward the most
      // recently-seen non-empty value (it's "their go-to" for this pod).
      map.set(m.key, {
        key: prev.key,
        displayName: prev.displayName,
        topCommander: m.topCommander ?? prev.topCommander,
      })
    }
  }
  return Array.from(map.values())
}

export type CreatePodInput = {
  name: string
  recap: Recap
  ownerViewerId?: string
}

export const createPod = async (input: CreatePodInput): Promise<Pod> => {
  const now = Date.now()
  const pod: Pod = {
    id: createId(),
    name: input.name.trim() || 'Untitled pod',
    members: recapToMembers(input.recap),
    recapIds: [input.recap.id],
    ownerViewerId: input.ownerViewerId,
    createdAt: now,
    updatedAt: now,
  }

  await writePod(pod)
  if (input.ownerViewerId) {
    await indexViewerPod(input.ownerViewerId, pod.id)
  }
  return pod
}

export const getPod = async (id: string): Promise<Pod | null> => {
  const redis = await getRedis()
  if (!redis) {
    cleanupExpired()
    return podStore.get(id) ?? null
  }
  const cached = await redis.get(podKey(id))
  if (!cached) return null
  return JSON.parse(cached) as Pod
}

/** Attach a recap to a pod. Idempotent: re-attaching the same recap is a no-op. */
export const attachRecapToPod = async (
  podId: string,
  recap: Recap,
): Promise<Pod | null> => {
  const pod = await getPod(podId)
  if (!pod) return null
  if (pod.recapIds.includes(recap.id)) return pod

  const updated: Pod = {
    ...pod,
    members: mergeMembers(pod.members, recapToMembers(recap)),
    recapIds: [...pod.recapIds, recap.id],
    updatedAt: Date.now(),
  }
  await writePod(updated)
  return updated
}

/** List pod ids a viewer owns, newest-updated first. */
export const listViewerPods = async (viewerId: string): Promise<string[]> => {
  const redis = await getRedis()
  if (!redis) {
    return viewerStore.get(viewerId) ?? []
  }
  const cached = await redis.get(viewerKey(viewerId))
  if (!cached) return []
  try {
    return JSON.parse(cached) as string[]
  } catch {
    return []
  }
}

const writePod = async (pod: Pod): Promise<void> => {
  const redis = await getRedis()
  if (!redis) {
    cleanupExpired()
    podStore.set(pod.id, pod)
    return
  }
  await redis.set(podKey(pod.id), JSON.stringify(pod), { EX: POD_TTL_SEC })
}

const indexViewerPod = async (viewerId: string, podId: string): Promise<void> => {
  const existing = await listViewerPods(viewerId)
  // newest first; cap at 50 so a viewer can't blow up the index forever
  const next = [podId, ...existing.filter((id) => id !== podId)].slice(0, 50)

  const redis = await getRedis()
  if (!redis) {
    viewerStore.set(viewerId, next)
    return
  }
  await redis.set(viewerKey(viewerId), JSON.stringify(next), { EX: POD_TTL_SEC })
}

export const getPodTtlMs = () => POD_TTL_MS

/**
 * Lift a fast summary off a full Recap document. Used by the pod page to
 * render lists without paying for the full event log of every game.
 */
export const recapToSummary = (
  recap: Recap,
  headline?: string,
): PodRecapSummary => ({
  recapId: recap.id,
  podName: recap.podName,
  format: recap.format,
  startingLife: recap.startingLife,
  startedAt: recap.startedAt,
  endedAt: recap.endedAt,
  winnerId: recap.winnerId,
  players: recap.players.map((p) => ({
    id: p.id,
    name: p.name,
    commander: p.commander,
  })),
  headline,
})

/** Test-only helper: clear in-memory state. */
export const __clearPodStoreForTests = () => {
  podStore.clear()
  viewerStore.clear()
}
