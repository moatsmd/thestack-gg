/**
 * Centralized analytics helper.
 *
 * Wraps `@vercel/analytics` so:
 *   1. Event names live in one place (no typos drifting).
 *   2. We can swap providers later (Plausible / Umami) by editing this file.
 *   3. Usage stays type-safe across components.
 *
 * Vercel Web Analytics is FREE on Hobby plan; no env vars required at runtime —
 * the <Analytics /> component picks up the project automatically when deployed.
 */

import { track as vercelTrack } from '@vercel/analytics'

/** All custom event names. Add new events here so they remain typed. */
export type AnalyticsEvent =
  | 'tracker_started'              // user begins a tracker game (Wizard → Begin)
  | 'tracker_reset'                // user taps Reset on the tracker
  | 'tracker_share_opened'         // user opens the QR share modal
  | 'card_lookup'                  // user submits a search in /toolkit
  | 'card_modal_opened'            // user opens the full card modal
  | 'glossary_search'              // user types a query into glossary search
  | 'glossary_keyword_clicked'     // user expands a keyword card
  | 'rules_search'                 // user searches in /rules
  | 'dice_rolled'                  // user rolls dice
  | 'affiliate_click'              // user clicks an outbound affiliate link
  | 'outbound_click'               // user clicks any non-affiliate outbound link
  | 'pwa_installed'                // beforeinstallprompt → accepted
  | 'recap_created'                // user ends a tracker game and a recap is generated
  | 'pod_created'                  // user clicks "Save as pod" on a recap
  | 'pod_recap_attached'           // user attaches a recap to an existing pod
  | 'pod_viewed'                   // /pod/[id] page rendered (client-side track)

/**
 * Properties allowed on tracked events. Vercel Analytics only accepts
 * primitives (string | number | boolean | null) on the free tier.
 */
export type AnalyticsProperties = Record<string, string | number | boolean | null>

/**
 * Track a custom event. No-op outside the browser so this is safe to call
 * during SSR/render. All event names are typed via `AnalyticsEvent`.
 */
export function track(event: AnalyticsEvent, properties?: AnalyticsProperties): void {
  if (typeof window === 'undefined') return
  try {
    vercelTrack(event, properties)
  } catch {
    // analytics must never throw into the user's session
  }
}

/**
 * Helper for affiliate clicks. Centralizes the retailer enum and the property
 * shape so downstream queries are consistent.
 */
export type Retailer = 'tcgplayer' | 'cardkingdom' | 'cardmarket' | 'scryfall'

export function trackAffiliateClick(retailer: Retailer, card: string, opts?: { from?: string }): void {
  track('affiliate_click', {
    retailer,
    card,
    from: opts?.from ?? 'unknown',
  })
}
