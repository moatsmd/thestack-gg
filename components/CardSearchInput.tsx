'use client'

import { useState, useRef, useEffect } from 'react'

interface CardSearchInputProps {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  onSelectSuggestion: (suggestion: string) => void
  onSearch: () => void
  isLoading: boolean
}

export function CardSearchInput({
  value,
  onChange,
  suggestions,
  onSelectSuggestion,
  onSearch,
  isLoading,
}: CardSearchInputProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Show dropdown when suggestions change
  useEffect(() => {
    if (suggestions.length > 0) {
      setIsDropdownOpen(true)
      setHighlightedIndex(-1)
    } else {
      setIsDropdownOpen(false)
    }
  }, [suggestions])

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
        onSearch()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break

      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break

      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          onSelectSuggestion(suggestions[highlightedIndex])
          setIsDropdownOpen(false)
        } else {
          onSearch()
        }
        break

      case 'Escape':
        e.preventDefault()
        setIsDropdownOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  const handleSelectSuggestion = (suggestion: string) => {
    onSelectSuggestion(suggestion)
    setIsDropdownOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="relative w-full" data-testid="card-search-input">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search for a card..."
            className="w-full min-h-[48px] px-4 py-3 text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Card search input"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-expanded={isDropdownOpen}
          />

          {isDropdownOpen && suggestions.length > 0 && (
            <div
              ref={dropdownRef}
              id="search-suggestions"
              role="listbox"
              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  type="button"
                  role="option"
                  aria-selected={index === highlightedIndex}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className={`w-full text-left px-4 py-3 min-h-[48px] border-b border-gray-100 last:border-b-0 transition ${
                    index === highlightedIndex
                      ? 'bg-blue-50 text-blue-900'
                      : 'hover:bg-gray-50 text-gray-900'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onSearch}
          disabled={isLoading}
          className="min-h-[48px] px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
          aria-label="Search"
        >
          {isLoading ? (
            <span className="inline-block animate-spin">⟳</span>
          ) : (
            'Search'
          )}
        </button>
      </div>
    </div>
  )
}
