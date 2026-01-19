'use client'

export type ViewMode = 'single' | 'grid'

interface ViewModeToggleProps {
  mode: ViewMode
  onModeChange: (mode: ViewMode) => void
}

export function ViewModeToggle({ mode, onModeChange }: ViewModeToggleProps) {
  return (
    <div
      className="inline-flex rounded-lg border border-white/10 bg-[var(--surface-1)] p-1"
      role="group"
      aria-label="View mode"
    >
      <button
        type="button"
        onClick={() => mode !== 'single' && onModeChange('single')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === 'single'
            ? 'bg-[var(--accent-4)] text-white'
            : 'text-[var(--muted)] hover:bg-white/5'
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
            ? 'bg-[var(--accent-4)] text-white'
            : 'text-[var(--muted)] hover:bg-white/5'
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
