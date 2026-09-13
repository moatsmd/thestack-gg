# Dependency security remediation — 2026-09-13

The initial production dependency audit reported **20 vulnerabilities: one critical, 15 high, three moderate, and one low**. After the updates below, both `npm audit --omit=dev` and the full `npm audit` report **zero vulnerabilities**. This is a dated dependency-advisory check, not a claim that the application cannot contain security defects.

## Framework selection

Next.js was pinned to 14.2.22. The official [August 2026 security release](https://nextjs.org/blog/august-2026-security-release) fixes two critical issues starting at 15.5.24 and 16.3.3, including an issue affecting certain Windows-hosted applications. The [support policy](https://nextjs.org/support-policy) lists 15.x as Maintenance LTS and 16.x as Active LTS; 14.x is unsupported.

The application now uses **Next.js 15.5.25** and matching **eslint-config-next 15.5.25**. This is the smallest supported major upgrade containing the current fixes. React and React DOM remain on the existing 18.3 line, accepted by the installed Next package's peer range. The existing Three.js dependencies are preserved.

The [Next.js 15 migration guide](https://nextjs.org/docs/app/guides/upgrading/version-15) requires asynchronous dynamic route parameters. Dynamic API routes, blog pages, pod/recap pages, and their generated images now await Promise-based parameters. Sync API tests use the same Promise contract. Next's generated type checks stay enabled. Jest globals and DOM matcher types are now available to TypeScript through `@types/jest` and `jest.d.ts`.

## PWA and transitive dependencies

- Replaced unmaintained `next-pwa` 5.6 with [`@ducanh2912/next-pwa`](https://github.com/DuCanhGH/next-pwa) 10.2.9. Its supported Next range includes version 15.
- The fork pins older Workbox 7 dependencies, so a scoped override advances its four direct Workbox packages to **7.4.1**. This removes the vulnerable legacy Rollup/Terser serialization chain while staying within Workbox's major version.
- A Next-only override selects **PostCSS 8.5.28**, because Next 15.5.25 otherwise pins the vulnerable 8.4.31 version.
- A `glob@10.5.0` override selects **minimatch 9.0.9** for the remaining development-only advisory. Other minimatch major versions are unchanged.
- Ran non-forcing `npm audit fix` for compatible transitive patches. No `--force` downgrade was used.

The PWA configuration preserves automatic registration, update activation, outdated-cache cleanup, and the existing cache identifier. Workbox-specific options now live under the fork's `workboxOptions`. **Every `/api/` request is NetworkOnly**, so cached ownership, life totals, recaps, or pod membership cannot be replayed by the service worker. Development builds still use `.next-dev`; production builds use `.next`.

## Evidence

- `dependencies-after.json`: production dependency audit, zero findings.
- `dependencies-all-after.json`: complete dependency audit, zero findings.
- Next 15 production JavaScript and the Workbox 7 service worker compiled successfully during migration; final validation is recorded in the overall audit handoff.
- 51 focused store/API tests passed after the framework upgrade. The three real-Redis integration tests are opt-in and were already exercised before removal of their temporary local container.

All changes are local. No deployment or production credentials were used.
