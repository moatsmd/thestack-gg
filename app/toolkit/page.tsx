'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ToolkitHeader } from '@/components/ToolkitHeader'
import { CardSearch } from '@/components/CardSearch'

function LinkedCardSearch() {
  const searchParams = useSearchParams()
  return <CardSearch initialQuery={searchParams.get('q') ?? ''} />
}

export default function ToolkitPage() {
  return (
    <div className="min-h-screen text-foreground">
      <ToolkitHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="panel codex-glow p-6">
          <Suspense fallback={<p role="status" className="text-[var(--muted)]">Preparing card lookup…</p>}>
            <LinkedCardSearch />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
