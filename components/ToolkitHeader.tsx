import { GoldRule } from '@/components/Fleuron'

export function ToolkitHeader() {
  return (
    <header
      className="border-b border-border backdrop-blur-sm transition-colors"
      data-testid="toolkit-header"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 text-center">
        <div className="flex items-center justify-center"><GoldRule /></div>
        <p className="font-display tracking-[0.16em] uppercase text-xs text-muted-foreground mt-3">From the Library</p>
        <h1 className="font-display text-gold-gradient text-xl font-bold tracking-wide mt-2 md:text-3xl">
          Card Lookup
        </h1>
        <p className="font-prose italic text-foreground/80 text-sm mt-1">
          Search the multiverse, powered by Scryfall.
        </p>
      </div>
    </header>
  )
}
