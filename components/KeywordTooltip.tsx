'use client'

import { useState, useRef, useEffect } from 'react'
import { KeywordDefinition } from '@/lib/keywords-data'

interface KeywordTooltipProps {
  keyword: KeywordDefinition
  children: React.ReactNode
}

export function KeywordTooltip({ keyword, children }: KeywordTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close tooltip when clicking outside (mobile)
  useEffect(() => {
    if (!isMobile || !isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobile, isOpen])

  const handleInteraction = () => {
    if (isMobile) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <span className="relative inline-block" ref={tooltipRef}>
      {/* Trigger */}
      <span
        className="cursor-help underline decoration-dotted decoration-teal-500 dark:decoration-teal-400"
        onMouseEnter={() => !isMobile && setIsOpen(true)}
        onMouseLeave={() => !isMobile && setIsOpen(false)}
        onClick={handleInteraction}
        data-testid="keyword-trigger"
      >
        {children}
      </span>

      {/* Tooltip */}
      {isOpen && (
        <div
          className="absolute z-50 w-64 p-3 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-xl border border-gray-700 text-sm left-1/2 transform -translate-x-1/2 bottom-full mb-2"
          data-testid="keyword-tooltip"
        >
          {/* Arrow */}
          <div className="absolute w-3 h-3 bg-gray-900 dark:bg-gray-800 border-r border-b border-gray-700 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1.5" />

          {/* Content */}
          <div className="relative">
            <div className="font-bold mb-1">{keyword.keyword}</div>
            <div className="text-gray-200 dark:text-gray-300 mb-1">{keyword.definition}</div>
            {keyword.reminder && (
              <div className="text-xs text-gray-400 dark:text-gray-500 italic">
                ({keyword.reminder})
              </div>
            )}
          </div>
        </div>
      )}
    </span>
  )
}
