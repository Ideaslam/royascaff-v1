# Impact — Change 019 (Rate-Limit Regression Test)

Fast-Track recon. Scope: `payup-api-typescript` only, test-layer plus one plan-doc note.

## Fast-Track Criteria — all met

| # | Criterion | Verdict |
|---|-----------|---------|
| 1 | ≤ 1 module | ✅ Platform/Security → Rate Limiting |
| 2 | No new data model entities/fields | ✅ none |
| 3 | No new services/endpoints | ✅ test-only; `RateLimitService` unchanged |
| 4 | Backend-only | ✅ |
| 5 | Clear description | ✅ derived from `bug-011` |

## Feature State

- `src/services/core/rate-limit-service.ts` exists; `bug-011` fix (`useRedisPackage: true` +
  error classification) is in place and was manually verified.
- Spec: `actions/backend/services/core.md` → **SVC-CO04 · RateLimitService**. Two lines only; it does
  **not** record the node-redis interop constraint, so the fix is currently undocumented in the plan.
- Tests: `tests/` contains `currency/`, `money/`, `seed/`, `sdk-payment-environment.test.ts`.
  **No rate-limit test exists.** No `tests/rate-limit/` directory.

## Root Cause, Confirmed From Library Source

`node_modules/rate-limiter-flexible/lib/RateLimiterRedis.js`:

```js
this.useRedisPackage = opts.useRedisPackage || this.client.constructor.name === 'Commander' || false;
if (typeof this.client.defineCommand === 'function') {
  this.client.defineCommand('rlflxIncr', { ... });   // ioredis only
}
```

Dialect selection is **name-sniffing on the client class**. node-redis v5 no longer names its
internal client class `Commander`, so `useRedisPackage` resolved to `false` and `_upsert` took the
ioredis branch:

```js
return this.client.rlflxIncr([rlKey].concat([...]));   // never defined on node-redis
```

node-redis has no `defineCommand`, so `rlflxIncr` was never attached → `TypeError` → our `catch` →
`failOpen`. This is the exact production symptom from `bug-011`.

**Testability consequence**: this is reproducible *only* with a client that has node-redis's shape
and lacks `defineCommand`. A conventional hand-written mock (`{ consume: jest.fn() }` or a stubbed
limiter) cannot express it and would pass while production was unenforced.

## Test Design

Two files, deliberately layered.

### A. `tests/rate-limit/rate-limit-service.test.ts` — always runs, no infrastructure

A `fakeNodeRedis()` store client that reproduces the production shape rather than mocking our own
service:
- implements `eval(script, { keys, arguments })` with the real Lua semantics
  (`set NX` → `incrby` → `pttl`) over an in-memory map, returning `[consumed, ttlMs]`
- implements `multi()` (the library calls it unconditionally)
- **omits `defineCommand`**, and its constructor name is not `Commander`

Consequence: if `useRedisPackage: true` is ever removed, the library takes the ioredis branch,
`rlflxIncr` is undefined, `consume()` fails open, and the enforcement assertion **fails**. The guard
is behavioral — it does not assert on constructor arguments or library internals, so it will not rot
when the library refactors.

Cases: enforcement within a window (AC-1, AC-2) · independent budgets per key · fail-open with
`result=store_error` on an outage (AC-3) · `result=store_misconfigured` on a `TypeError` (AC-4) ·
limiter disabled when the client is `null`/not ready.

### B. `tests/rate-limit/rate-limit-redis-interop.test.ts` — real Redis, skips if unreachable

Real `createClient()` from `redis` + real `RateLimitService`, asserting true end-to-end enforcement
against the actual installed client version. This is the only test that would catch a *future*
node-redis release breaking interop in a new way. Skipped when Redis is unreachable so `npm test`
stays runnable; unique key prefix per run, keys deleted on teardown.

AC-5 holds because the always-on file (A) is the one that guards `bug-011` — no silent gap if
Redis is missing.

## Files To Change

| File | Change |
|------|--------|
| `tests/rate-limit/rate-limit-service.test.ts` | new — always-on behavioral guard |
| `tests/rate-limit/rate-limit-redis-interop.test.ts` | new — live-Redis interop guard |
| `package.json` | new script `test:rate-limit` |
| `project/actions/backend/services/core.md` | SVC-CO04: record interop constraint + fail-open policy |
| `project/bugs/bug-011-rate-limiter-fails-open.md` | link the regression guard |

## Ripple Effects

- **None in production code.** `src/` is untouched; `RateLimitService` keeps its current behavior.
- `jest.config.js` needs no change — `roots: ['<rootDir>/tests']` already covers a new subdirectory.
- Note: `moduleNameMapper` maps `^@/` → `<rootDir>/server/`, which **does not exist** (source lives
  in `src/`). Existing tests sidestep it with relative imports; the new tests will do the same.
  Pre-existing issue, out of scope.
- No CI workflow exists in this repo (`.github/workflows` absent), so these tests guard local
  `npm test` runs only. Flagged for a future change; not created here.
