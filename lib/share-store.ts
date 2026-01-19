import { getRedis } from '@/lib/redis'

export interface ShareSession {
  id: string
  state: unknown
  createdAt: number
  updatedAt: number
  expiresAt: number
}

const SESSION_TTL_MS = 5 * 60 * 60 * 1000
const SESSION_TTL_SEC = Math.floor(SESSION_TTL_MS / 1000)
const sessions = new Map<string, ShareSession>()

const cleanupExpired = () => {
  const now = Date.now()
  sessions.forEach((session, id) => {
    if (session.expiresAt <= now) {
      sessions.delete(id)
    }
  })
}

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().slice(0, 8)
  }
  return Math.random().toString(16).slice(2, 10)
}

const getKey = (id: string) => `share:${id}`

export const createSession = async (state: unknown): Promise<ShareSession> => {
  const now = Date.now()
  const session: ShareSession = {
    id: createId(),
    state,
    createdAt: now,
    updatedAt: now,
    expiresAt: now + SESSION_TTL_MS,
  }

  const redis = await getRedis()
  if (!redis) {
    cleanupExpired()
    sessions.set(session.id, session)
    return session
  }

  await redis.set(getKey(session.id), JSON.stringify(session), {
    EX: SESSION_TTL_SEC,
  })
  return session
}

export const updateSession = async (id: string, state: unknown): Promise<ShareSession | null> => {
  const redis = await getRedis()
  if (!redis) {
    cleanupExpired()
    const existing = sessions.get(id)
    if (!existing) {
      return null
    }
    const now = Date.now()
    const updated: ShareSession = {
      ...existing,
      state,
      updatedAt: now,
      expiresAt: now + SESSION_TTL_MS,
    }
    sessions.set(id, updated)
    return updated
  }

  const key = getKey(id)
  const cached = await redis.get(key)
  if (!cached) {
    return null
  }

  const existing = JSON.parse(cached) as ShareSession
  const now = Date.now()
  const updated: ShareSession = {
    ...existing,
    state,
    updatedAt: now,
    expiresAt: now + SESSION_TTL_MS,
  }

  await redis.set(key, JSON.stringify(updated), { EX: SESSION_TTL_SEC })
  return updated
}

export const getSession = async (id: string): Promise<ShareSession | null> => {
  const redis = await getRedis()
  if (!redis) {
    cleanupExpired()
    return sessions.get(id) ?? null
  }

  const cached = await redis.get(getKey(id))
  if (!cached) {
    return null
  }
  return JSON.parse(cached) as ShareSession
}

export const deleteSession = async (id: string): Promise<void> => {
  const redis = await getRedis()
  if (!redis) {
    sessions.delete(id)
    return
  }
  await redis.del(getKey(id))
}

export const getSessionTtlMs = () => SESSION_TTL_MS
