export function ToolkitHeader() {
  return (
    <header
      className="border-b border-white/10 bg-[var(--surface-1)]/95 text-[var(--ink)] backdrop-blur transition-colors"
      data-testid="toolkit-header"
    >
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-xl font-bold tracking-wide">Card Lookup</h1>
      </div>
    </header>
  )
}
