import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LearnProvider } from '@/components/learn/LearnProvider'
import { Lesson } from '@/components/learn/Lesson'
import { LearnHome } from '@/components/learn/LearnHome'
import { LEARN_STORAGE_KEY, emptyProgress } from '@/lib/learn'

const mount = (id: 'basics' | 'cast' | 'turn' | 'combat' | 'stack' | 'table') => render(<LearnProvider><Lesson id={id} /></LearnProvider>)
beforeEach(() => localStorage.clear())

it('visiting a chapter does not complete it', async () => {
  mount('basics')
  await screen.findByRole('button', { name: 'Power and toughness' })
  expect(JSON.parse(localStorage.getItem(LEARN_STORAGE_KEY)!).completed).toEqual([])
})

it('requires mana payment, saves each action and restores an unfinished exercise', async () => {
  const user = userEvent.setup()
  const view = mount('cast')
  await user.click(await screen.findByRole('button', { name: 'Play Forest' }))
  await user.click(screen.getByRole('button', { name: 'Tap Forest for green mana' }))
  await user.click(screen.getByRole('button', { name: 'Cast Grizzly Bears' }))
  expect(screen.getByRole('status')).toHaveTextContent('one more mana')
  view.unmount()
  mount('cast')
  await screen.findByRole('button', { name: 'Tap Island for blue mana' })
  expect(screen.getByRole('button', { name: 'Tap Forest for green mana' })).toHaveAttribute('aria-pressed', 'true')
  await user.click(screen.getByRole('button', { name: 'Tap Island for blue mana' }))
  await user.click(screen.getByRole('button', { name: 'Cast Grizzly Bears' }))
  expect(screen.getByRole('status')).toHaveTextContent('Grizzly Bears resolves')
  expect(JSON.parse(localStorage.getItem(LEARN_STORAGE_KEY)!).completed).toContain('cast')
})

it('explains wrong card answers and completes after the correct answer', async () => {
  const user = userEvent.setup()
  mount('basics')
  await user.click(await screen.findByRole('button', { name: 'Mana cost' }))
  expect(screen.getByRole('status')).toHaveTextContent('pay')
  await user.click(screen.getByRole('button', { name: 'Power and toughness' }))
  expect(screen.getByRole('status')).toHaveTextContent('2 damage')
  expect(JSON.parse(localStorage.getItem(LEARN_STORAGE_KEY)!).completed).toContain('basics')
})

it('keeps learning usable and explains when saving is unavailable', async () => {
  const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
  try {
    const user = userEvent.setup()
    mount('basics')
    await user.click(await screen.findByRole('button', { name: 'Power and toughness' }))
    expect(screen.getByRole('status')).toHaveTextContent('2 damage')
    expect(screen.getByText(/Progress cannot be saved/)).toBeInTheDocument()
  } finally { spy.mockRestore() }
})

it('resumes the last chapter from the course home', async () => {
  localStorage.setItem(LEARN_STORAGE_KEY, JSON.stringify({ ...emptyProgress(), current: 'combat', completed: ['basics', 'cast'] }))
  render(<LearnProvider><LearnHome /></LearnProvider>)
  await waitFor(() => expect(screen.getByRole('link', { name: /Resume learning/ })).toHaveAttribute('href', '/new-players/combat'))
})

it('requires the right combat prediction and updates results when the attacker changes', async () => {
  const user = userEvent.setup()
  mount('combat')
  await user.click(await screen.findByRole('button', { name: 'Only the blocker dies' }))
  expect(JSON.parse(localStorage.getItem(LEARN_STORAGE_KEY)!).completed).not.toContain('combat')
  await user.click(screen.getByRole('button', { name: 'Both creatures die' }))
  expect(screen.getByRole('status')).toHaveTextContent('Both have lethal damage')
  await user.click(screen.getByRole('button', { name: 'Try a 3/3 Hill Giant' }))
  await user.click(screen.getByRole('button', { name: 'Only the blocker dies' }))
  expect(screen.getByRole('status')).toHaveTextContent('3/3 with 2 damage marked')
  await user.click(screen.getByRole('button', { name: 'See an unblocked attack' }))
  await user.click(screen.getByRole('button', { name: 'The opponent takes damage' }))
  expect(screen.getByRole('status')).toHaveTextContent('3 damage to the opponent')
})

it('asks for green mana when only the Island is tapped', async () => {
  const user = userEvent.setup()
  mount('cast')
  await user.click(await screen.findByRole('button', { name: 'Play Forest' }))
  await user.click(screen.getByRole('button', { name: 'Tap Island for blue mana' }))
  await user.click(screen.getByRole('button', { name: 'Cast Grizzly Bears' }))
  expect(screen.getByRole('status')).toHaveTextContent('still need green mana')
})

it('resumes between stack resolutions and does not complete on a losing response', async () => {
  const user = userEvent.setup()
  const view = mount('stack')
  await user.click(await screen.findByRole('button', { name: 'Pass without responding' }))
  expect(screen.getByRole('status')).toHaveTextContent('Bears died')
  expect(JSON.parse(localStorage.getItem(LEARN_STORAGE_KEY)!).completed).not.toContain('stack')
  await user.click(screen.getByRole('button', { name: 'Try the response again' }))
  await user.click(screen.getByRole('button', { name: 'Cast Giant Growth' }))
  await user.click(screen.getByRole('button', { name: 'Resolve Lightning Bolt first' }))
  expect(screen.getByRole('status')).toHaveTextContent('last spell added resolves first')
  await user.click(screen.getByRole('button', { name: 'Resolve Giant Growth' }))
  expect(screen.getByRole('status')).toHaveTextContent('pauses between resolutions')
  view.unmount()
  mount('stack')
  await user.click(await screen.findByRole('button', { name: 'Both pass · resolve Lightning Bolt' }))
  expect(screen.getByRole('status')).toHaveTextContent('You saved the Bears')
  expect(JSON.parse(localStorage.getItem(LEARN_STORAGE_KEY)!).completed).toContain('stack')
})

it('advances a turn only for legal choices', async () => {
  const user = userEvent.setup()
  mount('turn')
  await user.click(await screen.findByRole('button', { name: 'Draw before untapping' }))
  expect(screen.getByRole('status')).toHaveTextContent('Untap comes first')
  for (const name of ['Untap my permanents', 'Draw one card', 'Play a land', 'Attack with Grizzly Bears', 'I can cast another creature if I can pay', 'Discard one card']) {
    await user.click(screen.getByRole('button', { name: new RegExp(name) }))
  }
  expect(screen.getByRole('status')).toHaveTextContent('Your turn is complete')
  expect(JSON.parse(localStorage.getItem(LEARN_STORAGE_KEY)!).completed).toContain('turn')
})

it('prepares a Commander checklist and hands four players to the dice tool', async () => {
  const user = userEvent.setup()
  mount('table')
  await user.click(await screen.findByRole('button', { name: /Commander night/ }))
  expect(screen.getByText(/The starting player still draws/)).toBeInTheDocument()
  const href = screen.getByRole('link', { name: /Open your group d20 roll-off/ }).getAttribute('href')!
  expect(JSON.parse(new URL(href, 'http://localhost').searchParams.get('players')!)).toHaveLength(4)
  expect(screen.getByRole('button', { name: 'I’m ready for my first game' })).toBeDisabled()
  for (const checkbox of screen.getAllByRole('checkbox')) await user.click(checkbox)
  await user.click(screen.getByRole('button', { name: 'I’m ready for my first game' }))
  expect(JSON.parse(localStorage.getItem(LEARN_STORAGE_KEY)!).completed).toContain('table')
})
