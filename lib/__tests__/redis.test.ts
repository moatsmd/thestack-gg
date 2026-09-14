/** @jest-environment node */
const mockCreateClient = jest.fn()
jest.mock('redis', () => ({ createClient: (...args: unknown[]) => mockCreateClient(...args) }))

const candidate = () => ({
  isOpen: false, isReady: false,
  on: jest.fn(), connect: jest.fn(), disconnect: jest.fn().mockResolvedValue(undefined),
})
beforeEach(() => {
  jest.resetModules(); mockCreateClient.mockReset()
  delete process.env.REDIS_URL; delete process.env.STACK_RECAP_REDIS_URL; delete process.env.stack_recap_REDIS_URL
  delete process.env.stack_live_REDIS_URL; delete process.env.STACK_LIVE_REDIS_URL
  delete process.env.VERCEL
})
afterEach(() => {
  jest.useRealTimers()
  for (const key of ['REDIS_URL', 'VERCEL', 'stack_live_REDIS_URL', 'STACK_LIVE_REDIS_URL', 'stack_recap_REDIS_URL', 'STACK_RECAP_REDIS_URL']) delete process.env[key]
})

it.each(['stack_live_REDIS_URL', 'STACK_LIVE_REDIS_URL'])('prefers restored database %s over archived connection variables', async (key) => {
  process.env[key] = 'redis://127.0.0.1:6388/15'
  process.env.stack_recap_REDIS_URL = 'redis://127.0.0.1:6389/15'
  process.env.REDIS_URL = 'redis://127.0.0.1:6390/15'
  const ready = candidate(); ready.connect.mockResolvedValue(ready)
  mockCreateClient.mockReturnValue(ready)
  const { getRedis } = await import('../redis')
  expect(await getRedis()).toBe(ready)
  expect(mockCreateClient).toHaveBeenCalledWith(expect.objectContaining({ url: process.env[key] }))
})

it('uses in-memory mode only when no Redis URL is configured', async () => {
  const { getRedis } = await import('../redis')
  expect(await getRedis()).toBeNull()
  expect(mockCreateClient).not.toHaveBeenCalled()
})

it('refuses ephemeral memory mode on Vercel when the shared database is missing', async () => {
  process.env.VERCEL = '1'
  const { getRedis } = await import('../redis')
  await expect(getRedis()).rejects.toThrow('shared database is required')
  expect(mockCreateClient).not.toHaveBeenCalled()
})

it('fails an unresponsive configured connection within a bounded deadline and closes its socket', async () => {
  jest.useFakeTimers()
  process.env.REDIS_URL = 'redis://127.0.0.1:6387/15'
  const stuck = candidate(); stuck.connect.mockReturnValue(new Promise(() => {}))
  mockCreateClient.mockReturnValue(stuck)
  const { getRedis } = await import('../redis')
  let result: 'pending' | 'failed' | 'resolved' = 'pending'
  void getRedis().then(() => { result = 'resolved' }, () => { result = 'failed' })
  await jest.advanceTimersByTimeAsync(5000)
  expect(result).toBe('failed')
  expect(stuck.disconnect).toHaveBeenCalledTimes(1)
})

it('shares one connecting attempt and disables automatic reconnects and offline command queueing', async () => {
  process.env.REDIS_URL = 'redis://127.0.0.1:6387/15'
  const ready = candidate()
  ready.connect.mockImplementation(async () => { ready.isOpen = true; ready.isReady = true; return ready })
  mockCreateClient.mockReturnValue(ready)
  const { getRedis } = await import('../redis')
  expect(await Promise.all([getRedis(), getRedis()])).toEqual([ready, ready])
  expect(mockCreateClient).toHaveBeenCalledTimes(1)
  expect(mockCreateClient).toHaveBeenCalledWith(expect.objectContaining({
    disableOfflineQueue: true,
    socket: expect.objectContaining({ connectTimeout: expect.any(Number), reconnectStrategy: false }),
  }))
})

it('opens a fresh connection after an established client disconnects', async () => {
  process.env.REDIS_URL = 'redis://127.0.0.1:6387/15'
  const first = candidate(); const next = candidate()
  for (const value of [first, next]) value.connect.mockImplementation(async () => { value.isOpen = true; value.isReady = true; return value })
  mockCreateClient.mockReturnValueOnce(first).mockReturnValueOnce(next)
  const { getRedis } = await import('../redis')
  expect(await getRedis()).toBe(first)
  first.isOpen = false; first.isReady = false
  expect(await getRedis()).toBe(next)
})

it('rejects a failed configured connection instead of silently creating a separate memory game', async () => {
  process.env.REDIS_URL = 'redis://127.0.0.1:6387/15'
  const failed = candidate(); failed.connect.mockRejectedValue(new Error('Connection refused'))
  mockCreateClient.mockReturnValue(failed)
  const { getRedis } = await import('../redis')
  await expect(getRedis()).rejects.toThrow('Redis unavailable')
  expect(failed.disconnect).toHaveBeenCalledTimes(1)
})


it.each([
  ['ENOTFOUND', 'DNS'],
  ['ECONNREFUSED', 'connection refused'],
  ['ETIMEDOUT', 'timeout'],
])('reports a safe connection category for %s without leaking credentials', async (code, category) => {
  process.env.REDIS_URL = 'redis://127.0.0.1:6387/15'
  const failed = candidate()
  failed.connect.mockRejectedValue(Object.assign(new Error('private-credential-value'), { code }))
  mockCreateClient.mockReturnValue(failed)
  const { getRedis } = await import('../redis')
  await expect(getRedis()).rejects.toThrow(`Redis unavailable (${category})`)
})

it('classifies authentication failure without including the provider message', async () => {
  process.env.REDIS_URL = 'redis://127.0.0.1:6387/15'
  const failed = candidate()
  failed.connect.mockRejectedValue(new Error('WRONGPASS private-credential-value'))
  mockCreateClient.mockReturnValue(failed)
  const { getRedis } = await import('../redis')
  await expect(getRedis()).rejects.toThrow('Redis unavailable (authentication)')
})
