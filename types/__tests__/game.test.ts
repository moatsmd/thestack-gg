import { GameState, Player, LifeChange } from '../game'

describe('Game Types', () => {
  it('should create valid GameState for solo mode', () => {
    const state: GameState = {
      mode: 'solo',
      gameType: 'standard',
      startingLife: 20,
      players: [],
      createdAt: new Date(),
    }

    expect(state.mode).toBe('solo')
    expect(state.startingLife).toBe(20)
  })

  it('should create valid Player', () => {
    const player: Player = {
      id: '1',
      name: 'Test Player',
      currentLife: 20,
      lifeHistory: [],
    }

    expect(player.id).toBe('1')
    expect(player.currentLife).toBe(20)
  })

  it('should create valid LifeChange', () => {
    const change: LifeChange = {
      amount: -3,
      timestamp: new Date(),
    }

    expect(change.amount).toBe(-3)
    expect(change.timestamp).toBeInstanceOf(Date)
  })
})
