import { render, screen } from '@testing-library/react'
import StackPage from '../stack/page'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

const renderStack = () => render(<DarkModeProvider><StackPage /></DarkModeProvider>)

describe('StackPage (static reference)', () => {
  it('renders the page heading', () => {
    renderStack()
    expect(screen.getByRole('heading', { name: /^the stack$/i, level: 1 })).toBeInTheDocument()
  })

  it('explains LIFO order', () => {
    renderStack()
    expect(screen.getByText(/last in, first out/i)).toBeInTheDocument()
  })

  it('shows priority flow section', () => {
    renderStack()
    expect(screen.getByTestId('priority-flow')).toBeInTheDocument()
  })

  it('shows key rules section', () => {
    renderStack()
    expect(screen.getByTestId('key-rules')).toBeInTheDocument()
  })

  it('shows common scenarios section', () => {
    renderStack()
    expect(screen.getByTestId('scenarios')).toBeInTheDocument()
  })

  it('mentions split second', () => {
    renderStack()
    expect(screen.getByText(/split second/i)).toBeInTheDocument()
  })

  it('mentions mana abilities', () => {
    renderStack()
    expect(screen.getByText(/mana abilit/i)).toBeInTheDocument()
  })

  it('has no interactive buttons (it is static)', () => {
    renderStack()
    expect(screen.queryByRole('button', { name: /resolve/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add spell/i })).not.toBeInTheDocument()
  })
})
