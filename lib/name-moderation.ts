import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
  DataSet,
  pattern,
} from 'obscenity'

/**
 * Name moderation.
 *
 * TheStack.gg is public-by-link. Pod profiles, recap pages, and OG images
 * surface user-entered names everywhere. We block slurs and hard offensive
 * terms (sexual violence, hate speech) but explicitly *allow* casual
 * profanity — MTG players talk like adults, and false positives on names
 * like "Edgar's Dick" or "Shitfaced Friday" would be worse than the rare
 * "fuck" slipping through.
 *
 * The rules:
 *   - Block: slurs (racial, anti-LGBTQ, ableist), sexual violence (rape,
 *     incest), pedo terms.
 *   - Allow: shit, fuck, ass, dick, piss, hell, damn, etc.
 *
 * obscenity handles leetspeak (n1gg3r, f@g) and word boundaries via the
 * `englishRecommendedTransformers` preset.
 */

/**
 * obscenity's English dataset includes ~69 terms. We keep only the
 * categories we actually want to block. Anything not in this allowlist
 * gets stripped from the dataset.
 */
const BLOCKED_WORDS = new Set<string>([
  // Slurs (racial / ethnic)
  'abo',
  'abeed',
  'africoon',
  'arabush',
  'boonga',
  'chingchong',
  'chink',
  'kike',
  'negro',
  'nigger',
  // Slurs (anti-LGBTQ)
  'dyke',
  'fag',
  'tranny',
  // Slurs (ableist)
  'retard',
  'spastic',
  // Sexual violence
  'rape',
  'incest',
  'bestiality',
  // Misc hard offensive
  'cuck',
])

const moderationDataset = new DataSet<{ originalWord: string }>()
  .addAll(englishDataset)
  .removePhrasesIf((phrase) => !BLOCKED_WORDS.has(phrase.metadata?.originalWord ?? ''))

/**
 * Custom additions beyond the obscenity dataset: terms not in the upstream
 * list that we still want to block. Keep this list short — every entry is
 * a potential false positive.
 */
const customBlocked: { word: string; pattern: RegExp }[] = [
  // Slurs not in the upstream dataset
  { word: 'gook', pattern: /^(?:gook)$|gook(?=s?\b)/i },
  { word: 'wetback', pattern: /wetback/i },
  { word: 'spic', pattern: /\bspic\b/i },
  { word: 'jap', pattern: /\bjap(?:s)?\b/i },
  // Pedo / minor-related sexual content
  { word: 'pedo', pattern: /\bpedo(?:phile|s)?\b/i },
  { word: 'cp', pattern: /\bcp\b.*(?:porn|pic)/i },
  { word: 'loli', pattern: /\blolic[oa]n\b|\bloli\b/i },
  { word: 'shota', pattern: /\bshota(?:c[oa]n)?\b/i },
]

let cachedMatcher: RegExpMatcher | null = null

const getMatcher = (): RegExpMatcher => {
  if (!cachedMatcher) {
    cachedMatcher = new RegExpMatcher({
      ...moderationDataset.build(),
      ...englishRecommendedTransformers,
    })
  }
  return cachedMatcher
}

export type ModerationResult =
  | { ok: true }
  | { ok: false; reason: string }

/**
 * Check a single name. Returns `{ ok: true }` for clean input, otherwise
 * a short user-facing reason. The reason is intentionally vague — we
 * don't want to teach bad actors which exact word triggered.
 */
export const checkName = (raw: string): ModerationResult => {
  const value = (raw ?? '').trim()
  if (!value) return { ok: true } // empty is handled elsewhere

  // Custom patterns first (cheap, explicit)
  for (const { pattern } of customBlocked) {
    if (pattern.test(value)) {
      return { ok: false, reason: 'Please pick a different name — TheStack.gg is public.' }
    }
  }

  // obscenity handles leetspeak / spacing / word boundaries.
  if (getMatcher().hasMatch(value)) {
    return { ok: false, reason: 'Please pick a different name — TheStack.gg is public.' }
  }

  return { ok: true }
}

/**
 * Validate a labeled set of names in one pass. Returns the first failing
 * field with a context-aware message, or `{ ok: true }` if everything
 * passes. Use this from API routes so the rejection error tells the
 * client which field to highlight.
 */
export type LabeledName = { label: string; value: string | undefined }

export const checkNames = (
  fields: LabeledName[],
): { ok: true } | { ok: false; field: string; error: string } => {
  for (const { label, value } of fields) {
    if (!value) continue
    const result = checkName(value)
    if (!result.ok) {
      return {
        ok: false,
        field: label,
        error: `${label}: ${result.reason}`,
      }
    }
  }
  return { ok: true }
}
