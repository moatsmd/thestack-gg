'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { readViewerId } from '@/lib/viewer-id'

type PodSummary = {
  id: string
  name: string
  updatedAt: number
  recapIds: string[]
}

const formatRelative = (ms: number): string => {
  const diff = Date.now() - ms
  const day = 24 * 60 * 60 * 1000
  if (diff < day) return 'today'
  const days = Math.floor(diff / day)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

/**
 * Surfaces the visitor's pods on the tracker home. Renders nothing for
 * brand-new visitors (no viewerId, or empty list) so the wizard stays the
 * focal point. Newest pods first, capped at 6 — anything more than that
 * crowds the wizard.
 */
export function YourPods() {
  const [pods, setPods] = useState<PodSummary[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const id = readViewerId()
    if (!id) {
      setHydrated(true)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/pod?viewerId=${encodeURIComponent(id)}`)
        if (!res.ok) throw new Error('failed')
        const data = (await res.json()) as { pods: PodSummary[] }
        if (!cancelled) setPods(data.pods.slice(0, 6))
      } catch {
        if (!cancelled) setPods([])
      } finally {
        if (!cancelled) setHydrated(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!hydrated || pods.length === 0) return null

  return (
    <section className="max-w-2xl mx-auto mb-8" data-testid="section-your-pods">
      <div className="flex items-baseline justify-between mb-3">
        <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)]">
          Your pods
        </p>
        <p className="font-prose text-[hsl(38_30%_88%)]/65 text-xs">
          {pods.length === 1 ? '1 pod' : `${pods.length} pods`}
        </p>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pods.map((p) => (
          <li key={p.id}>
            <Link
              href={`/pod/${p.id}`}
              className="block panel hover-elevate p-4"
              data-testid={`link-your-pod-${p.id}`}
            >
              <div className="font-display text-base text-[hsl(38_30%_88%)] truncate">
                {p.name}
              </div>
              <div className="font-prose text-[hsl(38_30%_88%)]/65 text-xs mt-1">
                {p.recapIds.length} {p.recapIds.length === 1 ? 'game' : 'games'} ·
                {' '}last played {formatRelative(p.updatedAt)}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
