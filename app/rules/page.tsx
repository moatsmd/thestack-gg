'use client'

import { useState } from 'react'
import { RulesHeader } from '@/components/RulesHeader'
import { CardSearchInput } from '@/components/CardSearchInput'
import { CardSearchHelp } from '@/components/CardSearchHelp'
import { CardDisplay } from '@/components/CardDisplay'
import { CardRulings } from '@/components/CardRulings'
import { ErrorBanner } from '@/components/ErrorBanner'
import { useCardSearch } from '@/hooks/useCardSearch'
import { useCardRulings } from '@/hooks/useCardRulings'
import { useComprehensiveRules } from '@/hooks/useComprehensiveRules'

export default function RulesPage() {
  const [activeTab, setActiveTab] = useState<'card' | 'rules'>('card')
  const cardSearch = useCardSearch()
  const cardRulings = useCardRulings(cardSearch.selectedCard)
  const rules = useComprehensiveRules()

  const handleSelectSuggestion = (suggestion: string) => {
    cardSearch.setQuery(suggestion)
  }

  return (
    <div className="min-h-screen text-[hsl(38_30%_88%)]">
      <RulesHeader />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
        <div className="flex gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-display tracking-wide transition-colors ${
              activeTab === 'card'
                ? 'bg-primary text-primary-foreground'
                : 'panel hover-elevate text-[hsl(38_15%_60%)]'
            }`}
          >
            Card
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-display tracking-wide transition-colors ${
              activeTab === 'rules'
                ? 'bg-primary text-primary-foreground'
                : 'panel hover-elevate text-[hsl(38_15%_60%)]'
            }`}
          >
            Rules
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className={activeTab === 'card' ? 'space-y-4' : 'hidden md:block space-y-4'}>
            <div className="panel codex-glow p-5 space-y-4">
              <h2 className="font-display tracking-wide text-lg text-[hsl(38_30%_88%)]">Card Search</h2>
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
                <CardDisplay card={cardSearch.selectedCard} />
                <CardRulings
                  rulings={cardRulings.rulings}
                  isLoading={cardRulings.isLoading}
                  error={cardRulings.error}
                />
              </div>
            )}
          </section>

          <section className={activeTab === 'rules' ? 'space-y-4' : 'hidden md:block space-y-4'}>
            <div className="panel codex-glow p-5 space-y-4">
              <h2 className="font-display tracking-wide text-lg text-[hsl(38_30%_88%)]">Comprehensive Rules</h2>
              <span className="block w-7 h-px bg-primary/40" />

              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  rules.search()
                }}
              >
                <input
                  type="text"
                  value={rules.query}
                  onChange={(event) => rules.setQuery(event.target.value)}
                  placeholder="Search Comprehensive Rules (e.g., 'priority', 'stack')"
                  className="flex-1 rounded-md border border-[hsl(40_30%_18%)] bg-transparent px-3 py-2 text-sm text-[hsl(38_30%_88%)] focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="rounded-md bg-primary text-primary-foreground hover-elevate px-4 py-2 text-sm font-display tracking-wide transition"
                >
                  Search
                </button>
              </form>

              {rules.error && <ErrorBanner message={rules.error} />}
              {rules.isLoading && (
                <div className="text-sm text-[hsl(38_15%_60%)] font-prose italic">Loading rules…</div>
              )}
            </div>

            {!rules.isLoading && (
              <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
                <div className="panel p-5 space-y-3">
                  <h3 className="font-display tracking-[0.18em] uppercase text-[10px] text-[hsl(38_15%_60%)]">Results</h3>
                  {rules.results.length === 0 ? (
                    <div className="text-sm text-[hsl(38_15%_60%)] font-prose italic">
                      Search to see matching rule sections.
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {rules.results.map((section) => (
                        <li key={section.id}>
                          <button
                            type="button"
                            onClick={() => rules.selectSection(section)}
                            className="w-full text-left panel-elevated px-3 py-2 hover-elevate"
                          >
                            <div className="text-xs font-display tracking-wider text-primary">
                              {section.id}
                            </div>
                            <div className="text-sm text-[hsl(38_30%_88%)]">
                              {section.title}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="panel p-5 space-y-3">
                  <h3 className="font-display tracking-[0.18em] uppercase text-[10px] text-[hsl(38_15%_60%)]">Rule Detail</h3>
                  {rules.selected ? (
                    <>
                      <div className="text-xs font-display tracking-wider text-primary">
                        {rules.selected.id}
                      </div>
                      <div className="font-display text-base tracking-wide text-[hsl(38_30%_88%)]">
                        {rules.selected.title}
                      </div>
                      <div className="text-sm text-[hsl(38_30%_88%)]/85 whitespace-pre-wrap font-prose leading-relaxed">
                        {rules.selected.body}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-[hsl(38_15%_60%)] font-prose italic">
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
