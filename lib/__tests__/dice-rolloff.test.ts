import { createRollOff, rollOffRound, parsePlayerNames, rollDie, physicalDice, diceAnimationProgress, DICE_ROLL_MS } from '../dice-rolloff'

describe('d20 table roll-off', () => {
  it('rolls once for every player and selects the unique highest roll', () => {
    const values = [0.2, 0.95, 0.4]
    const state = rollOffRound(createRollOff(['Ada', 'Ben', 'Cy']), () => values.shift()!)
    expect(state.rounds[0].rolls.map((roll) => roll.value)).toEqual([5, 20, 9])
    expect(state.winner).toBe(1)
    expect(state.contenders).toEqual([1])
  })

  it('rerolls only the tied highest players until one remains', () => {
    const values = [0.95, 0.3, 0.95, 0.4, 0.4, 0.9, 0.1]
    const random = () => values.shift()!
    const first = rollOffRound(createRollOff(['Ada', 'Ben', 'Cy']), random)
    expect(first.winner).toBeNull()
    expect(first.contenders).toEqual([0, 2])
    const second = rollOffRound(first, random)
    expect(second.rounds[1].rolls.map((roll) => roll.player)).toEqual([0, 2])
    expect(second.winner).toBeNull()
    const third = rollOffRound(second, random)
    expect(third.winner).toBe(0)
    expect(third.rounds).toHaveLength(3)
    expect(first.rounds).toHaveLength(1)
  })

  it('does not consume another roll after a winner is decided', () => {
    const first = rollOffRound(createRollOff(['Ada', 'Ben']), (() => {
      const rolls = [0.95, 0]
      return () => rolls.shift()!
    })())
    const random = jest.fn()
    expect(rollOffRound(first, random)).toBe(first)
    expect(random).not.toHaveBeenCalled()
  })

  it('imports 2–8 safe table names from a JSON query parameter', () => {
    expect(parsePlayerNames('[" Ada ","Ben"]')).toEqual(['Ada', 'Ben'])
    expect(parsePlayerNames('["Ada"]')).toBeNull()
    expect(parsePlayerNames('{"players":["Ada","Ben"]}')).toBeNull()
    expect(parsePlayerNames('["Ada",22]')).toBeNull()
    expect(parsePlayerNames('broken')).toBeNull()
    expect(parsePlayerNames(JSON.stringify(Array(9).fill('Player')))).toBeNull()
  })

  it.each([4, 6, 8, 10, 12, 20, 100] as const)('keeps d%i outcomes within its faces', (faces) => {
    expect(rollDie(faces, () => 0)).toBe(1)
    expect(rollDie(faces, () => 0.999999)).toBe(faces)
  })

  it('represents every percentile outcome as the correct tens and units faces', () => {
    for (let result = 1; result <= 100; result++) {
      const [tens, ones] = physicalDice([{ die: 100, result }])
      const combined = Number(tens.labels![tens.value]) + Number(ones.labels![ones.value])
      expect(combined || 100).toBe(result)
    }
  })

  it('preserves a tied player’s original die color', () => {
    const dice = physicalDice([{ die: 20, result: 12, colorIndex: 0 }, { die: 20, result: 18, colorIndex: 2 }])
    expect(dice.map((die) => die.colorIndex)).toEqual([0, 2])
  })

  it('settles all sixteen physical dice in a full percentile pool before announcing results', () => {
    for (let index = 0; index < 16; index++) expect(diceAnimationProgress(DICE_ROLL_MS - 80, index, 16)).toBe(1)
  })
})
