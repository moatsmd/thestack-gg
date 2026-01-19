export type StackItemType = 'spell' | 'activated' | 'triggered'

export interface StackItem {
  id: string
  type: StackItemType
  name: string
  controllerId: string
  targetDescription?: string
  cardId?: string
  oracleText?: string
  imageUri?: string
  addedAt: Date
}

export type StackItemInput = Omit<StackItem, 'id' | 'addedAt'>

export interface ResolvedItem extends StackItem {
  resolvedAt: Date
}

export interface StackPlayer {
  id: string
  name: string
}

export interface StackState {
  items: StackItem[]
  resolved: ResolvedItem[]
  priorityPlayerId: string
  players: StackPlayer[]
}
