'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { RulesHeader } from '@/components/RulesHeader'
import { CardSearchInput } from '@/components/CardSearchInput'
import { CardSearchHelp } from '@/components/CardSearchHelp'
import { CardDisplay } from '@/components/CardDisplay'
import { CardRulings } from '@/components/CardRulings'
import { ErrorBanner } from '@/components/ErrorBanner'
import { useCardSearch } from '@/hooks/useCardSearch'
import { useCardRulings } from '@/hooks/useCardRulings'
import { useComprehensiveRules } from '@/hooks/useComprehensiveRules'

function RulesWorkspace() {
  const params = useSearchParams()
  const initialCard = params.get('q') ?? ''
  const [activeTab, setActiveTab] = useState<'card' | 'rules'>(initialCard ? 'card' : 'rules')
  const [hasSearched, setHasSearched] = useState(false)
  const cardSearch = useCardSearch()
  const cardRulings = useCardRulings(cardSearch.selectedCard)
  const rules = useComprehensiveRules()
  const searchCard = cardSearch.search
  useEffect(() => {
    if (initialCard.trim()) { setActiveTab('card'); void searchCard(initialCard) }
  }, [initialCard, searchCard])

  const handleSelectSuggestion = (suggestion: string) => {
    void cardSearch.search(suggestion)
  }

  return (
    <div className="min-h-screen text-foreground">
      <RulesHeader />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
        <div className="flex gap-2" role="group" aria-label="Rules lookup mode">
          <button
            type="button"
            onClick={() => setActiveTab('card')}
            aria-pressed={activeTab === 'card'}
            className={`flex-1 min-h-11 rounded-md px-4 py-2 text-sm font-display tracking-wide transition-colors ${
              activeTab === 'card'
                ? 'bg-primary text-primary-foreground'
                : 'panel hover-elevate text-muted-foreground'
            }`}
          >
            Card rulings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            aria-pressed={activeTab === 'rules'}
            className={`flex-1 min-h-11 rounded-md px-4 py-2 text-sm font-display tracking-wide transition-colors ${
              activeTab === 'rules'
                ? 'bg-primary text-primary-foreground'
                : 'panel hover-elevate text-muted-foreground'
            }`}
          >
            Comprehensive rules
          </button>
        </div>

        <div className="space-y-6">
          <section className={activeTab === 'card' ? 'space-y-4' : 'hidden'} aria-label="Card rulings">
            <div className="panel codex-glow p-5 space-y-4">
              <h2 className="font-display tracking-wide text-lg text-foreground">Card Search</h2>
              <span className="block w-7 h-px bg-primary/40" />
              <CardSearchInput
                value={cardSearch.query}
                onChange={cardSearch.setQuery}
                suggestions={cardSearch.suggestions}
                onSelectSuggestion={handleSelectSuggestion}
                onSearch={cardSearch.search}
                isLoading={cardSearch.isLoading}
              />
              <CardSearchHelp />
              {cardSearch.error && <ErrorBanner message={cardSearch.error} />}
            </div>

            {cardSearch.selectedCard && (
              <div className="space-y-4">
                <CardDisplay key={cardSearch.selectedCard.id} card={cardSearch.selectedCard} />
                <CardRulings
                  rulings={cardRulings.rulings}
                  isLoading={cardRulings.isLoading}
                  error={cardRulings.error}
                />
              </div>
            )}
          </section>

          <section className={activeTab === 'rules' ? 'space-y-4' : 'hidden'} aria-label="Comprehensive rules">
            <div className="panel codex-glow p-5 space-y-4">
              <h2 className="font-display tracking-wide text-lg text-foreground">Comprehensive Rules</h2>
              <span className="block w-7 h-px bg-primary/40" />

              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  setHasSearched(true)
                  rules.search()
                }}
              >
                <input
                  type="text"
                  aria-label="Search Comprehensive Rules"
                  value={rules.query}
                  onChange={(event) => rules.setQuery(event.target.value)}
                  placeholder="A topic or rule number, e.g. priority or 702.1"
                  className="min-w-0 min-h-11 flex-1 rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="rounded-md bg-primary text-primary-foreground hover-elevate px-4 py-2 text-sm font-display tracking-wide transition"
                >
                  Search
                </button>
              </form>
              <div className="flex flex-wrap gap-2" aria-label="Common rule questions">
                {['Priority', 'Commander', 'Combat damage', 'Mulligan'].map(topic => <button key={topic} type="button" className="min-h-11 px-3 panel text-sm hover-elevate" onClick={() => { rules.setQuery(topic); setHasSearched(true); void rules.search() }}>{topic}</button>)}
              </div>
              <p className="text-sm text-muted-foreground">Official rules from Wizards of the Coast. <a className="underline text-primary" href="https://magic.wizards.com/en/rules" target="_blank" rel="noopener noreferrer">View the source document ↗</a></p>

              {rules.error && <ErrorBanner message={rules.error} />}
              {rules.isLoading && (
                <div className="text-sm text-muted-foreground font-prose italic">Loading rules…</div>
              )}
            </div>

            {!rules.isLoading && (
              <div className="grid gap-4 md:grid-cols-[minmax(220px,1fr)_2fr]">
                <div className="panel p-5 space-y-3">
                  <h3 className="font-display tracking-[0.18em] uppercase text-[10px] text-muted-foreground">Results {rules.results.length > 0 && `(${rules.results.length})`}</h3>
                  {rules.results.length === 0 ? (
                    <div className="text-sm text-muted-foreground font-prose italic">
                      {hasSearched && rules.query.trim() ? 'No matching rules. Try a shorter topic or an exact rule number.' : 'Search a topic or choose a common question above.'}
                    </div>
                  ) : (
                    <ul className="space-y-2 max-h-72 overflow-y-auto pr-1" aria-label="Matching rule sections">
                      {rules.results.map((section) => (
                        <li key={section.id}>
                          <button
                            type="button"
                            onClick={() => rules.selectSection(section)}
                            aria-pressed={rules.selected?.id === section.id}
                            className="w-full text-left panel-elevated px-3 py-2 hover-elevate"
                          >
                            <div className="text-xs font-display tracking-wider text-primary">
                              {section.id}
                            </div>
                            <div className="text-sm text-foreground line-clamp-2">
                              {section.title}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="panel p-5 md:p-7 space-y-3" aria-live="polite" aria-atomic="true">
                  <h3 className="font-display tracking-[0.18em] uppercase text-[10px] text-muted-foreground">Rule Detail</h3>
                  {rules.selected ? (
                    <>
                      <div className="text-xs font-display tracking-wider text-primary">
                        {rules.selected.id}
                      </div>
                      <div className="text-lg text-foreground whitespace-pre-wrap font-prose leading-relaxed">
                        {rules.selected.body}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground font-prose italic">
                      Select a rule to view details.
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default function RulesPage() {
  return <Suspense fallback={<p role="status" className="p-8">Opening rules lookup…</p>}><RulesWorkspace /></Suspense>
}
