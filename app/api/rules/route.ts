import { NextResponse } from 'next/server'
import { parseComprehensiveRules, ComprehensiveRuleSection } from '@/lib/rules-parser'

const RULES_PAGE_URL = 'https://magic.wizards.com/en/rules'
const CACHE_DURATION = 14 * 24 * 60 * 60 // 14 days in seconds

// In-memory cache (persists during function lifetime)
let cachedRules: ComprehensiveRuleSection[] | null = null
let cachedAt: number = 0

/**
 * API Route: GET /api/rules
 * Fetches comprehensive rules from WotC, parses them, and caches for 14 days
 */
export async function GET() {
  try {
    // Check if cache is still valid
    const now = Date.now()
    const cacheAge = (now - cachedAt) / 1000

    if (cachedRules && cacheAge < CACHE_DURATION) {
      console.log(`[Rules API] Returning cached rules (age: ${Math.floor(cacheAge / 3600)}h)`)
      return NextResponse.json(
        { rules: cachedRules, cached: true, cachedAt },
        {
          headers: {
            'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
          },
        }
      )
    }

    console.log('[Rules API] Fetching fresh rules...')

    // Step 1: Scrape the rules page to find the TXT URL
    const rulesPageResponse = await fetch(RULES_PAGE_URL)
    if (!rulesPageResponse.ok) {
      throw new Error(`Failed to fetch rules page: ${rulesPageResponse.status}`)
    }

    const html = await rulesPageResponse.text()

    // Extract TXT download link using regex
    // Pattern: https://media.wizards.com/YYYY/downloads/MagicCompRules YYYYMMDD.txt
    const txtUrlMatch = html.match(
      /https:\/\/media\.wizards\.com\/\d{4}\/downloads\/MagicCompRules\s+\d{8}\.txt/i
    )

    if (!txtUrlMatch) {
      throw new Error('Could not find TXT download link on rules page')
    }

    const txtUrl = txtUrlMatch[0]
    console.log(`[Rules API] Found TXT URL: ${txtUrl}`)

    // Step 2: Download the TXT file
    const rulesResponse = await fetch(txtUrl)
    if (!rulesResponse.ok) {
      throw new Error(`Failed to fetch rules TXT: ${rulesResponse.status}`)
    }

    const rulesText = await rulesResponse.text()
    console.log(`[Rules API] Downloaded ${rulesText.length} characters`)

    // Step 3: Parse the rules
    const parsedRules = parseComprehensiveRules(rulesText)
    console.log(`[Rules API] Parsed ${parsedRules.length} rule sections`)

    // Step 4: Cache the results
    cachedRules = parsedRules
    cachedAt = now

    return NextResponse.json(
      { rules: parsedRules, cached: false, cachedAt: now },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
        },
      }
    )
  } catch (error) {
    console.error('[Rules API] Error:', error)

    // If we have stale cached rules, return them as fallback
    if (cachedRules) {
      console.log('[Rules API] Returning stale cached rules as fallback')
      return NextResponse.json(
        { rules: cachedRules, cached: true, cachedAt, stale: true },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch comprehensive rules', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
