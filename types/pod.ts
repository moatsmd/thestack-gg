/**
 * Pod Profile types.
 *
 * A Pod is a recurring group of players. Each Pod links to a list of recap
 * IDs; the actual recap documents continue to live in the recap store under
 * their own 30-day TTL. The Pod aggregates them on read.
 *
 * Members are matched by name (case-insensitive, trimmed) within a pod.
 * That's the whole identity model in v1 — by design. If two real Alices
 * play in the same pod, they share a row; v1.1 can add manual disambiguation.
 */

export type PodMember = {
  /** Lowercased, trimmed name. Stable identity within the pod. */
  key: string
  /** Display name as first seen (the casing the player actually used). */
  displayName: string
  /** Most-played commander in this pod (or undefined if never declared). */
  topCommander?: string
}

export type Pod = {
  id: string
  name: string
  /** Members derived from the linked recaps (sorted by games-played desc). */
  members: PodMember[]
  /** Recap IDs attached to this pod, oldest first. */
  recapIds: string[]
  /**
   * Per-browser viewer that created the pod. Used for the "Your pods"
   * surface on /tracker. Not auth — just a localStorage-backed handle.
   */
  ownerViewerId?: string
  /** Wall-clock ms — server-set on create. */
  createdAt: number
  /** Wall-clock ms — bumped every time a recap is attached. */
  updatedAt: number
}

/** Per-recap summary lifted from a Recap document for fast pod-page rendering. */
export type PodRecapSummary = {
  recapId: string
  podName?: string
  format: string
  startingLife: number
  startedAt: number
  endedAt: number
  winnerId?: number
  /** Players exactly as recorded in the originating recap. */
  players: { id: number; name: string; commander?: string }[]
  /** Optional headline cached at attach time so list views are cheap. */
  headline?: string
}

/** Read shape returned from GET /api/pod/[id]. */
export type PodWithRecaps = {
  pod: Pod
  recaps: PodRecapSummary[]
}
