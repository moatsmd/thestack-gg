/** @jest-environment node */
import { POST as create } from '../sync/route'
import { GET as join } from '../sync/[id]/route'
import { GET as joinByCode } from '../sync/by-code/[code]/route'
import { GET as poll } from '../sync/[id]/since/route'
import { POST as claim, DELETE as release } from '../sync/[id]/seat/route'
import { POST as append } from '../sync/[id]/op/route'
import { __clearSyncStoreForTests } from '@/lib/sync-store'

const host = 'private-host-credential'
const guest = 'private-guest-credential'
const request = (path: string, method = 'GET', deviceId?: string, body?: unknown) => new Request(`http://localhost/api/sync${path}`, {
  method, headers: deviceId ? { 'X-Sync-Device-Id': deviceId } : {}, body: body ? JSON.stringify(body) : undefined,
})
beforeEach(() => {
  delete process.env.REDIS_URL; delete process.env.STACK_RECAP_REDIS_URL; delete process.env.stack_recap_REDIS_URL
  __clearSyncStoreForTests()
})
const setup = async () => {
  const response = await create(request('', 'POST', host, {
    hostDeviceId: host, gameMode: { name: 'Commander', life: 40 }, customLife: 20, enabledCounters: ['cmd'],
    players: [1, 2].map((id) => ({ id, name: `Player ${id}`, life: 40, cmd: 0, cmdFrom: {}, poison: 0, mana: 0, energy: 0, experience: 0 })),
  }))
  return response.json()
}

it('keeps device write credentials out of public joins and op history, including legacy op ids', async () => {
  const session = await setup()
  const context = { params: Promise.resolve({ id: session.id }) }
  await claim(request(`/${session.id}/seat`, 'POST', guest, { seatId: 2, deviceId: guest }), context)
  await append(request(`/${session.id}/op`, 'POST', host, { deviceId: host, opId: `${host}:0`, op: { type: 'life', seatId: 1, delta: -1 } }), context)
  for (const response of [
    await join(request(`/${session.id}`), context),
    await joinByCode(request(`/by-code/${session.code}`), { params: Promise.resolve({ code: session.code }) }),
    await poll(request(`/${session.id}/since?seq=0`), context),
  ]) {
    expect(response.headers.get('cache-control')).toContain('no-store')
    const text = await response.text()
    expect(text).not.toContain(host)
    expect(text).not.toContain(guest)
  }
})

it('lets returning devices recognize their own seat while keeping every other credential private', async () => {
  const session = await setup()
  const context = { params: Promise.resolve({ id: session.id }) }
  await claim(request(`/${session.id}/seat`, 'POST', guest, { seatId: 2, deviceId: guest }), context)
  const returned = await (await join(request(`/${session.id}`, 'GET', guest), context)).json()
  expect(returned.seats[1].ownerDeviceId).toBe(guest)
  expect(returned.session.hostDeviceId).not.toBe(host)
  const impersonation = await release(request(`/${session.id}/seat`, 'DELETE', guest, { deviceId: returned.session.hostDeviceId, seatId: 2 }), context)
  expect(impersonation.status).toBe(403)
  const hostView = await (await join(request(`/${session.id}`, 'GET', host), context)).json()
  expect(hostView.session.hostDeviceId).toBe(host)
  expect(hostView.seats[1].ownerDeviceId).not.toBe(guest)
})

it('never returns another player credential from a seat mutation response', async () => {
  const session = await setup()
  const context = { params: Promise.resolve({ id: session.id }) }
  await claim(request(`/${session.id}/seat`, 'POST', host, { seatId: 1, deviceId: host }), context)
  const response = await claim(request(`/${session.id}/seat`, 'POST', guest, { seatId: 2, deviceId: guest }), context)
  expect(await response.text()).not.toContain(host)
})
