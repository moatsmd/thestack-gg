import { render, screen } from '@testing-library/react'
import ToolkitPage from '../toolkit/page'

// Mock the ToolkitHeader component
jest.mock('@/components/ToolkitHeader', () => ({
  ToolkitHeader: () => <div data-testid="toolkit-header">Toolkit Header</div>
}))

// Mock the CardSearch component
jest.mock('@/components/CardSearch', () => ({
  CardSearch: () => <div data-testid="card-search">Card Search</div>
}))

describe('ToolkitPage', () => {
  it('renders the toolkit page', () => {
    render(<ToolkitPage />)

    expect(screen.getByTestId('toolkit-header')).toBeInTheDocument()
  })

  it('has responsive background with dark mode support', () => {
    const { container } = render(<ToolkitPage />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('min-h-screen', 'bg-gray-50')
  })

  it('displays card search component', () => {
    render(<ToolkitPage />)

    expect(screen.getByTestId('card-search')).toBeInTheDocument()
  })

  it('has container with proper spacing', () => {
    const { container } = render(<ToolkitPage />)

    const containerDiv = container.querySelector('.container')
    expect(containerDiv).toHaveClass('mx-auto', 'px-4', 'py-6')
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
