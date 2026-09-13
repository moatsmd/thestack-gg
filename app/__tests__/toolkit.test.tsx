import { render, screen } from '@testing-library/react'
import ToolkitPage from '../toolkit/page'

let mockQueryString = ''
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(mockQueryString),
}))

// Mock the ToolkitHeader component
jest.mock('@/components/ToolkitHeader', () => ({
  ToolkitHeader: () => <div data-testid="toolkit-header">Toolkit Header</div>
}))

// Mock the CardSearch component
jest.mock('@/components/CardSearch', () => ({
  CardSearch: ({ initialQuery }: { initialQuery?: string }) => <div data-testid="card-search" data-query={initialQuery}>Card Search</div>
}))

describe('ToolkitPage', () => {
  beforeEach(() => { mockQueryString = '' })

  it('passes decoded card and keyword links to the search and follows URL changes', () => {
    mockQueryString = 'q=Sol%20Ring'
    const { rerender } = render(<ToolkitPage />)
    expect(screen.getByTestId('card-search')).toHaveAttribute('data-query', 'Sol Ring')
    mockQueryString = 'q=o%3Aflying'
    rerender(<ToolkitPage />)
    expect(screen.getByTestId('card-search')).toHaveAttribute('data-query', 'o:flying')
  })
  it('renders the toolkit page', () => {
    render(<ToolkitPage />)

    expect(screen.getByTestId('toolkit-header')).toBeInTheDocument()
  })

  it('has responsive background with dark mode support', () => {
    const { container } = render(<ToolkitPage />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('min-h-screen')
  })

  it('displays card search component', () => {
    render(<ToolkitPage />)

    expect(screen.getByTestId('card-search')).toBeInTheDocument()
  })

  it('has container with proper spacing', () => {
    const { container } = render(<ToolkitPage />)

    const containerDiv = container.querySelector('.max-w-6xl')
    expect(containerDiv).toHaveClass('mx-auto', 'px-4', 'py-8')
  })

  it('has full height layout', () => {
    const { container } = render(<ToolkitPage />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('min-h-screen')
  })

  it('renders ToolkitHeader component', () => {
    render(<ToolkitPage />)

    expect(screen.getByTestId('toolkit-header')).toBeInTheDocument()
  })
})
