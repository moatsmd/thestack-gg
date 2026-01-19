'use client'

import { ToolkitHeader } from '@/components/ToolkitHeader'
import { CardSearch } from '@/components/CardSearch'

export default function ToolkitPage() {
  return (
    <div className="min-h-screen arcane-shell text-[var(--ink)] transition-colors">
      <ToolkitHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="arcane-panel mana-border rounded-2xl p-6">
          <CardSearch />
        </div>
      </div>
    </div>
  )
}
