/**
 * Test stub for `@vercel/analytics` and `@vercel/speed-insights`.
 *
 * The real packages ship as ESM and their `track()` reaches for browser
 * globals on import, which jsdom doesn't supply cleanly. In tests we just
 * record calls so suites can assert on them when needed.
 */

import * as React from 'react'

export const trackCalls: Array<{ event: string; properties?: Record<string, unknown> }> = []

export const track = (event: string, properties?: Record<string, unknown>) => {
  trackCalls.push({ event, properties })
}

export const Analytics = () => null
export const SpeedInsights = () => null

export default { track, Analytics, SpeedInsights }
