import { KeywordDefinition, KEYWORDS_MAP } from './keywords-data'

export interface ParsedKeyword {
  keyword: string
  definition: KeywordDefinition
  startIndex: number
  endIndex: number
}

/**
 * Parse oracle text and identify all keywords present
 * Returns array of found keywords with their positions in the text
 */
export function parseOracleTextForKeywords(
  oracleText: string,
  keywords: KeywordDefinition[] = Array.from(KEYWORDS_MAP.values())
): ParsedKeyword[] {
  if (!oracleText) return []

  const parsedKeywords: ParsedKeyword[] = []
  const lowerText = oracleText.toLowerCase()

  // Sort keywords by length (longest first) to match longer keywords first
  // This prevents matching "Flying" when the text actually says "Flying or reach"
  const sortedKeywords = [...keywords].sort((a, b) => b.keyword.length - a.keyword.length)

  for (const keywordDef of sortedKeywords) {
    const keyword = keywordDef.keyword.toLowerCase()

    // Create regex that matches keyword as a whole word
    // This prevents matching "Flash" in "Flashback"
    const regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'gi')
    let match: RegExpExecArray | null

    while ((match = regex.exec(lowerText)) !== null) {
      const startIndex = match.index
      const endIndex = startIndex + match[0].length

      // Check if this position is already covered by a longer keyword
      const isOverlapping = parsedKeywords.some(
        (pk) =>
          (startIndex >= pk.startIndex && startIndex < pk.endIndex) ||
          (endIndex > pk.startIndex && endIndex <= pk.endIndex)
      )

      if (!isOverlapping) {
        parsedKeywords.push({
          keyword: oracleText.substring(startIndex, endIndex), // Preserve original casing from source text
          definition: keywordDef,
          startIndex,
          endIndex,
        })
      }
    }
  }

  // Sort by position in text
  return parsedKeywords.sort((a, b) => a.startIndex - b.startIndex)
}

/**
 * Helper to escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Check if a given text contains a specific keyword
 */
export function containsKeyword(oracleText: string, keyword: string): boolean {
  const keywords = parseOracleTextForKeywords(oracleText)
  return keywords.some((pk) => pk.definition.keyword.toLowerCase() === keyword.toLowerCase())
}

/**
 * Get all unique keywords from oracle text
 */
export function getUniqueKeywords(oracleText: string): KeywordDefinition[] {
  const parsed = parseOracleTextForKeywords(oracleText)
  const unique = new Map<string, KeywordDefinition>()

  for (const pk of parsed) {
    unique.set(pk.definition.keyword.toLowerCase(), pk.definition)
  }

  return Array.from(unique.values())
}
