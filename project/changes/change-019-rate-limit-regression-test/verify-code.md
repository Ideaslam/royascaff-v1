# Verify — Change 019 (Rate-Limit Regression Test)

**Overall: PASS**

## Acceptance Criteria

| AC | Criterion | Result | Evidence |
|----|-----------|--------|----------|
| AC-1 | Limiter enforces its configured tier budget | ✅ | `allows exactly the configured budget, then blocks` — 3 allowed with `consumedPoints` 1→3, 4th returns `success:false, isBlocked:true, remainingPoints:0` |
| AC-2 | Test fails if `useRedisPackage` is removed | ✅ | Fix reverted in `src/` → **9 of 15 failed**; restored → 15/15 pass |
| AC-3 | Genuine outage still fails open | ✅ | `fails open and reports a store outage` — `success:true, consumedPoints:0`, `result=store_error` |
| AC-4 | Misconfiguration reported distinctly | ✅ | `reports a client-contract failure as misconfiguration` — `result=store_misconfigured` + `actionRequired` |
| AC-5 | Runs in CI with no new infrastructure, no silent pass | ✅ | `rate-limit-service.test.ts` needs no Redis and carries AC-1/AC-2; interop file is additive |

## Test Results

```
npm test
  PASS tests/rate-limit/rate-limit-service.test.ts
  PASS tests/rate-limit/rate-limit-redis-interop.test.ts
  ... 9 pre-existing suites
  Test Suites: 11 passed, 11 total
  Tests:       142 passed, 142 total
```

15 new tests. Baseline was 127 across 9 suites — no pre-existing test changed or was disturbed.

The interop suite **executed rather than skipped** on this machine (local Redis reachable), so real
node-redis v5 ↔ `rate-limiter-flexible` v11 interop is confirmed, not merely assumed.

## Mutation Check — Does The Guard Actually Guard?

A passing test proves nothing unless it can fail. `useRedisPackage: true` was removed from
`src/services/core/rate-limit-service.ts`, the suite re-run, and the line restored:

| State | Result |
|-------|--------|
| Fix present | 15 passed |
| Fix removed (pre-bug-011 code) | **9 failed**, 6 passed |

Representative failure — the live-Redis suite proving the counter never reached Redis:

```
● shares the counter across service instances, as replicas do
    Expected: 2
    Received: 0
● writes the counter under the tier key prefix
    Expected: "1"
    Received: null
```

`Received: 0` / `null` is the bug-011 signature exactly: `consume()` threw, the service failed open,
and no `rl:*` key was ever written.

The 6 tests that still passed are correct to pass — the degradation cases (outage fail-open, null
client, not-ready client) and the `bug-011 reproduction` block are all independent of the flag.

`src/` was confirmed byte-identical afterwards (`useRedisPackage: true` back at line 82); the only
outstanding diff on that file is the original bug-011 fix.

## Leak Check

The first full run printed `A worker process has failed to exit gracefully`. Investigated rather
than assumed:

- new tests alone, with `--detectOpenHandles` → **no open handles reported**
- 9 pre-existing suites without the new tests → warning absent
- two further full runs including the new tests → warning absent, 142 passed both times

Non-reproducible across runs, so a worker-scheduling artifact rather than a leak introduced here.
Note `npm test` already carried `--forceExit` before this change, so teardown slack pre-dates it.

## Rules Compliance

| Rule | Status |
|------|--------|
| Layering (controller → service → repository) | ✅ untouched — test-only change |
| No production behavior change | ✅ `src/` unmodified except the pre-existing bug-011 fix |
| Tests colocated under `tests/<domain>/` | ✅ follows `tests/currency/`, `tests/money/`, `tests/seed/` |
| Relative imports (the `@/` alias maps to a non-existent `server/`) | ✅ relative imports used, matching existing suites |
| Determinism | ✅ tier budgets pinned via `RATE_LIMIT_*` env overrides, restored in `afterAll`; no reliance on default point values |
| Shared-state safety | ✅ interop suite namespaces keys per run (`RUN_ID`) and deletes only its own; never flushes |

## Deviations From Plan

None. Two test files, one npm script (`test:rate-limit`), and the two plan-doc updates from
`impact.md`.

## Known Gaps (Out Of Scope, Flagged)

1. **No CI runner.** `.github/workflows` does not exist in this repo, so these tests guard local
   `npm test` only. The guard has no effect on a merge until a workflow exists — worth its own change.
2. **Interop suite skips silently** when Redis is unreachable (it returns early rather than failing).
   Acceptable because the always-on suite carries AC-1/AC-2, but on a Redis-less machine the *real*
   client-version guard is inactive.
3. `jest.config.js` `moduleNameMapper` still points `^@/` at `<rootDir>/server/`, which does not
   exist. Pre-existing; all suites work around it with relative imports.
4. **Block-path untested.** Tiers with `blockDuration > 0` (`MERCHANT_SENSITIVE`) take a separate
   `_block` code path in the library. bug-011 did not involve it, and both tiers used here have
   `blockDuration: 0` deliberately, so that path remains uncovered.
5. **ESLint cannot run in this repo.** It ships an `.eslintrc.*` while ESLint v9 is installed, which
   requires `eslint.config.*`; the CLI exits with a migration notice. So these files were verified by
   `tsc --noEmit` (clean) only — no lint pass was performed, here or on any existing file.
   Pre-existing; fixing the ESLint config belongs in its own change.
