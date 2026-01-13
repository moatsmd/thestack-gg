import { render, screen } from '@testing-library/react'
import { NewsItem } from '../NewsItem'
import { NewsItem as NewsItemType } from '@/lib/news-fetcher'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

const renderWithProviders = (component: React.ReactElement) => {
  return render(<DarkModeProvider>{component}</DarkModeProvider>)
}

describe('NewsItem', () => {
  const mockNewsItem: NewsItemType = {
    title: 'New Magic Set Announced',
    link: 'https://example.com/news/new-set',
    pubDate: 'Mon, 01 Jan 2024 12:00:00 GMT',
    description: 'Exciting new set coming soon',
    category: 'Announcements',
  }

  it('renders news item title', () => {
    renderWithProviders(<NewsItem item={mockNewsItem} />)
    expect(screen.getByText('New Magic Set Announced')).toBeInTheDocument()
  })

  it('renders formatted date', () => {
    renderWithProviders(<NewsItem item={mockNewsItem} />)
    expect(screen.getByText(/Jan 1, 2024/)).toBeInTheDocument()
  })

  it('renders as a link', () => {
    renderWithProviders(<NewsItem item={mockNewsItem} />)
    const link = screen.getByTestId('news-item')
    expect(link).toHaveAttribute('href', 'https://example.com/news/new-set')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders read more text', () => {
    renderWithProviders(<NewsItem item={mockNewsItem} />)
    expect(screen.getByText('Read more')).toBeInTheDocument()
  })

  it('has external link icon', () => {
    const { container } = renderWithProviders(<NewsItem item={mockNewsItem} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('applies hover effect classes', () => {
    renderWithProviders(<NewsItem item={mockNewsItem} />)
    const link = screen.getByTestId('news-item')
    expect(link).toHaveClass('hover:shadow-md', 'hover:scale-[1.02]')
  })
})
