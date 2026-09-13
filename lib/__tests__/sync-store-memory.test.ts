/** @jest-environment node */
beforeEach(() => {
  jest.resetModules()
  delete process.env.REDIS_URL; delete process.env.STACK_RECAP_REDIS_URL; delete process.env.stack_recap_REDIS_URL; delete process.env.VERCEL
})

it('keeps local development sessions visible across route module reloads', async () => {
  const store = await import('../sync-store')
  store.__clearSyncStoreForTests()
  const data = await store.createSyncSession({
    hostDeviceId: 'host', gameMode: { name: 'Commander', life: 40 }, customLife: 20, enabledCounters: ['cmd'],
    players: [1, 2].map((id) => ({ id, name: `Player ${id}`, life: 40, cmd: 0, cmdFrom: {}, poison: 0, mana: 0, energy: 0, experience: 0 })),
  })
  await store.claimSeat(data.session.id, 2, 'guest')
  jest.resetModules()
  const reloaded = await import('../sync-store')
  expect(await reloaded.getIdByCode(data.session.code)).toBe(data.session.id)
  expect((await reloaded.getSyncSession(data.session.id))?.seats[1].ownerDeviceId).toBe('guest')
  reloaded.__clearSyncStoreForTests()
})
