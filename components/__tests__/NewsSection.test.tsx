import { render, screen } from '@testing-library/react'
import { NewsSection } from '../NewsSection'
import { NewsItem } from '@/lib/news-fetcher'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

const renderWithProviders = (component: React.ReactElement) => {
  return render(<DarkModeProvider>{component}</DarkModeProvider>)
}

describe('NewsSection', () => {
  const mockNewsItems: NewsItem[] = [
    {
      title: 'News Item 1',
      link: 'https://example.com/news1',
      pubDate: 'Mon, 01 Jan 2024 12:00:00 GMT',
    },
    {
      title: 'News Item 2',
      link: 'https://example.com/news2',
      pubDate: 'Mon, 02 Jan 2024 12:00:00 GMT',
    },
    {
      title: 'News Item 3',
      link: 'https://example.com/news3',
      pubDate: 'Mon, 03 Jan 2024 12:00:00 GMT',
    },
  ]

  it('renders section heading', () => {
    renderWithProviders(<NewsSection items={mockNewsItems} isLoading={false} error={null} />)
    expect(screen.getByText('Latest from Card Kingdom Blog')).toBeInTheDocument()
  })

  it('displays loading skeletons when loading', () => {
    renderWithProviders(<NewsSection items={[]} isLoading={true} error={null} />)
    expect(screen.getByTestId('news-loading')).toBeInTheDocument()

    // Should have 3 skeleton items
    const skeletons = screen.getByTestId('news-loading').children
    expect(skeletons.length).toBe(3)
  })

  it('displays news items when loaded', () => {
    renderWithProviders(<NewsSection items={mockNewsItems} isLoading={false} error={null} />)
    expect(screen.getByTestId('news-grid')).toBeInTheDocument()

    const newsItems = screen.getAllByTestId('news-item')
    expect(newsItems).toHaveLength(3)
  })

  it('displays error message when error occurs', () => {
    renderWithProviders(<NewsSection items={[]} isLoading={false} error="Network error" />)
    expect(screen.getByTestId('news-error')).toBeInTheDocument()
    expect(screen.getByText('Unable to load latest news at this time.')).toBeInTheDocument()
  })

  it('displays fallback message when no items', () => {
    renderWithProviders(<NewsSection items={[]} isLoading={false} error={null} />)
    expect(screen.getByTestId('news-error')).toBeInTheDocument()
    expect(screen.getByText('Unable to load latest news at this time.')).toBeInTheDocument()
  })

  it('shows link to Card Kingdom Blog on error', () => {
    renderWithProviders(<NewsSection items={[]} isLoading={false} error="Error" />)
    const link = screen.getByText('Visit Card Kingdom Blog →')
    expect(link).toHaveAttribute('href', 'https://blog.cardkingdom.com/')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('shows link to more news when items loaded', () => {
    renderWithProviders(<NewsSection items={mockNewsItems} isLoading={false} error={null} />)
    const link = screen.getByText('View more on Card Kingdom Blog →')
    expect(link).toHaveAttribute('href', 'https://blog.cardkingdom.com/')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders all news item titles', () => {
    renderWithProviders(<NewsSection items={mockNewsItems} isLoading={false} error={null} />)
    expect(screen.getByText('News Item 1')).toBeInTheDocument()
    expect(screen.getByText('News Item 2')).toBeInTheDocument()
    expect(screen.getByText('News Item 3')).toBeInTheDocument()
  })

  it('uses 2-column grid on desktop', () => {
    renderWithProviders(<NewsSection items={mockNewsItems} isLoading={false} error={null} />)
    const grid = screen.getByTestId('news-grid')
    expect(grid).toHaveClass('md:grid-cols-2')
  })
})
