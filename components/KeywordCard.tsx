'use client'

import Link from 'next/link'
import { KeywordDefinition } from '@/lib/keywords-data'

interface KeywordCardProps {
  keyword: KeywordDefinition
}

const typeBadge: Record<KeywordDefinition['type'], string> = {
  ability: 'text-[hsl(220_50%_72%)] border-[hsl(220_50%_60%/0.3)] bg-[hsl(220_50%_60%/0.10)]',
  action: 'text-[hsl(150_45%_65%)] border-[hsl(150_45%_45%/0.3)] bg-[hsl(150_45%_45%/0.10)]',
  mechanic: 'text-[hsl(280_45%_72%)] border-[hsl(280_45%_55%/0.3)] bg-[hsl(280_45%_55%/0.10)]',
}

const tierStyle: Record<KeywordDefinition['tier'], string> = {
  evergreen: 'text-primary border-primary/40 bg-primary/5',
  returning: 'text-[hsl(170_50%_60%)] border-[hsl(170_50%_45%/0.3)]',
  retired: 'text-[hsl(38_15%_60%)] border-[hsl(40_30%_18%)]',
}

const tierLabel: Record<KeywordDefinition['tier'], string> = {
  evergreen: 'Evergreen',
  returning: 'Returning',
  retired: 'Retired',
}

export function KeywordCard({ keyword }: KeywordCardProps) {
  return (
    <article className="panel codex-glow p-5" data-testid="keyword-card">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-xl tracking-wide text-[hsl(38_30%_88%)]">{keyword.keyword}</h3>
        <span
          className={`text-[10px] uppercase tracking-wider font-display px-2 py-0.5 rounded border ${tierStyle[keyword.tier]}`}
          data-testid="tier-badge"
        >
          {tierLabel[keyword.tier]}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className={`text-[10px] uppercase tracking-wider font-display px-2 py-0.5 rounded border ${typeBadge[keyword.type]}`}>
          {keyword.type}
        </span>
      </div>

      <p className="text-sm mt-3 text-[hsl(38_30%_88%)]/90 leading-snug">{keyword.definition}</p>

      {keyword.reminder && (
        <p className="font-prose italic text-[hsl(38_30%_88%)]/70 text-sm mt-2">“{keyword.reminder}”</p>
      )}

      {(keyword.example || keyword.introduced) && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[hsl(38_15%_60%)]">
          {keyword.example && (
            <div>
              <span className="font-display tracking-[0.18em] uppercase text-[10px]">e.g.</span>{' '}
              <span className="text-[hsl(42_75%_65%)]">{keyword.example}</span>
            </div>
          )}
          {keyword.introduced && (
            <div>
              <span className="font-display tracking-[0.18em] uppercase text-[10px]">Since</span>{' '}
              <span className="text-[hsl(38_30%_88%)]/80">{keyword.introduced}</span>
            </div>
          )}
        </div>
      )}

      {keyword.scryfallQuery && (
        <Link
          href={`/toolkit?q=${encodeURIComponent(keyword.scryfallQuery)}`}
          className="inline-block mt-3 text-xs text-[hsl(42_75%_65%)] hover:text-[hsl(42_75%_55%)] hover:underline"
          data-testid="scryfall-link"
        >
          See cards →
        </Link>
      )}
    </article>
  )
}
