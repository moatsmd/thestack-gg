import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KeywordTooltip } from '../KeywordTooltip'
import { KeywordDefinition } from '@/lib/keywords-data'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

const renderWithProviders = (component: React.ReactElement) => {
  return render(<DarkModeProvider>{component}</DarkModeProvider>)
}

describe('KeywordTooltip', () => {
  const mockKeyword: KeywordDefinition = {
    keyword: 'Flying',
    type: 'ability',
    definition: 'This creature can only be blocked by creatures with flying or reach.',
    reminder: "This creature can't be blocked except by creatures with flying and/or reach.",
  }

  it('renders trigger text', () => {
    renderWithProviders(
      <KeywordTooltip keyword={mockKeyword}>
        <span>flying</span>
      </KeywordTooltip>
    )
    expect(screen.getByText('flying')).toBeInTheDocument()
  })

  it('shows tooltip on hover (desktop)', async () => {
    const user = userEvent.setup()
    // Mock desktop viewport
    global.innerWidth = 1024
    window.dispatchEvent(new Event('resize'))

    renderWithProviders(
      <KeywordTooltip keyword={mockKeyword}>
        <span>flying</span>
      </KeywordTooltip>
    )

    const trigger = screen.getByTestId('keyword-trigger')

    // Hover over trigger
    await user.hover(trigger)

    // Tooltip should appear
    await waitFor(() => {
      expect(screen.getByTestId('keyword-tooltip')).toBeInTheDocument()
    })
  })

  it('hides tooltip on mouse leave (desktop)', async () => {
    const user = userEvent.setup()
    // Mock desktop viewport
    global.innerWidth = 1024
    window.dispatchEvent(new Event('resize'))

    renderWithProviders(
      <KeywordTooltip keyword={mockKeyword}>
        <span>flying</span>
      </KeywordTooltip>
    )

    const trigger = screen.getByTestId('keyword-trigger')

    // Hover over trigger
    await user.hover(trigger)

    // Tooltip should appear
    await waitFor(() => {
      expect(screen.getByTestId('keyword-tooltip')).toBeInTheDocument()
    })

    // Unhover
    await user.unhover(trigger)

    // Tooltip should disappear
    await waitFor(() => {
      expect(screen.queryByTestId('keyword-tooltip')).not.toBeInTheDocument()
    })
  })

  it('toggles tooltip on click (mobile)', async () => {
    const user = userEvent.setup()
    // Mock mobile viewport
    global.innerWidth = 375
    window.dispatchEvent(new Event('resize'))

    renderWithProviders(
      <KeywordTooltip keyword={mockKeyword}>
        <span>flying</span>
      </KeywordTooltip>
    )

    const trigger = screen.getByTestId('keyword-trigger')

    // Tooltip should not be visible initially
    expect(screen.queryByTestId('keyword-tooltip')).not.toBeInTheDocument()

    // Click trigger
    await user.click(trigger)

    // Tooltip should appear
    await waitFor(() => {
      expect(screen.getByTestId('keyword-tooltip')).toBeInTheDocument()
    })

    // Click trigger again
    await user.click(trigger)

    // Tooltip should disappear
    await waitFor(() => {
      expect(screen.queryByTestId('keyword-tooltip')).not.toBeInTheDocument()
    })
  })

  it('displays keyword name in tooltip', async () => {
    const user = userEvent.setup()
    global.innerWidth = 1024
    window.dispatchEvent(new Event('resize'))

    renderWithProviders(
      <KeywordTooltip keyword={mockKeyword}>
        <span>flying</span>
      </KeywordTooltip>
    )

    await user.hover(screen.getByTestId('keyword-trigger'))

    await waitFor(() => {
      expect(screen.getByText('Flying')).toBeInTheDocument()
    })
  })

  it('displays keyword definition in tooltip', async () => {
    const user = userEvent.setup()
    global.innerWidth = 1024
    window.dispatchEvent(new Event('resize'))

    renderWithProviders(
      <KeywordTooltip keyword={mockKeyword}>
        <span>flying</span>
      </KeywordTooltip>
    )

    await user.hover(screen.getByTestId('keyword-trigger'))

    await waitFor(() => {
      expect(
        screen.getByText('This creature can only be blocked by creatures with flying or reach.')
      ).toBeInTheDocument()
    })
  })

  it('displays reminder text when provided', async () => {
    const user = userEvent.setup()
    global.innerWidth = 1024
    window.dispatchEvent(new Event('resize'))

    renderWithProviders(
      <KeywordTooltip keyword={mockKeyword}>
        <span>flying</span>
      </KeywordTooltip>
    )

    await user.hover(screen.getByTestId('keyword-trigger'))

    await waitFor(() => {
      expect(
        screen.getByText(
          /This creature can't be blocked except by creatures with flying and\/or reach./
        )
      ).toBeInTheDocument()
    })
  })

  it('does not display reminder text when not provided', async () => {
    const user = userEvent.setup()
    global.innerWidth = 1024
    window.dispatchEvent(new Event('resize'))

    const keywordWithoutReminder: KeywordDefinition = {
      keyword: 'Test',
      type: 'action',
      definition: 'Test definition',
    }

    renderWithProviders(
      <KeywordTooltip keyword={keywordWithoutReminder}>
        <span>test</span>
      </KeywordTooltip>
    )

    await user.hover(screen.getByTestId('keyword-trigger'))

    await waitFor(() => {
      expect(screen.getByTestId('keyword-tooltip')).toBeInTheDocument()
    })

    // Should not have reminder text
    const tooltip = screen.getByTestId('keyword-tooltip')
    expect(tooltip.textContent).not.toMatch(/\(.*\)/)
  })
})
