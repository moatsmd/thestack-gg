import { render, screen } from '@testing-library/react'
import StackPage from '../stack/page'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

const renderStack = () =>
  render(
    <DarkModeProvider>
      <StackPage />
    </DarkModeProvider>,
  )

describe('StackPage (animated demo)', () => {
  it('renders the display heading', () => {
    renderStack()
    // Display heading is a <p> in the new layout, but eyebrow + tagline include "Stack"
    expect(screen.getAllByText(/^the stack$/i).length).toBeGreaterThan(0)
  })

  it('explains LIFO order', () => {
    renderStack()
    expect(screen.getAllByText(/last in, first out/i).length).toBeGreaterThan(0)
  })

  it('shows the sequence panel', () => {
    renderStack()
    expect(screen.getByTestId('priority-flow')).toBeInTheDocument()
  })

  it('shows the key rules grid', () => {
    renderStack()
    expect(screen.getByTestId('key-rules')).toBeInTheDocument()
  })

  it('shows the scenarios grid', () => {
    renderStack()
    expect(screen.getByTestId('scenarios')).toBeInTheDocument()
  })

  it('exposes play/pause and reset controls', () => {
    renderStack()
    expect(screen.getByTestId('button-play')).toBeInTheDocument()
    expect(screen.getByTestId('button-reset-stack')).toBeInTheDocument()
  })

  it('lists the demo scenario steps', () => {
    renderStack()
    expect(screen.getAllByText(/lightning bolt/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/counterspell targeting lightning bolt/i)).toBeInTheDocument()
    expect(screen.getAllByText(/red elemental blast/i).length).toBeGreaterThan(0)
  })

  it('shows the priority rule card', () => {
    renderStack()
    expect(screen.getByRole('heading', { name: /^priority$/i, level: 4 })).toBeInTheDocument()
  })
})
