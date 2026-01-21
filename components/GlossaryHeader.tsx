export function GlossaryHeader() {
  return (
    <header
      className="border-b border-white/10 bg-[var(--surface-1)]/95 text-[var(--ink)] backdrop-blur transition-colors"
      data-testid="glossary-header"
    >
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-xl font-bold tracking-wide">Keywords Glossary</h1>
      </div>
    </header>
  )
}
