export type TokenColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'
export type TokenType = 'creature' | 'artifact' | 'enchantment' | 'emblem'

export interface TokenDefinition {
  name: string
  colors: TokenColor[]
  type: TokenType
  power?: string
  toughness?: string
  typeLine: string
  abilities: string[]
  madeBy: string[]
}
