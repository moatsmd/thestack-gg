'use client'

interface HelpLegendBannerProps {
  isCommander: boolean
  onDismiss: () => void
}

export function HelpLegendBanner({ isCommander, onDismiss }: HelpLegendBannerProps) {
  return (
    <div
      className="bg-purple-600 text-white px-4 py-3"
      data-testid="help-legend-banner"
    >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div className="font-semibold">📖 Quick Guide</div>
          <button
            type="button"
            onClick={onDismiss}
            className="ml-4 rounded-md px-3 py-1 text-sm font-semibold hover:bg-purple-700"
            aria-label="Dismiss help legend"
          >
            Got it
          </button>
        </div>

        <div className="text-sm space-y-1">
          <div className="font-medium">Icons:</div>
          <div className="pl-3 space-y-0.5">
            {isCommander && (
              <div>• <span className="font-medium">CMD</span> - Commander damage (tap to track)</div>
            )}
            <div>• <span className="font-medium">☠️</span> - Poison counters (lethal at 10)</div>
            <div>• <span className="font-medium">💎</span> - Mana pool (floating mana)</div>
          </div>
        </div>

        <div className="text-sm">
          <span className="font-medium">Badge Colors:</span> Gray (safe) | Yellow (warning) | Red (lethal)
        </div>
      </div>
    </div>
  )
}
