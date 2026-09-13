import { createClient } from 'redis'

let client: ReturnType<typeof createClient> | null = null
let connecting: Promise<ReturnType<typeof createClient>> | null = null
const CONNECT_TIMEOUT_MS = 4_000

/**
 * Resolve the Redis connection URL.
 *
 * Vercel's Upstash Marketplace integration prefixes every env var with the
 * database name (e.g. `stack_recap_REDIS_URL`). We prefer those when present
 * so the integration "just works" without manually aliasing vars in the
 * Vercel dashboard. Falls back to plain `REDIS_URL` for local dev and any
 * environment that wires Redis manually.
 */
const resolveRedisUrl = (): string | undefined => {
  const env = process.env
  // Most specific first: Upstash Marketplace (prefixed) for this project.
  if (env.stack_recap_REDIS_URL) return env.stack_recap_REDIS_URL
  if (env.STACK_RECAP_REDIS_URL) return env.STACK_RECAP_REDIS_URL
  // Fallback: a manually-set unprefixed var (local dev, custom infra).
  if (env.REDIS_URL) return env.REDIS_URL
  return undefined
}

export const getRedis = async () => {
  const url = resolveRedisUrl()
  if (!url) {
    if (process.env.VERCEL === '1') throw new Error('Redis unavailable: a shared database is required on Vercel')
    return null
  }

  if (client?.isReady) {
    return client
  }

  if (!connecting) {
    if (client) void client.disconnect().catch(() => {})
    const candidate = createClient({
      url,
      socket: { connectTimeout: CONNECT_TIMEOUT_MS, reconnectStrategy: false },
      disableOfflineQueue: true,
    })
    client = candidate
    // The request sees a rejected connection/command. Handling the event avoids
    // an unhandled EventEmitter error; it never enables an in-memory fallback.
    candidate.on('error', () => {})
    let timer: ReturnType<typeof setTimeout>
    const deadline = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => reject(new Error('Redis connection timed out')), CONNECT_TIMEOUT_MS)
    })
    const attempt = Promise.race([Promise.resolve().then(() => candidate.connect()), deadline])
      .then(() => candidate)
      .catch(() => {
        if (client === candidate) client = null
        void candidate.disconnect().catch(() => {})
        throw new Error('Redis unavailable')
      })
      .finally(() => {
        clearTimeout(timer)
        if (connecting === attempt) connecting = null
      })
    connecting = attempt
  }

  return connecting
}
