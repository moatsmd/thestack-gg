'use client'

/**
 * Anchor wrapper that fires `outbound_click` analytics on click. Use for any
 * external link that ISN'T an affiliate destination (those have their own
 * `affiliate_click` event via <BuyLinks />).
 */

import { AnchorHTMLAttributes, MouseEvent } from 'react'
import { track } from '@/lib/analytics'

export interface OutboundLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Surface where the click happened, e.g. 'rules-source', 'news-rail'. */
  from?: string
  /** Optional label for the destination (defaults to the URL host). */
  label?: string
}

export function OutboundLink({
  href,
  from = 'unknown',
  label,
  onClick,
  target = '_blank',
  rel = 'noopener noreferrer',
  children,
  ...rest
}: OutboundLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (href) {
      let host = ''
      try {
        host = new URL(href, typeof window !== 'undefined' ? window.location.href : 'https://www.thestack.gg').host
      } catch {
        host = ''
      }
      track('outbound_click', { href, host, from, label: label ?? host })
    }
    onClick?.(e)
  }

  return (
    <a href={href} target={target} rel={rel} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}
