import { createClient } from 'redis'

let client: ReturnType<typeof createClient> | null = null
let connecting: Promise<ReturnType<typeof createClient>> | null = null

export const getRedis = async () => {
  if (!process.env.REDIS_URL) {
    return null
  }

  if (client && client.isOpen) {
    return client
  }

  if (!connecting) {
    client = createClient({ url: process.env.REDIS_URL })
    connecting = client.connect().then(() => client!)
  }

  return connecting
}
