# Production release — September 14, 2026

Published the approved table-reliability, Learn and reference-tool changes by fast-forwarding GitHub master from 14861a8 to 11f0b73. Follow-up diagnostic commit 50327c1 is also deployed.

- Live: https://www.thestack.gg (also thestack.gg).
- Vercel project: thestack-gg / prj_ZTQii6lg2SA1sn1bXdKmpcOfvmmM.
- Latest ready deployment: dpl_CS6jkFcL8w1GS6oesz9rXMG5K7y4, https://thestack-ajp5rava0-matt-moats-projects.vercel.app.
- Previous production/rollback candidate: dpl_8u1SE8EzzaGHYddCZgiXFkR5tN24 (14861a8).
- Pre-release full suite: 747 passed, 3 opt-in tests skipped. Diagnostic follow-up: 15 Redis/atomic-store tests passed; TypeScript and focused lint passed. Four added diagnostic tests first failed, then passed.
- Live route probes: tokens, Learn, dice, Stack, cards, glossary, Codex and privacy all returned HTTP 200 with expected release text. Live rules API returned HTTP 200 with parsed rules. Live token UI rendered its new tray controls.

## Database recovery

POST /api/sync fails before creating a record. Deployment-scoped server logs on the latest release show `Redis unavailable (DNS)`. A Redis URL is configured but its hostname cannot be resolved from production. The connection selector/URL priorities are unchanged from the former live code. Do not claim that the hosted syncing feature is verified, or that reverting application code would restore database DNS.

After user sign-in, Upstash confirmed the original free database was archived/deleted due to inactivity. Its backup was dated June 27, 2026. Created `thestack-recap-restored` on the Free plan in AWS US-WEST-2 through the existing Vercel Upstash integration. Upstash reports migration Completed into the new empty database; restoration does not guarantee that expired game records remain available.

The replacement is connected only to this project's Production environment with the `stack_live` prefix. Vercel would not overwrite the old integration's variables, so the application now prefers `stack_live_REDIS_URL` / `STACK_LIVE_REDIS_URL` before the existing recap and generic fallbacks. Old resources and connection variables were preserved. No credentials were printed or committed. Two connection-precedence regressions failed before the change and all 12 Redis tests now pass; TypeScript and focused lint pass.

Replacement Upstash database: `008523ac-0901-4f17-ac15-51450826f4a5`; Vercel store: `store_DtPCvRacbMnq1lAA`. Integration: `icfg_bqKBLKwMwKRpt5vF61yYTb0X`. Production redeployment and live sync verification are pending below.

The Free plan can be archived after 14 days of inactivity. No paid plan or recurring keepalive was enabled. Preview and local development retain their existing configuration; provision separate test storage if hosted preview sync is needed.

The temporary test script is at %TEMP%\thestack-release-smoke.cjs. It creates its own anonymous test table, tests same-device seat reclaim, duplicate operation idempotency, persisted life and public identity masking, then ends that test table. No successful table was created in the failed attempts and no existing user table was changed. Avoid printing credentials or publicizing test join codes.

