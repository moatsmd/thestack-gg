'use client'

import { parseOracleTextForKeywords, ParsedKeyword } from '@/lib/keywords-parser'
import { KeywordTooltip } from './KeywordTooltip'

interface OracleTextWithKeywordsProps {
  oracleText: string
  className?: string
  'data-testid'?: string
}

export function OracleTextWithKeywords({
  oracleText,
  className = '',
  'data-testid': dataTestId,
}: OracleTextWithKeywordsProps) {
  if (!oracleText) {
    return null
  }

  // Parse oracle text to find keywords
  const parsedKeywords = parseOracleTextForKeywords(oracleText)

  if (parsedKeywords.length === 0) {
    // No keywords found, render as plain text
    return (
      <div className={className} data-testid={dataTestId}>
        {oracleText}
      </div>
    )
  }

  // Split text into segments: plain text and keywords
  const segments: Array<{ text: string; isKeyword: boolean; keyword?: ParsedKeyword }> = []
  let lastIndex = 0

  for (const pk of parsedKeywords) {
    // Add text before keyword
    if (pk.startIndex > lastIndex) {
      segments.push({
        text: oracleText.substring(lastIndex, pk.startIndex),
        isKeyword: false,
      })
    }

    // Add keyword
    segments.push({
      text: pk.keyword,
      isKeyword: true,
      keyword: pk,
    })

    lastIndex = pk.endIndex
  }

  // Add any remaining text after the last keyword
  if (lastIndex < oracleText.length) {
    segments.push({
      text: oracleText.substring(lastIndex),
      isKeyword: false,
    })
  }

  return (
    <div className={className} data-testid={dataTestId}>
      {segments.map((segment, index) =>
        segment.isKeyword && segment.keyword ? (
          <KeywordTooltip key={`${segment.text}-${index}`} keyword={segment.keyword.definition}>
            {segment.text}
          </KeywordTooltip>
        ) : (
          <span key={index}>{segment.text}</span>
        )
      )}
    </div>
  )
}
