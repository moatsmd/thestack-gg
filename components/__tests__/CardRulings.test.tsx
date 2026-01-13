import { render, screen } from '@testing-library/react'
import { CardRulings } from '../CardRulings'

describe('CardRulings', () => {
  it('shows loading state', () => {
    render(<CardRulings rulings={[]} isLoading error={null} />)

    expect(screen.getByText(/Loading rulings/i)).toBeInTheDocument()
  })

  it('shows empty state when no rulings', () => {
    render(<CardRulings rulings={[]} isLoading={false} error={null} />)

    expect(screen.getByText(/No rulings available/i)).toBeInTheDocument()
  })

  it('renders rulings list', () => {
    render(
      <CardRulings
        rulings={[
          {
            object: 'ruling',
            oracle_id: 'oracle-123',
            source: 'wotc',
            published_at: '2004-10-04',
            comment: 'Test ruling.',
          },
        ]}
        isLoading={false}
        error={null}
      />
    )

    expect(screen.getByText('2004-10-04')).toBeInTheDocument()
    expect(screen.getByText('Test ruling.')).toBeInTheDocument()
  })
})
