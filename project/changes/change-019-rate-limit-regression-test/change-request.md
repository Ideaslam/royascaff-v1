# Change Request 019 — Rate-Limit Regression Test

- **Target app**: `payup-api-typescript` (backend only)
- **Module**: Platform / Security — Rate Limiting
- **Flow**: Fast-Track (Phase 5)
- **Origin**: Follow-up guard for `bug-011-rate-limiter-fails-open.md`

---

## Problem

`bug-011` found that the rate limiter had been silently disabled in production. `RateLimiterRedis`
sniffs its store client to decide which Redis dialect to speak. Our client is `redis` (node-redis)
v5, which the library mis-detected as `ioredis`, so every `consume()` threw
`TypeError: storeClient.rlflxIncr is not a function`, hit the `catch`, and **failed open**. Limits
were never enforced, and the only signal was a log line indistinguishable from a Redis outage.

The fix was one option: `useRedisPackage: true`.

The problem is that nothing in the test suite can detect this class of failure:

1. There is **no test at all** for `RateLimitService` (`tests/` has only `currency`, `money`, `sdk`, `seed`).
2. The defect lives entirely in **third-party interop**. A test with a hand-mocked Redis would have
   passed happily while production was wide open — the mock defines whatever methods the test author
   imagines, so it can never reproduce a client-dialect mismatch.

So the regression is currently invisible to CI, and it is a security control that fails *silently
and permanently* — it does not self-heal and it does not page anyone.

## Desired Behavior

CI fails if the limiter ever stops enforcing limits, including when the cause is a Redis client
library upgrade rather than our own code.

## Affected Users

Platform/security engineers, and indirectly every merchant (an unenforced limiter exposes login and
payment-session endpoints to brute force and abuse).

## Acceptance Criteria

- **AC-1** — A test asserts the limiter **enforces** its configured tier limit against a real
  node-redis client: the first `points` requests succeed and the next is blocked.
- **AC-2** — That test fails if `useRedisPackage` is removed (proves it actually guards `bug-011`).
- **AC-3** — A test asserts a genuine store outage still **fails open** (availability over
  enforcement is a deliberate choice and must not silently invert).
- **AC-4** — A test asserts store misconfiguration is reported **distinctly** from an outage
  (`result=store_misconfigured`), so this bug class is diagnosable next time.
- **AC-5** — The suite runs in CI without new infrastructure requirements, and does not silently
  pass when its dependency is missing.

## Out of Scope

- Changing rate-limit tiers, budgets, or the fail-open policy itself.
- Middleware/route-level integration tests.
