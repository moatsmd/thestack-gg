'use client'

import { ToolkitHeader } from '@/components/ToolkitHeader'
import { CardSearch } from '@/components/CardSearch'

export default function ToolkitPage() {
  return (
    <div className="min-h-screen text-[hsl(38_30%_88%)]">
      <ToolkitHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="panel codex-glow p-6">
          <CardSearch />
        </div>
      </div>
    </div>
  )
}
