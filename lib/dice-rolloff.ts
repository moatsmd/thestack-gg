export const DICE = [4, 6, 8, 10, 12, 20, 100] as const
export type DieType = typeof DICE[number]
export const DICE_ROLL_MS = 2100
export interface DieResult { die: DieType; result: number; colorIndex?: number }
export interface RollEntry extends DieResult { id: string; timestamp: number }
export interface PhysicalDie { sides: number; value: number; labels?: string[]; colorIndex: number }
export interface RollOffRound { rolls: { player: number; value: number }[]; leaders: number[] }
export interface RollOffState { names: string[]; contenders: number[]; rounds: RollOffRound[]; winner: number | null }

export function rollDie(sides: DieType, random: () => number = Math.random): number {
  return Math.floor(random() * sides) + 1
}

export function physicalDice(results: DieResult[]): PhysicalDie[] {
  return results.flatMap<PhysicalDie>(({ die, result, colorIndex }, index) => die === 100 ? [
    { sides: 10, value: result === 100 ? 0 : Math.floor(result / 10), labels: Array.from({ length: 10 }, (_, i) => String(i * 10).padStart(2, '0')), colorIndex: colorIndex ?? index },
    { sides: 10, value: result === 100 ? 0 : result % 10, labels: Array.from({ length: 10 }, (_, i) => String(i)), colorIndex: (colorIndex ?? index) + 1 },
  ] : [{ sides: die, value: result - 1, colorIndex: colorIndex ?? index }])
}

export function diceAnimationProgress(elapsed: number, index: number, count: number): number {
  const stagger = Math.min(38, 240 / Math.max(1, count - 1))
  return Math.max(0, Math.min(1, (elapsed - index * stagger) / 1740))
}

export function parsePlayerNames(value: string | null): string[] | null {
  try {
    const names: unknown = JSON.parse(value || 'null')
    if (!Array.isArray(names) || names.length < 2 || names.length > 8 || names.some((name) => typeof name !== 'string' || !name.trim())) return null
    return names.map((name: string) => name.trim().slice(0, 32))
  } catch { return null }
}

export function createRollOff(names: string[]): RollOffState {
  return { names: names.map((name, index) => name.trim().slice(0, 32) || `Player ${index + 1}`), contenders: names.map((_, index) => index), rounds: [], winner: null }
}

export function rollOffRound(state: RollOffState, random: () => number = Math.random): RollOffState {
  if (state.winner !== null) return state
  const rolls = state.contenders.map((player) => ({ player, value: rollDie(20, random) }))
  const high = Math.max(...rolls.map((roll) => roll.value))
  const leaders = rolls.filter((roll) => roll.value === high).map((roll) => roll.player)
  return { ...state, contenders: leaders, rounds: [...state.rounds, { rolls, leaders }], winner: leaders.length === 1 ? leaders[0] : null }
}
