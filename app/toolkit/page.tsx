'use client'

import { ToolkitHeader } from '@/components/ToolkitHeader'
import { CardSearch } from '@/components/CardSearch'

export default function ToolkitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <ToolkitHeader />
      <div className="container mx-auto px-4 py-6">
        <CardSearch />
      </div>
    </div>
  )
}
