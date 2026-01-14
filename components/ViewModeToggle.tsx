'use client'

type ViewMode = 'single' | 'grid'

interface ViewModeToggleProps {
  mode: ViewMode
  onModeChange: (mode: ViewMode) => void
}

export function ViewModeToggle({ mode, onModeChange }: ViewModeToggleProps) {
  return (
    <div
      className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-1"
      role="group"
      aria-label="View mode"
    >
      <button
        type="button"
        onClick={() => mode !== 'single' && onModeChange('single')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === 'single'
            ? 'bg-purple-600 text-white'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="Single card view"
        aria-pressed={mode === 'single'}
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <rect x="4" y="4" width="16" height="16" strokeWidth="2" rx="2" />
          </svg>
          Single
        </span>
      </button>

      <button
        type="button"
        onClick={() => mode !== 'grid' && onModeChange('grid')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === 'grid'
            ? 'bg-purple-600 text-white'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="Grid view"
        aria-pressed={mode === 'grid'}
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="7" height="7" strokeWidth="2" rx="1" />
            <rect x="14" y="3" width="7" height="7" strokeWidth="2" rx="1" />
            <rect x="3" y="14" width="7" height="7" strokeWidth="2" rx="1" />
            <rect x="14" y="14" width="7" height="7" strokeWidth="2" rx="1" />
          </svg>
          Grid
        </span>
      </button>
    </div>
  )
}
