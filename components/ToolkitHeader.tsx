import { GoldRule } from '@/components/Fleuron'

export function ToolkitHeader() {
  return (
    <header
      className="border-b border-[hsl(40_30%_18%)] backdrop-blur-sm transition-colors"
      data-testid="toolkit-header"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 text-center">
        <div className="flex items-center justify-center"><GoldRule /></div>
        <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)] mt-3">From the Library</p>
        <h1 className="font-display text-gold-gradient text-xl font-bold tracking-wide mt-2 md:text-3xl">
          Card Lookup
        </h1>
        <p className="font-prose italic text-[hsl(38_30%_88%)]/80 text-sm mt-1">
          Search the multiverse, powered by Scryfall.
        </p>
      </div>
    </header>
  )
}
