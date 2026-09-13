import { createHash } from 'node:crypto'
import type { SyncJoinResponse, SyncOpEnvelope, SyncPollResponse, SyncSeat } from '@/types/sync'

export const SYNC_RESPONSE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  Vary: 'X-Sync-Device-Id',
}

// Device ids are bearer credentials in this lightweight table protocol. Public
// readers may see occupancy and authorship, but never another device's token.
// Including a known token in a request only reveals that same token back.
const publicId = (value: string) => `public:${createHash('sha256').update(value).digest('hex')}`
const deviceFor = (value: string, requester: string | null) => value === requester ? value : publicId(value)

export const publicSeats = (seats: SyncSeat[], requester: string | null): SyncSeat[] => seats.map((seat) => ({
  ...seat,
  ownerDeviceId: seat.ownerDeviceId === null ? null : deviceFor(seat.ownerDeviceId, requester),
}))

export const publicEnvelope = (envelope: SyncOpEnvelope, requester: string | null): SyncOpEnvelope => ({
  ...envelope,
  deviceId: deviceFor(envelope.deviceId, requester),
  // Old clients embed their device credential in opId, so mask both fields.
  opId: envelope.deviceId === requester ? envelope.opId : publicId(envelope.opId),
})

export const publicSession = (data: SyncJoinResponse, requester: string | null): SyncJoinResponse => ({
  session: { ...data.session, hostDeviceId: deviceFor(data.session.hostDeviceId, requester) },
  snapshot: data.snapshot,
  seats: publicSeats(data.seats, requester),
})

export const publicPoll = (data: SyncPollResponse, requester: string | null): SyncPollResponse => ({
  ...data,
  seats: publicSeats(data.seats, requester),
  ops: data.ops.map((envelope) => publicEnvelope(envelope, requester)),
})
