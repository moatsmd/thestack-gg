export type GameMode = 'solo' | 'multiplayer'
export type GameType = 'standard' | 'commander' | 'custom'
export type ExtraCounterType = 'energy' | 'experience' | 'rad' | 'ticket'

export const EXTRA_COUNTER_CONFIG: Record<ExtraCounterType, { symbol: string; label: string }> = {
  energy:     { symbol: '⚡', label: 'Energy' },
  experience: { symbol: '⭐', label: 'Experience' },
  rad:        { symbol: '☣️', label: 'Rad' },
  ticket:     { symbol: '🎟', label: 'Ticket' },
}

export interface LifeChange {
  amount: number
  timestamp: Date
}

export interface CommanderDamage {
  fromPlayerId: string
  amount: number
}

export interface ManaPool {
  white: number
  blue: number
  black: number
  red: number
  green: number
  colorless: number
}

export interface TableStatus {
  monarchId: string | null
  initiativeId: string | null
  isNight: boolean
  citysBlessingIds: string[]
}

export interface Player {
  id: string
  name: string
  currentLife: number
  lifeHistory: LifeChange[]
  commanderDamage?: CommanderDamage[]
  commanderName?: string
  poisonCounters?: number
  manaPool?: ManaPool
  extraCounters?: Record<ExtraCounterType, number>
}

export interface GameState {
  mode: GameMode
  gameType: GameType
  startingLife: number
  enabledCounters: ExtraCounterType[]
  tableStatus: TableStatus
  players: Player[]
  createdAt: Date
}
