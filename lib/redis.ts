import { createClient } from 'redis'

let client: ReturnType<typeof createClient> | null = null
let connecting: Promise<ReturnType<typeof createClient>> | null = null

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
    return null
  }

  if (client && client.isOpen) {
    return client
  }

  if (!connecting) {
    client = createClient({ url })
    // If a connection attempt fails, surface null on next call instead of
    // hanging forever on a dead URL.
    client.on('error', () => {
      // swallow — the store layer treats a missing/dead Redis as in-memory mode.
    })
    connecting = client.connect().then(
      () => client!,
      (err) => {
        connecting = null
        client = null
        throw err
      },
    )
  }

  return connecting
}
