export type GameMode = 'solo' | 'multiplayer'
export type GameType = 'standard' | 'commander' | 'custom'

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

export interface Player {
  id: string
  name: string
  currentLife: number
  lifeHistory: LifeChange[]
  commanderDamage?: CommanderDamage[]
  commanderName?: string
  poisonCounters?: number
  manaPool?: ManaPool
}

export interface GameState {
  mode: GameMode
  gameType: GameType
  startingLife: number
  players: Player[]
  createdAt: Date
}
