# Deployment, Scale, and Security Plan

This plan targets low-cost deployment with a reliable user experience for a public launch.

## Deployment Plan (Scale + Cost)

### Stack
- Vercel for Next.js app + API routes
- Redis for share sessions (Upstash or Vercel KV)
- Polling at 1s for live share view (MVP)

### Concrete Setup
1. Create a Redis instance (Upstash or Vercel KV).
2. Set `REDIS_URL` in Vercel environment variables.
3. Deploy and verify share sessions persist for 5 hours.

### Cost Controls
- Keep share payload size under 50KB.
- Debounce host updates (350-500ms).
- Poll only while tab is visible; back off to 3-5s in background.
- Session TTL stays at 5 hours.

### Reliability Controls
- Add a simple `/status` route (optional) to confirm Redis connectivity.
- Add error logging (Sentry free tier).
- Add uptime checks (Better Uptime free tier).

### Expected Cost
- Vercel: free or low-cost for small traffic.
- Redis: free tier or low-cost at small scale.
- Total target: $0-$10/month at Reddit-scale usage.

## Security Hardening Plan

### Input Validation
- Validate share payload shape and size in API routes.
- Reject oversized states (e.g., > 50KB).

### Rate Limits
- Limit session creation per IP (e.g., 10 per hour).
- Limit update calls per IP (e.g., 60 per minute).

### Session Safety
- Random short IDs (already implemented).
- Enforce TTL in Redis (5 hours).
- Manual "Stop sharing" deletes session immediately.

### Headers
- Add security headers: `Content-Security-Policy`, `X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy`.

### Dependency Hygiene
- Run `npm audit` before release.
- Use Dependabot or Renovate for dependency updates.

### Failure Modes
- If Redis is down, show "Sharing unavailable" on host.
- Viewers should see "Session unavailable" with retry guidance.

## Pre-Launch Checklist

- Verify share links persist for 5 hours.
- Test polling view in multiple devices.
- Confirm rate limits under expected traffic.
- Confirm uptime monitor alerts are configured.
