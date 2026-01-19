export interface ShareSession {
  id: string
  state: unknown
  createdAt: number
  updatedAt: number
  expiresAt: number
}

const SESSION_TTL_MS = 5 * 60 * 60 * 1000
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

export const createSession = (state: unknown): ShareSession => {
  cleanupExpired()
  const now = Date.now()
  const session: ShareSession = {
    id: createId(),
    state,
    createdAt: now,
    updatedAt: now,
    expiresAt: now + SESSION_TTL_MS,
  }
  sessions.set(session.id, session)
  return session
}

export const updateSession = (id: string, state: unknown): ShareSession | null => {
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

export const getSession = (id: string): ShareSession | null => {
  cleanupExpired()
  const session = sessions.get(id)
  if (!session) {
    return null
  }
  return session
}

export const deleteSession = (id: string): void => {
  sessions.delete(id)
}

export const getSessionTtlMs = () => SESSION_TTL_MS
