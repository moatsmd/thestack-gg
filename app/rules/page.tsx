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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <RulesHeader />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold ${
              activeTab === 'card'
                ? 'bg-gray-900 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
            }`}
          >
            Card
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold ${
              activeTab === 'rules'
                ? 'bg-gray-900 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
            }`}
          >
            Rules
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className={activeTab === 'card' ? 'space-y-4' : 'hidden md:block'}>
            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Card Search
              </h2>
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
            <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Comprehensive Rules
              </h2>

              <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-sm text-blue-900 dark:text-blue-100">
                <p className="font-semibold mb-1">Note: Comprehensive Rules search currently unavailable</p>
                <p>Due to browser security restrictions, we cannot load the full Comprehensive Rules text. However, you can:</p>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Use the <strong>Card Search</strong> feature to look up specific cards and view their official rulings</li>
                  <li>Visit <a href="https://magic.wizards.com/en/rules" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-700 dark:hover:text-blue-300">magic.wizards.com/en/rules</a> for the complete Comprehensive Rules</li>
                </ul>
              </div>

              <form
                className="flex gap-2 opacity-50 cursor-not-allowed"
                onSubmit={(event) => {
                  event.preventDefault()
                }}
              >
                <input
                  type="text"
                  disabled
                  value={rules.query}
                  onChange={(event) => rules.setQuery(event.target.value)}
                  placeholder="Search unavailable - use Card Rulings instead"
                  className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 px-3 py-2 text-sm text-gray-500 dark:text-gray-400"
                />
                <button
                  type="submit"
                  disabled
                  className="rounded-md bg-gray-400 px-4 py-2 text-sm font-semibold text-white cursor-not-allowed"
                >
                  Search
                </button>
              </form>

              {rules.error && <ErrorBanner message={rules.error} />}
              {rules.isLoading && (
                <div className="text-sm text-gray-600 dark:text-gray-300">Loading rules...</div>
              )}
            </div>

            {!rules.isLoading && (
              <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Results</h3>
                  {rules.results.length === 0 ? (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Search to see matching rule sections.
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {rules.results.map((section) => (
                        <li key={section.id}>
                          <button
                            type="button"
                            onClick={() => rules.selectSection(section)}
                            className="w-full text-left rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                              {section.id}
                            </div>
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {section.title}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Rule Detail</h3>
                  {rules.selected ? (
                    <>
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {rules.selected.id}
                      </div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {rules.selected.title}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {rules.selected.body}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
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
