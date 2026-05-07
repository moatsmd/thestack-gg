'use client'

import React from 'react'
import { parseOracleTextForKeywords, ParsedKeyword } from '@/lib/keywords-parser'
import { KeywordTooltip } from './KeywordTooltip'
import { ManaSymbol } from './ManaSymbol'

interface OracleTextWithKeywordsProps {
  oracleText: string
  className?: string
  'data-testid'?: string
}

/**
 * Replaces any {SYM} tokens in a plain-text run with inline mana-symbol
 * images, leaving non-symbol text untouched.
 *
 * Used inside oracle text so reminder text like "{T}: Add {C}." renders the
 * tap and colorless icons instead of leaving them as raw curly-brace text.
 */
function renderWithSymbols(text: string, keyPrefix: string): React.ReactNode[] {
  const symbolRegex = /\{[^}]+\}/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let n = 0

  while ((match = symbolRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <React.Fragment key={`${keyPrefix}-t-${n}`}>
          {text.slice(lastIndex, match.index)}
        </React.Fragment>
      )
    }
    parts.push(
      <ManaSymbol
        key={`${keyPrefix}-s-${n}`}
        symbol={match[0]}
        size="0.95em"
        className="mx-[1px]"
      />
    )
    lastIndex = match.index + match[0].length
    n++
  }

  if (lastIndex < text.length) {
    parts.push(
      <React.Fragment key={`${keyPrefix}-tail`}>
        {text.slice(lastIndex)}
      </React.Fragment>
    )
  }

  return parts
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
    // No keywords found, but still convert {SYM} tokens to icons.
    return (
      <div className={className} data-testid={dataTestId}>
        {renderWithSymbols(oracleText, 'plain')}
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
          <KeywordTooltip key={`kw-${index}`} keyword={segment.keyword.definition}>
            {segment.text}
          </KeywordTooltip>
        ) : (
          <React.Fragment key={`seg-${index}`}>
            {renderWithSymbols(segment.text, `seg-${index}`)}
          </React.Fragment>
        )
      )}
    </div>
  )
}
