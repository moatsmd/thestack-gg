export const CHAPTERS = [
  { id: 'basics', title: 'Meet your cards', short: 'The cards', minutes: 3, description: 'Every card tells a story. Learn how to read yours.', outcome: 'Read a creature’s cost, type, power and toughness.', rule: '202, 205, 208', art: 'bears' },
  { id: 'cast', title: 'Cast your first spell', short: 'Your first spell', minutes: 3, description: 'Turn lands into mana. Turn mana into possibility.', outcome: 'Play a land and pay the right mana for a creature.', rule: '106, 305, 601', art: 'forest' },
  { id: 'turn', title: 'Find your rhythm', short: 'Taking a turn', minutes: 4, description: 'Walk through a turn, one decision at a time.', outcome: 'Recognize when to draw, play lands, attack and pass.', rule: '500–514', art: 'island' },
  { id: 'combat', title: 'Enter the fray', short: 'Attack & block', minutes: 4, description: 'Choose your attacker. See what survives.', outcome: 'Predict damage in a simple attack and block.', rule: '302.6, 508–510', art: 'giant' },
  { id: 'stack', title: 'Have the last word', short: 'The stack', minutes: 4, description: 'A spell is a beginning. Your response can change the ending.', outcome: 'Respond to a spell and resolve the stack one item at a time.', rule: '117, 601, 603, 608', art: 'bolt' },
  { id: 'table', title: 'Take your seat', short: 'Your first game', minutes: 3, description: 'Gather your friends. Let the first game begin.', outcome: 'Set up a two-player game or a Commander table.', rule: '103, 800.7, 903', art: 'growth' },
] as const
export type LessonId = typeof CHAPTERS[number]['id']
export type ExerciseState = { step: number; choice: string; flags: string[] }
export type LearnProgress = { version: 1; current: LessonId; completed: LessonId[]; exercises: Partial<Record<LessonId, ExerciseState>>; format: 'duel' | 'commander' }
export const LEARN_STORAGE_KEY = 'thestack-learn-v1'
export const emptyExercise = (): ExerciseState => ({ step: 0, choice: '', flags: [] })
export const emptyProgress = (): LearnProgress => ({ version: 1, current: 'basics', completed: [], exercises: {}, format: 'duel' })
export const isLessonId = (id: unknown): id is LessonId => CHAPTERS.some(chapter => chapter.id === id)
export const lessonHref = (id: LessonId) => `/new-players/${id}`

const STATE_LIMITS: Record<LessonId, { max: number; choices: string[]; flags: string[] }> = {
  basics: { max: 1, choices: ['', 'Mana cost', 'Card type', 'Power and toughness'], flags: [] },
  cast: { max: 2, choices: ['', 'one-more', 'need-mana', 'cast'], flags: ['forest', 'island'] },
  turn: { max: 6, choices: ['', 'correct', 'wrong'], flags: [] },
  combat: { max: 1, choices: ['', 'Both creatures die', 'Only the blocker dies', 'The opponent takes damage'], flags: ['giant', 'unblocked'] },
  stack: { max: 3, choices: ['', 'passed', 'growth', 'bolt-first', 'resolved'], flags: ['growth'] },
  table: { max: 1, choices: [''], flags: ['0', '1', '2', '3'] },
}

function validExercise(id: LessonId, state: ExerciseState) {
  const limit = STATE_LIMITS[id]
  if (state.step > limit.max || !limit.choices.includes(state.choice) || state.flags.some(flag => !limit.flags.includes(flag))) return false
  if (id === 'basics' && state.step === 1 && state.choice !== 'Power and toughness') return false
  if (id === 'cast' && ((state.step === 0 && state.flags.length > 0) || (state.step === 2 && (!state.flags.includes('forest') || !state.flags.includes('island'))))) return false
  if (id === 'stack' && (state.step === 1 || state.step === 2) && !state.flags.includes('growth')) return false
  if (id === 'stack' && state.step === 3 && !(state.choice === 'passed' && state.flags.length === 0) && !(state.choice === 'resolved' && state.flags.includes('growth'))) return false
  if (id === 'table' && state.step === 1 && !['0', '1', '2', '3'].every(flag => state.flags.includes(flag))) return false
  return true
}

export function parseProgress(raw: string | null): LearnProgress {
  const fallback = emptyProgress()
  try {
    const value = JSON.parse(raw || 'null')
    if (!value || value.version !== 1) return fallback
    const exercises: LearnProgress['exercises'] = {}
    for (const { id } of CHAPTERS) {
      const state = value.exercises?.[id]
      if (state && Number.isInteger(state.step) && state.step >= 0 && state.step <= 12 && typeof state.choice === 'string' && state.choice.length <= 100 && Array.isArray(state.flags) && state.flags.length <= 16 && state.flags.every((flag: unknown) => typeof flag === 'string' && flag.length <= 40) && validExercise(id, state)) {
        exercises[id] = { step: state.step, choice: state.choice, flags: [...new Set<string>(state.flags)] }
      }
    }
    return { version: 1, current: isLessonId(value.current) ? value.current : 'basics', completed: Array.isArray(value.completed) ? [...new Set<LessonId>(value.completed.filter(isLessonId))] : [], exercises, format: value.format === 'commander' ? 'commander' : 'duel' }
  } catch { return fallback }
}

export const canPayBears = (mana: string[]) => mana.length >= 2 && mana.includes('G')

// The introductory scenario has no abilities, damage prevention or other effects.
export function combatOutcome(power: number, toughness: number, blockerPower: number | null, blockerToughness: number | null) {
  const blocked = blockerPower !== null && blockerToughness !== null
  return { attackerDies: blocked && blockerPower >= toughness, blockerDies: blocked && power >= blockerToughness, playerDamage: blocked ? 0 : power, attackerDamage: blockerPower ?? 0, blockerDamage: blocked ? power : 0 }
}

export function resolveBearsStack(growth: boolean) {
  return { power: growth ? 5 : 2, toughness: growth ? 5 : 2, damage: 3, survives: growth }
}

export const TERMS = {
  Mana: 'The resource you spend to cast spells and activate abilities. Lands are a common source. Unspent mana normally empties as each step and phase ends.',
  Tap: 'Turn a permanent sideways. A tapped permanent must untap before you can tap it again to pay a cost. Tapping a land usually makes mana; it does not spend the land.',
  Permanent: 'A card or token on the battlefield. Lands, creatures, artifacts, enchantments, planeswalkers and battles can be permanents.',
  Spell: 'A card or copy on the stack. Cards are usually cast from your hand; some effects allow other zones. Lands are played, never cast as spells.',
  Priority: 'Your chance to take actions, such as casting an instant. Timing restrictions still apply. After everyone passes in succession, one stack item resolves—or an empty stack lets the step or phase end.',
  'Summoning sickness': 'A creature must have been under your control since your most recent turn began to attack or use its own tap/untap-symbol abilities, unless it has haste. It can still block.',
  'Triggered ability': 'An ability beginning with “when”, “whenever” or “at”. Most waiting triggers go on the stack before a player receives priority, after state-based actions. Mana abilities are an exception.',
  Graveyard: 'Your face-up discard pile. Resolved instants and sorceries, destroyed creatures and discarded cards normally go here.',
  Trample: 'When assigning combat damage, an attacker with trample can assign remaining damage to what it is attacking after assigning lethal damage to its blockers.',
  Vigilance: 'Attacking does not cause a creature with vigilance to tap.',
  'First strike': 'A creature with first strike deals combat damage in an earlier damage step. Double strike deals damage in both steps.',
} as const
