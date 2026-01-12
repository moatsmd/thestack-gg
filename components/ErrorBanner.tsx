'use client'

interface ErrorBannerProps {
  message: string
  onDismiss?: () => void
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div
      className="rounded-lg bg-red-100 border border-red-400 p-4 flex items-start justify-between"
      data-testid="error-banner"
      role="alert"
    >
      <div className="flex-1">
        <p className="text-red-700 text-sm">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-4 text-red-700 hover:text-red-900 font-bold"
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  )
}
