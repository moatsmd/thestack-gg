export type GameMode = 'solo' | 'multiplayer'
export type GameType = 'standard' | 'commander' | 'custom'

export interface LifeChange {
  amount: number
  timestamp: Date
}

export interface Player {
  id: string
  name: string
  currentLife: number
  lifeHistory: LifeChange[]
}

export interface GameState {
  mode: GameMode
  gameType: GameType
  startingLife: number
  players: Player[]
  createdAt: Date
}
