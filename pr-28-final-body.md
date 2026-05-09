### Motivation

- Make the flagship homepage concise and release-ready by tightening positioning and primary actions for operators.
- Ensure entitlement-driven Discord role reconciliation is production-safe by resolving guild/role IDs from Worker environment bindings instead of static config.
- Exercise retry/failed-Discord-sync behavior in tests to guarantee the entitlement retry queue and admin sync paths work as expected.
- Remove public-sensitive/internal artifacts from the release branch before publication.

### Description

- Updated flagship messaging and layout: revised hero copy and metric rail, adjusted proof points and ecosystem signals, and replaced the placeholder Next.js root with a polished release entry and primary action links.
- Made Discord role mapping environment-driven by replacing static guild/role config usage with Worker `env` bindings.
- Threaded Discord role environment bindings through entitlement flows so persisted entitlements contain correct guild IDs and role reconciliation uses bound values.
- Updated Discord sync behavior to forward env into role reconciliation and enqueue retry tasks on failure.
- Added role env bindings to entitlement tests so failed mutations exercise retry queue behavior.
- Removed sensitive/internal artifacts, broken Stripe audit package references, stale workflows, local binaries, scratch notes, and strategy documents from the release branch.
- Updated Next from `16.2.4` to `16.2.6`.
- Updated the locked Hono dependency to `4.12.18` with the safe non-force audit path.
- Enabled GitHub `code_security`.

### Testing

- `npm run lint` passes with warnings only.
- `npm run typecheck` passes.
- `npm test -- --run` passes.
- `npm run build` passes.
- `node scripts/jpv-policy-enforcement.cjs` passes.
- `npm run jpv:enforce` passes.
- `npm audit --audit-level=moderate` still reports 2 moderate Next/PostCSS findings. `npm audit fix --force` was not applied because it would introduce an unsafe breaking downgrade path.

### Release Gate

Correct production mapping remains:

- `jaypventures` = creator ecosystem
- `jaypventuresllc` = labs / institutional / business ecosystem

Do not merge or deploy if this mapping is inverted.
