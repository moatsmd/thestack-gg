'use client'

interface StackControlsProps {
  hasItems: boolean
  isResolving: boolean
  onResolve: () => void
  onClear: () => void
  onNewStack: () => void
}

export function StackControls({ hasItems, isResolving, onResolve, onClear, onNewStack }: StackControlsProps) {
  const handleClear = () => {
    if (!hasItems) {
      return
    }

    if (window.confirm('Clear all stack items and resolution history?')) {
      onClear()
    }
  }

  const handleNewStack = () => {
    if (window.confirm('Start a new stack session?')) {
      onNewStack()
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onResolve}
        disabled={!hasItems || isResolving}
        className="w-full min-h-tap rounded-lg bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {isResolving ? 'Resolving...' : 'Resolve Top'}
      </button>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleClear}
          disabled={!hasItems}
          className="flex-1 min-h-tap rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-60 transition"
        >
          Clear Stack
        </button>
        <button
          type="button"
          onClick={handleNewStack}
          className="flex-1 min-h-tap rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          New Stack
        </button>
      </div>
    </div>
  )
}
