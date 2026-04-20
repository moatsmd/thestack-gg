import { GameState, Player, ExtraCounterType, TableStatus } from '@/types/game'

describe('game types', () => {
  it('GameState accepts enabledCounters field', () => {
    const state: GameState = {
      mode: 'multiplayer',
      gameType: 'commander',
      startingLife: 40,
      enabledCounters: ['energy', 'experience'],
      tableStatus: {
        monarchId: null,
        initiativeId: null,
        isNight: false,
        citysBlessingIds: [],
      },
      players: [],
      createdAt: new Date(),
    }
    expect(state.enabledCounters).toEqual(['energy', 'experience'])
    expect(state.tableStatus.monarchId).toBeNull()
  })

  it('Player accepts extraCounters field', () => {
    const player: Player = {
      id: 'p1',
      name: 'Alice',
      currentLife: 40,
      lifeHistory: [],
      extraCounters: { energy: 3, experience: 1, rad: 0, ticket: 0 },
    }
    expect(player.extraCounters?.energy).toBe(3)
  })
})
