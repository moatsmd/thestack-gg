'use client'

import { useState } from 'react'

type Props = {
  url: string
  headline: string
  podName?: string
}

export function RecapShareButtons({ url, headline, podName }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Older browsers — no-op.
    }
  }

  const tweetText = encodeURIComponent(`${headline} — ${url}`)
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`
  const discordBlock = `**${podName ?? 'Pod recap'}** — ${headline}\n${url}`

  const copyDiscord = async () => {
    try {
      await navigator.clipboard.writeText(discordBlock)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // no-op
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={copy}
        className="px-5 py-2.5 bg-[hsl(42_75%_55%)] text-[hsl(220_15%_7%)] rounded-md font-medium hover-elevate"
        data-testid="button-copy-link"
      >
        {copied ? 'Copied' : 'Copy link'}
      </button>
      <button
        type="button"
        onClick={copyDiscord}
        className="px-5 py-2.5 panel rounded-md font-medium text-[hsl(38_30%_88%)] hover-elevate"
        data-testid="button-copy-discord"
      >
        Copy for Discord
      </button>
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-5 py-2.5 panel rounded-md font-medium text-[hsl(38_30%_88%)] hover-elevate"
        data-testid="link-share-x"
      >
        Share on X
      </a>
    </div>
  )
}
