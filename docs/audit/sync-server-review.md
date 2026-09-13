# Pod Sync server review — 2026-09-13

The server audit reproduced data loss independently of the phone recovery UI. The fixes are local and have not been deployed or tested against production data.

## Reproduced and fixed

- Four simultaneous edits on different seats previously preserved only the fourth edit. Redis reads now use MGET, and a Lua compare-and-swap commits metadata, snapshot, seats, operation history, and an optional acknowledgment receipt atomically. Conflicts retry; exhausting the bounded retry budget returns retryable `503 sync_busy`.
- Two simultaneous claims of one seat previously both succeeded. Seat claims and host releases now share the atomic mutation path.
- Redis renames changed the snapshot but left seat names stale. Every accepted state mutation now persists seat state, and each poll returns current seats even when no game operations arrived.
- A returning cursor older than retained history previously received an incomplete replay with no warning. Poll responses now include a complete snapshot when the cursor falls outside retained history.
- Retrying a response-lost operation after history rollover previously applied it twice. Separate receipt keys retain accepted envelopes for the session lifetime, committed with the operation. The polling log remains capped at 5,000 operations.
- Public joins, polling history, and seat responses exposed the device IDs used as write credentials, including through legacy operation IDs. Response projection now returns a reader's own credential only when supplied by that reader; other owner/author identifiers are opaque hashes. The updated client sends `X-Sync-Device-Id`. Dynamic GET responses explicitly disable caching.
- API inputs accepted duplicate player IDs, fractional counters, arbitrary commander-source objects, invalid winners/sources, extremely large deltas, and unmoderated live renames. Streamed bodies are capped at 32 KiB, numeric and reference fields validated, and only supported operation fields persisted. Live renames use the existing name policy.
- Real Redis testing exposed retry starvation under an uninterrupted six-device write burst. Brief jitter between conflicting commits prevents lockstep retries while preserving the bounded failure path.
- Development route bundles and module reloads each created their own memory maps, so a successful create could immediately produce `404` on poll/join. Local fallback now uses one process-wide `globalThis` registry. Vercel without a configured database rejects requests instead of pretending an ephemeral game is shared.
- Redis connection attempts could retry forever, and a resolved cached connection promise could return a dead client after disconnect. Connections now have a hard four-second deadline, no automatic reconnect/offline queue, current readiness checks, and cleanup of failed attempts. A configured database failure never switches to memory mode.

## API contract

`GET /api/sync/[id]/since?seq=N` returns `{ ops, seq, seats, snapshot? }`. A supplied snapshot replaces an incomplete replay. Seat state is current independently of the operation cursor. All GET sync requests should include `X-Sync-Device-Id` so clients can identify their own host/seat/operation identity.

The device-based authority model and create/join/write request shapes remain unchanged. `400`, `403`, `413`, and `422` are permanent write rejections; `409 game_ended` ends writes; `503 sync_busy` permits a retry with the same operation ID. Sessions and receipts expire 24 hours after creation.

## Verification

- 48 tests passed across seven suites, including three tests executing the actual Lua script against local Redis 7. Coverage includes 60 writes from six concurrent devices, six simultaneous claimants for one seat, simultaneous duplicate retries, history rollover, and receipt/session TTL agreement.
- Targeted ESLint checks passed for all changed server modules and routes.
- The TypeScript command reports existing repository errors, including absent Jest global types. Filtering the output to the changed production sync modules and routes showed no errors.
- Docker Desktop was started hidden for this authorized validation. Official `redis:7-alpine` ran in an ephemeral container bound only to `127.0.0.1:6387`, using test database 15. Tests use no environment-supplied Redis credentials and clean only their generated keys. The container was stopped and removed after verification. The production provider has not been contacted. Redis documents [atomic script execution](https://redis.io/docs/latest/develop/programmability/eval-intro/) and [SET KEEPTTL](https://redis.io/docs/latest/commands/set/).

To repeat local integration checks, provide your own Redis 7 instance at that loopback test port and run `RUN_LOCAL_REDIS_TESTS=1` with the `sync-store-live-redis.test.ts` Jest suite. The suite is skipped by default.

## Remaining boundaries

- Existing open tabs need the updated client to supply the identity header. Response projection cannot revoke credentials already exposed by a prior release.
- Existing pre-deployment operations already trimmed from history have no recoverable receipt. New accepted operations retain receipts independently of the replay log.
- This change preserves the existing full-state JSON storage format for compatible rollout. Polling and write costs still scale with the retained history; Redis-native indexed history is a future optimization if traffic warrants it.
- The protocol remains a lightweight shared-table system without account authentication or a rate-limiting redesign.
