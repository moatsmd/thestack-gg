'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface ShareGameModalProps {
  isOpen: boolean
  shareUrl: string
  onClose: () => void
  onStop: () => void
}

export function ShareGameModal({ isOpen, shareUrl, onClose, onStop }: ShareGameModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')

  useEffect(() => {
    if (!isOpen || !shareUrl) {
      setQrDataUrl(null)
      return
    }

    QRCode.toDataURL(shareUrl, { width: 240, margin: 1 })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(null))
  }, [isOpen, shareUrl])

  useEffect(() => {
    if (copyState === 'copied') {
      const timer = setTimeout(() => setCopyState('idle'), 1500)
      return () => clearTimeout(timer)
    }
  }, [copyState])

  if (!isOpen) {
    return null
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopyState('copied')
    } catch {
      setCopyState('idle')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[var(--surface-1)] text-[var(--ink)] shadow-lg border border-white/10 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Share</p>
            <h2 className="text-2xl font-semibold">Share this game state</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-tap rounded-md px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/5"
          >
            Close
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
          <div className="rounded-xl border border-white/10 bg-[var(--surface-2)] p-3">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Share QR code" className="h-48 w-48" />
            ) : (
              <div className="h-48 w-48 flex items-center justify-center text-sm text-[var(--muted)]">
                Generating QR…
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <p className="text-sm text-[var(--muted)]">
              Share this link with your table. Viewers will see live updates.
            </p>
            <div className="rounded-lg border border-white/10 bg-[var(--surface-2)] px-3 py-2 text-sm break-all">
              {shareUrl}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="min-h-tap rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/5"
              >
                {copyState === 'copied' ? 'Copied' : 'Copy link'}
              </button>
              <button
                type="button"
                onClick={onStop}
                className="min-h-tap rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--accent-3)] hover:bg-white/5"
              >
                Stop sharing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
