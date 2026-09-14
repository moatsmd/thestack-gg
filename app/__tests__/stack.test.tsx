import { fireEvent, render, screen } from '@testing-library/react'
import StackPage from '../stack/page'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

const renderStack = () =>
  render(
    <DarkModeProvider>
      <StackPage />
    </DarkModeProvider>,
  )

describe('StackPage (animated demo)', () => {
  it('starts paused and leaves the last result visible until replay', () => {
    renderStack()
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
    for (let i = 0; i < 6; i++) fireEvent.click(screen.getByRole('button', { name: 'Next step' }))
    expect(screen.getByRole('button', { name: 'Next step' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('17')
    fireEvent.click(screen.getByRole('button', { name: 'Previous step' }))
    expect(screen.getByTestId('stack-top')).toHaveTextContent('Lightning Bolt')
  })
  it('places the newest spell on top and empties after final resolution', () => {
    renderStack()
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }))
    expect(screen.getByTestId('stack-top')).toHaveTextContent('Counterspell')
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }))
    expect(screen.getByTestId('stack-top')).toHaveTextContent('Red Elemental Blast')
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }))
    expect(screen.getByTestId('stack-top')).toHaveTextContent('Red Elemental Blast')
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }))
    expect(screen.getByTestId('stack-top')).toHaveTextContent('Lightning Bolt')
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }))
    expect(screen.getByText('The stack is empty.')).toBeInTheDocument()
  })
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
