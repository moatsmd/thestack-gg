# Production release — September 14, 2026

Published the approved table-reliability, Learn and reference-tool changes by fast-forwarding GitHub master from 14861a8 to 11f0b73. Follow-up diagnostic commit 50327c1 is also deployed.

- Live: https://www.thestack.gg (also thestack.gg).
- Vercel project: thestack-gg / prj_ZTQii6lg2SA1sn1bXdKmpcOfvmmM.
- Verified application deployment: dpl_By8h8naY5sFNfFyDCoNfmQFcpiat, https://thestack-8ap2o48jq-matt-moats-projects.vercel.app, application commit 1044c5d. Vercel reports READY with both production domains attached.
- Previous production/rollback candidate: dpl_8u1SE8EzzaGHYddCZgiXFkR5tN24 (14861a8).
- Pre-release full suite: 747 passed, 3 opt-in tests skipped. Diagnostic follow-up: 15 Redis/atomic-store tests passed; TypeScript and focused lint passed. Four added diagnostic tests first failed, then passed.
- Live route probes: tokens, Learn, dice, Stack, cards, glossary, Codex and privacy all returned HTTP 200 with expected release text. Live rules API returned HTTP 200 with parsed rules. Live token UI rendered its new tray controls.

## Database recovery

The initial release exposed an existing infrastructure failure: POST /api/sync failed before creating a record, and deployment-scoped logs showed `Redis unavailable (DNS)`. The configured database hostname could not resolve. Reverting the application would not have restored database DNS.

After user sign-in, Upstash confirmed the original free database was archived/deleted due to inactivity. Its backup was dated June 27, 2026. Created `thestack-recap-restored` on the Free plan in AWS US-WEST-2 through the existing Vercel Upstash integration. Upstash reports migration Completed into the new empty database; restoration does not guarantee that expired game records remain available.

The replacement is connected only to this project's Production environment with the `stack_live` prefix. Vercel would not overwrite the old integration's variables, so the application now prefers `stack_live_REDIS_URL` / `STACK_LIVE_REDIS_URL` before the existing recap and generic fallbacks. Old resources and connection variables were preserved. No credentials were printed or committed. Two connection-precedence regressions failed before the change and all 12 Redis tests now pass; TypeScript and focused lint pass.

Replacement Upstash database: `008523ac-0901-4f17-ac15-51450826f4a5`; Vercel store: `store_DtPCvRacbMnq1lAA`. Integration: `icfg_bqKBLKwMwKRpt5vF61yYTb0X`. Production redeployment and live sync verification succeeded.

The Free plan can be archived after 14 days of inactivity. No paid plan or recurring keepalive was enabled. Preview and local development retain their existing configuration; provision separate test storage if hosted preview sync is needed.

## Live verification

The temporary test script at %TEMP%\thestack-release-smoke.cjs passed against https://www.thestack.gg after recovery: shared table creation, repeated same-device seat claim, one-time application of a retried life operation (40 to 39), persisted life/seat ownership on rejoin, public identity masking, and no-store response headers. It ended its own anonymous test table. No existing user table was changed. Avoid printing credentials or publicizing test join codes.

Final focused Redis and atomic sync-store suites: 17 tests passed. This is live API verification, not physical iOS/Android sleep-and-wake certification. Earlier automated browser evidence and the remaining device/GPU validation limits remain in the audit documents.

