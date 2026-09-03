# Bug #011 — Rate Limiting Silently Disabled Across the Entire API

## Status
**DONE** — Fix applied and confirmed

- **Confirmed**: 2026-09-03

## Reported
- **Date**: 2026-09-03
- **Severity**: critical
- **Affected area**: `backend/rate-limiting` — `src/services/core/rate-limit-service.ts`

## Description

Every rate-limited request logs `Rate limiter error … this.client.rlflxIncr is not a function` and is then **allowed through unlimited**. `RateLimitService.consume()` catches the error and calls `failOpen()`, so requests succeed normally and nothing surfaces to the caller — the only symptom is a log line.

The practical effect is that **no rate limit anywhere in the API is enforced**, including the sensitive tiers: OTP verification, authentication, and the public payment endpoints. Brute-force and abuse protection is absent while appearing configured (`rateLimitEnabled: true` on boot).

Found while reading API logs during change-018 (dashboard redesign). Not caused by that change — it affects every rate-limited endpoint — but the new dashboard issues 9 requests per page load instead of 2, which made the error roughly 4× more frequent and visible.

## Expected Behavior

`RateLimiterRedis` should increment counters in Redis and throw `RateLimiterRes` once a tier's points are exhausted, so `consume()` returns a block result and the middleware rejects the request with 429. `failOpen()` should only ever run when Redis is genuinely unavailable.

## Steps to Reproduce

1. Start the API with Redis reachable (`rateLimitEnabled: true`).
2. Issue any rate-limited request (any merchant-panel or public endpoint).
3. Observe the API log: `ERROR: Rate limiter error … error: "this.client.rlflxIncr is not a function"`, `fallbackMode: "allow"`.
4. Exceed any tier's configured points — the request is still allowed. No 429 is ever returned.

Isolated reproduction (no app code involved):

```
--- CURRENT config (no useRedisPackage) ---
  FAILED: this.client.rlflxIncr is not a function
--- PROPOSED config (useRedisPackage: true) ---
  req 1: allowed, remaining=2
  req 2: allowed, remaining=1
  req 3: allowed, remaining=0
  req 4: BLOCKED (msBeforeNext=59990)
```

## Root Cause

A client-library detection mismatch between `rate-limiter-flexible@11.1.1` and `redis@5.12.1`.

`RateLimiterRedis` supports both `ioredis` and `node-redis`, and picks the code path by sniffing the client's class name (`node_modules/rate-limiter-flexible/lib/RateLimiterRedis.js:32`):

```js
this.useRedisPackage = opts.useRedisPackage || this.client.constructor.name === 'Commander' || false;
```

- In `redis` v4 the client class was named `Commander`, so detection worked.
- In `redis` v5 it is an anonymous generated class whose `constructor.name` is **`"Class"`**, so the check fails and `useRedisPackage` stays `false`.

With `useRedisPackage === false` the library assumes an `ioredis` client and takes the ioredis path:

1. Constructor (line 34) guards on `typeof this.client.defineCommand === 'function'` to register the Lua script as a custom command `rlflxIncr`. `node-redis` has no `defineCommand`, so **the command is never defined**.
2. `_upsert` (line 139) then calls `this.client.rlflxIncr(...)` unconditionally on that path → `TypeError: this.client.rlflxIncr is not a function`.

Verified against the live client:

| Check | Value |
|-------|-------|
| `redis` version | `5.12.1` |
| `client.constructor.name` | `"Class"` (library expects `"Commander"`) |
| `typeof client.defineCommand` | `undefined` |
| `typeof client.rlflxIncr` | `undefined` |
| `typeof client.eval` | `function` ✓ |
| `typeof client.pTTL` | `function` ✓ |

The node-redis path the library *should* be taking uses `client.eval(script, { keys, arguments })` and camelCase `multi().incrBy().pTTL().exec(true)` — both present and correct on the v5 client. So the store is fully compatible; only the autodetection is wrong.

This is a latent defect exposed by a dependency upgrade, not by any application logic. It has been failing open since `redis` moved to v5.

## Fix Applied

**1 · Declare the client family explicitly** in `initializeLimiters()`, instead of relying on the library's class-name sniffing:

```ts
new RateLimiterRedis({
  storeClient: redisClient,
  // Declare the client family explicitly. rate-limiter-flexible otherwise
  // sniffs it via `constructor.name === 'Commander'`, which held for
  // node-redis v4 but not v5 — whose client is an anonymous class named
  // "Class". Failing that check drops it onto the ioredis path, where it
  // calls a `rlflxIncr` custom command that node-redis cannot define, so
  // every consume() threw and rate limiting silently failed open.
  useRedisPackage: true,
  keyPrefix: config.keyPrefix,
  ...
})
```

**2 · Distinguish a broken store from an unreachable one** in `consume()`'s catch block. Fail-open remains the response in both cases — an outage should not take the API down — but a `TypeError` means the limiter and its client disagree on their contract, which will never self-heal and must not read as a transient blip:

```ts
const storeMisconfigured = error instanceof TypeError;

this.metrics.incrementCounter('rate_limit_hits_total', {
  tier,
  result: storeMisconfigured ? 'store_misconfigured' : 'store_error',
});

this.logger.error(
  storeMisconfigured
    ? 'Rate limiter store misconfigured — limits are NOT being enforced'
    : 'Rate limiter error',
  { ..., actionRequired: 'not an outage and will not self-heal' }
);
```

Reuses the already-registered `rate_limit_hits_total{tier,result}` counter, so the metrics registry is untouched and `rate_limit_hits_total{result="store_misconfigured"}` is directly alertable.

Minimal and isolated: one file, no change to tier configuration, middleware, or fail-open semantics.

## Verification

Isolated store probe — current vs. proposed option, against live Redis:
```
--- CURRENT config ---   FAILED: this.client.rlflxIncr is not a function
--- PROPOSED config ---  req 1..3 allowed (remaining 2,1,0) → req 4 BLOCKED
```

End-to-end against the running API, `POST /api/admin/v1/auth/login` (`MERCHANT_SENSITIVE`, 100 points / 15 min):
```
rl:* keys at baseline: 0
  req 1   -> 400        (reaches handler; 400 = bad credentials)
  req 2   -> 400
  >>> FIRST 429 at request 101
  req 105 -> 429

Redis counter: rl:merchant:sensitive:ip:127.0.0.1 = 105 (ttl 1800s)
rlflxIncr errors in log:      0
store_misconfigured in log:   0
```
Enforcement begins at exactly the configured boundary (request 101 of a 100-point tier), and the limiter now writes counters to Redis — before the fix, no `rl:*` key was ever created because every `consume()` threw.

Outage classification is not over-eager — a closed client throws `ClientClosedError`, not `TypeError`:
```
error class          : ClientClosedError
instanceof TypeError : false
=> classified as store_error (CORRECT — fails open as an outage)
```

- [x] Fix implemented in code
- [x] `tsc --noEmit` clean; no linter errors
- [x] Limiter enforces configured points (429 at request 101 of 100) instead of failing open
- [x] Limiter writes counters to Redis (`rl:merchant:sensitive:*` with correct TTL)
- [x] No `rlflxIncr` errors in API logs under a 105-request burst
- [x] Redis-down still fails open — `ClientClosedError` is not a `TypeError`, so it takes the `store_error` path
- [x] No regressions introduced — both branches still call `failOpen()`; tier config, middleware, and metrics registry untouched
- [x] User confirmed fix resolves the issue

## Regression Guard

Added by [change-019-rate-limit-regression-test](../changes/change-019-rate-limit-regression-test/).

At the time of this fix there was no test for `RateLimitService` at all, and the defect was not
catchable by a conventional mock: it lived in dialect detection inside `rate-limiter-flexible`, so a
hand-stubbed limiter would have passed while production was unenforced. The guard therefore fakes
the **store client** — node-redis's dialect, no `defineCommand`, constructor not named `Commander` —
so removing `useRedisPackage: true` puts the limiter back on the ioredis path and the tests fail.

Validated by reverting the fix in `src/`: **9 of 15 tests failed** across both suites. The 6 that
still passed are the fail-open and reproduction cases, which by design do not depend on the flag.

## Related Files
- `payup-api-typescript/src/services/core/rate-limit-service.ts` — added `useRedisPackage: true`; classified store errors in `consume()`
- `payup-api-typescript/tests/rate-limit/rate-limit-service.test.ts` — always-on regression guard
- `payup-api-typescript/tests/rate-limit/rate-limit-redis-interop.test.ts` — live-Redis interop guard
