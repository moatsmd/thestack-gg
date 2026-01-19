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
    <div className="min-h-screen arcane-shell text-[var(--ink)]">
      <RulesHeader />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'card'
                ? 'bg-[var(--accent-4)] text-white'
                : 'bg-[var(--surface-1)] text-[var(--muted)] border border-white/10'
            }`}
          >
            Card
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'rules'
                ? 'bg-[var(--accent-4)] text-white'
                : 'bg-[var(--surface-1)] text-[var(--muted)] border border-white/10'
            }`}
          >
            Rules
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className={activeTab === 'card' ? 'space-y-4' : 'hidden md:block'}>
            <div className="arcane-panel mana-border rounded-2xl p-4 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-[var(--ink)]">Card Search</h2>
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

          <section className={activeTab === 'rules' ? 'space-y-4' : 'hidden md:block'}>
            <div className="arcane-panel mana-border rounded-2xl p-4 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-[var(--ink)]">Comprehensive Rules</h2>

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
                  className="flex-1 rounded-md border border-white/10 bg-[var(--surface-1)] px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-4)]"
                />
                <button
                  type="submit"
                  className="rounded-md bg-[var(--accent-4)] hover:bg-[var(--accent-4)]/90 px-4 py-2 text-sm font-semibold text-white transition"
                >
                  Search
                </button>
              </form>

              {rules.error && <ErrorBanner message={rules.error} />}
              {rules.isLoading && (
                <div className="text-sm text-[var(--muted)]">Loading rules...</div>
              )}
            </div>

            {!rules.isLoading && (
              <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
                <div className="arcane-panel mana-border rounded-2xl p-4 shadow-sm space-y-3">
                  <h3 className="text-sm font-semibold text-[var(--ink)]">Results</h3>
                  {rules.results.length === 0 ? (
                    <div className="text-sm text-[var(--muted)]">
                      Search to see matching rule sections.
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {rules.results.map((section) => (
                        <li key={section.id}>
                          <button
                            type="button"
                            onClick={() => rules.selectSection(section)}
                            className="w-full text-left rounded-md border border-white/10 px-3 py-2 hover:bg-white/5"
                          >
                            <div className="text-xs font-semibold text-[var(--muted)]">
                              {section.id}
                            </div>
                            <div className="text-sm text-[var(--ink)]">
                              {section.title}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="arcane-panel mana-border rounded-2xl p-4 shadow-sm space-y-3">
                  <h3 className="text-sm font-semibold text-[var(--ink)]">Rule Detail</h3>
                  {rules.selected ? (
                    <>
                      <div className="text-xs font-semibold text-[var(--muted)]">
                        {rules.selected.id}
                      </div>
                      <div className="text-sm font-semibold text-[var(--ink)]">
                        {rules.selected.title}
                      </div>
                      <div className="text-sm text-[var(--muted)] whitespace-pre-wrap">
                        {rules.selected.body}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-[var(--muted)]">
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
