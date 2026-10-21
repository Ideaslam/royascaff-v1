# Bug #046 — "Workspace entitlement is being renewed" blocks all actions

## Status
**PENDING** — Fix in progress, awaiting confirmation

## Reported
- **Date**: 2026-10-21
- **Severity**: critical
- **Affected area**: backend/subscriptions (`subscription-limit.service.ts`, `subscription-lifecycle.service.ts`)

## Description
Every protected action in the app fails with `403 SUBSCRIPTION_LOCKED` — "Workspace entitlement is being renewed. Please retry shortly." The message never clears, so the workspace is unusable.

## Expected Behavior
When a billing/access period ends, the `due-transitions` job (every 60s) rolls the subscription into its next period (free rollover, downgrade, or PAST_DUE with grace), and the user is never blocked for more than ~1 minute.

## Steps to Reproduce (if applicable)
1. Workspace subscription is `ACTIVE` and its current `subscriptionperiods.endsAt` is in the past.
2. Perform any guarded action (create dashboard, upload, sync…).
3. `SubscriptionLimitService.assertResourceUnlocked` throws the "being renewed" error.

## Root Cause
`assertResourceUnlocked` (subscription-limit.service.ts:51-61) throws this message when the subscription is `ACTIVE` but its current period is missing or `endsAt <= now`. It is designed as a transient state that `SubscriptionLifecycleService.processDueTransitions` (subscription-lifecycle.service.ts:558) clears within a minute. The state becomes **permanent** because that job can stop advancing subscriptions without any signal:

1. **One bad subscription aborts the whole batch.** The loop has no per-item error handling. `ensureRenewalInvoice` / `requirePackage` throw `ConflictException` (`SUBSCRIPTION_PLAN_RETIRED`, `SUBSCRIPTION_PACKAGE_MISSING`) on catalog inconsistencies (likely after change-076/077 package/plan versioning). The exception fails the BullMQ job, and every subscription after it in the batch is never processed. `listDueSubscriptions` has no sort, so the same failing doc comes first every minute.
2. **Silent skips.** `if (!period) continue;`, `if (!current) continue;` and `if (!free) continue;` skip with no log. If no plan matches `{isActive, isPublished, isDefaultFree}`, **every** subscription is skipped forever.
3. Skipped/failed subs remain "due", occupying the 100-item `limit`, which can starve healthy subscriptions.

Operational precondition (not a code bug): the BullMQ worker must be running against the configured Redis; if the API runs without it, nothing rolls over either.

## Fix Applied
In `processDueTransitions`:
- Wrap each subscription's processing in `try/catch`; log `workspaceId` + error and continue with the next subscription.
- Replace silent `continue`s with `logger.warn` (missing period, missing plan, **no active default free plan**).
- Sort due subscriptions by `currentPeriodEnd` ascending (`_id` tiebreak) in `listDueSubscriptions` so ordering is deterministic. _(Superseded by bug-048: now `_id` keyset paging.)_

Verification run 2026-10-21: subscriptions Jest suites 7/7 passed (40 tests); no tsc or ESLint errors in the changed lines (pre-existing errors elsewhere untouched).

**Follow-up (review 2026-10-21):** PAST_DUE subscriptions in grace still match `currentPeriodEnd <= now`, so with the new ascending sort they occupy the head of the 100-item batch for 7 days. The query/paging fix is tracked in [bug-048](./bug-048-due-job-head-of-line-starvation.md) and should ship together with this fix.

Data: after deploy, the logs will name the exact workspaces/plans needing catalog repair (e.g. publish/activate the default Free plan or re-link the missing package). That repair is data-only and is done after confirmation.

**Integration test (2026-10-21, Docker `mongo:7` on 127.0.0.1:27018):** `roya-ai-dynamo-api/test/subscription-due-transitions.e2e-spec.ts` — real lifecycle service + repositories, seeded default Free plan. 4/4 pass:
1. Ended period reproduces `"Workspace entitlement is being renewed"`.
2. 120 PAST_DUE-in-grace rows + 1 row that throws (missing package) + 1 healthy ended workspace → healthy workspace rolled over and unlocked; broken row logged and skipped; PAST_DUE rows untouched and still usable.
3. PAST_DUE in grace is not selected as due; PAST_DUE after grace is.
4. Usage (quota) rollover advances a healthy workspace past a failing row.
Control run with the old due query temporarily restored: tests 2 and 3 fail (PAST_DUE-in-grace rows re-selected and rewritten). Fix restored and re-verified green.
Run: `MONGO_TEST_URI=mongodb://127.0.0.1:27018/roya-dynamo-it npm run test:e2e -- subscription-due-transitions`

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-lifecycle.service.ts
- roya-ai-dynamo-api/src/modules/subscriptions/repositories/subscription.repository.ts
- roya-ai-dynamo-api/test/subscription-due-transitions.e2e-spec.ts
