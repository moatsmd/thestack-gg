'use client'

import { useCardSearch } from '@/hooks/useCardSearch'
import { CardSearchInput } from './CardSearchInput'
import { CardSearchHelp } from './CardSearchHelp'
import { ErrorBanner } from './ErrorBanner'
import { CardDisplay } from './CardDisplay'

export function CardSearch() {
  const {
    query,
    suggestions,
    selectedCard,
    isLoading,
    error,
    setQuery,
    selectCard,
    search,
  } = useCardSearch()

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion)
  }

  return (
    <div className="space-y-4" data-testid="card-search">
      <CardSearchInput
        value={query}
        onChange={setQuery}
        suggestions={suggestions}
        onSelectSuggestion={handleSelectSuggestion}
        onSearch={search}
        isLoading={isLoading}
      />

      <CardSearchHelp />

      {error && <ErrorBanner message={error} />}

      {selectedCard && <CardDisplay card={selectedCard} />}
    </div>
  )
}
