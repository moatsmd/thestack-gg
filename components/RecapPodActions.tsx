'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getOrCreateViewerId } from '@/lib/viewer-id'
import { track } from '@/lib/analytics'

type ExistingPod = {
  id: string
  name: string
  updatedAt: number
  recapIds: string[]
}

type Props = {
  recapId: string
  /** When this recap was already attached to a pod via the post-recap flow,
   *  hide the actions to avoid duplicate-pod confusion. Right now we don't
   *  persist that fact, so the component always renders — the API is
   *  idempotent if the same recap gets added twice. */
}

/**
 * Client island on the recap page: "Save as pod" (primary) and a picker
 * to add the recap to an existing pod (secondary). Both flows hinge on a
 * localStorage-backed viewerId so a returning visitor sees their own pods.
 */
export function RecapPodActions({ recapId }: Props) {
  const router = useRouter()
  const [viewerId, setViewerId] = useState<string | null>(null)
  const [pods, setPods] = useState<ExistingPod[]>([])
  const [loadingPods, setLoadingPods] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    const id = getOrCreateViewerId()
    setViewerId(id)
    if (!id) {
      setLoadingPods(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/pod?viewerId=${encodeURIComponent(id)}`)
        if (!res.ok) throw new Error(`Failed to load pods (${res.status})`)
        const data = (await res.json()) as { pods: ExistingPod[] }
        if (!cancelled) {
          // Hide pods that already include this recap — nothing to do.
          const filtered = data.pods.filter((p) => !p.recapIds.includes(recapId))
          setPods(filtered)
        }
      } catch {
        if (!cancelled) setPods([])
      } finally {
        if (!cancelled) setLoadingPods(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [recapId])

  async function saveAsPod() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/pod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recapId, viewerId }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || `Server returned ${res.status}`)
      }
      const data = (await res.json()) as { id: string; url: string }
      track('pod_created', { from: 'recap' })
      router.push(`/pod/${data.id}`)
    } catch (err) {
      setBusy(false)
      setError(err instanceof Error ? err.message : 'Could not save pod')
    }
  }

  async function attachToPod(podId: string) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/pod/${podId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recapId }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || `Server returned ${res.status}`)
      }
      track('pod_recap_attached', { from: 'recap' })
      router.push(`/pod/${podId}`)
    } catch (err) {
      setBusy(false)
      setError(err instanceof Error ? err.message : 'Could not attach recap')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={saveAsPod}
          disabled={busy}
          className="px-5 py-2.5 bg-[hsl(42_75%_55%)] text-[hsl(220_15%_7%)] rounded-md font-medium hover-elevate disabled:opacity-60"
          data-testid="button-save-as-pod"
        >
          {busy ? 'Saving…' : 'Save as pod'}
        </button>
        {!loadingPods && pods.length > 0 && (
          <button
            type="button"
            onClick={() => setShowPicker((s) => !s)}
            disabled={busy}
            className="px-5 py-2.5 panel rounded-md font-medium text-[hsl(38_30%_88%)] hover-elevate disabled:opacity-60"
            data-testid="button-add-to-pod"
          >
            {showPicker ? 'Cancel' : 'Add to existing pod'}
          </button>
        )}
      </div>

      {showPicker && pods.length > 0 && (
        <ul className="panel p-2 space-y-1" data-testid="list-existing-pods">
          {pods.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => attachToPod(p.id)}
                disabled={busy}
                className="w-full text-left px-3 py-2 hover-elevate rounded-md flex items-center justify-between disabled:opacity-60"
                data-testid={`button-attach-${p.id}`}
              >
                <span className="font-display text-[hsl(38_30%_88%)]">{p.name}</span>
                <span className="font-prose text-[hsl(38_30%_88%)]/65 text-xs">
                  {p.recapIds.length} {p.recapIds.length === 1 ? 'game' : 'games'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert" data-testid="text-pod-action-error">
          {error}
        </p>
      )}
      <p className="font-prose text-[hsl(38_30%_88%)]/65 text-sm">
        Pods aggregate your games into a leaderboard and head-to-head. Public by link, like recaps.
      </p>
    </div>
  )
}
