export interface ComprehensiveRuleSection {
  id: string
  title: string
  body: string
}

const RULE_LINE_REGEX = /^(\d{3}\.\d+[a-z]?)(?:\.)?\s+(.*)$/

export function parseComprehensiveRules(text: string): ComprehensiveRuleSection[] {
  const sections: ComprehensiveRuleSection[] = []
  const lines = text.split(/\r?\n/)
  let current: ComprehensiveRuleSection | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      continue
    }

    const match = trimmed.match(RULE_LINE_REGEX)
    if (match) {
      if (current) {
        sections.push(current)
      }

      const [, id, rest] = match
      current = {
        id,
        title: rest.trim(),
        body: rest.trim(),
      }
      continue
    }

    if (current) {
      current.body = `${current.body} ${trimmed}`.trim()
    }
  }

  if (current) {
    sections.push(current)
  }

  return sections
}

export function searchComprehensiveRules(
  sections: ComprehensiveRuleSection[],
  query: string
): ComprehensiveRuleSection[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) {
    return []
  }

  const scored = sections
    .map((section) => {
      const idMatch = section.id.toLowerCase() === trimmed
      const titleMatch = section.title.toLowerCase().includes(trimmed)
      const bodyMatch = section.body.toLowerCase().includes(trimmed)

      if (!idMatch && !titleMatch && !bodyMatch) {
        return null
      }

      const score = (idMatch ? 3 : 0) + (titleMatch ? 2 : 0) + (bodyMatch ? 1 : 0)
      return { section, score }
    })
    .filter((entry): entry is { section: ComprehensiveRuleSection; score: number } => entry !== null)

  return scored.sort((a, b) => b.score - a.score).map((entry) => entry.section)
}
