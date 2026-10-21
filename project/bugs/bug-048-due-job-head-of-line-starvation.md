# Bug #048 — Lifecycle jobs starve behind PAST_DUE and broken rows (limit 100) — users stay locked

## Status
**PENDING** — Fix applied 2026-10-21, awaiting user confirmation

## Reported
- **Date**: 2026-10-21
- **Severity**: critical
- **Affected area**: backend/subscriptions (due query, lifecycle processor)
- **Triage path**: B — Direct fix (subscriptions module only)
- **Source**: Full subscription/payments module code review (read-only). Findings come from reading the code; not reproduced against a running system.

## Description
The due-transitions job only takes 100 subscriptions per tick. Rows that match every tick (PAST_DUE in grace, permanently skipped/failing rows) always sort first, so newly-ended ACTIVE subscriptions are never reached and stay locked with "Workspace entitlement is being renewed". The same pattern exists for usage rollovers, and one exception aborts the whole processor job.

## Expected Behavior
Every due subscription / usage period is processed within ~1 minute regardless of how many other rows are broken or in grace.

## Steps to Reproduce (if applicable)
1. ≥100 subscriptions are PAST_DUE in their 7-day grace (or have a missing period/plan/package).
2. Another workspace's period ends.
3. It is never picked up → locked indefinitely.

## Root Cause
- `roya-ai-dynamo-api/src/modules/subscriptions/repositories/subscription.repository.ts:817-845`: `currentPeriodEnd <= now` also matches PAST_DUE rows for the whole grace period; `limit(100)`, no paging, no backoff. Bug-046 added `sort({currentPeriodEnd:1})`, which makes these oldest rows the permanent head.
- `subscription-lifecycle.service.ts:702-757` (`processDueUsageTransitions`): no per-item try/catch; `continue` paths leave rows due forever.
- `processors/subscription-lifecycle.processor.ts:24-32`: steps run sequentially without isolation; one throw skips retirements/notifications.
- `reconcile-paid-invoices` loop (`processor:42-47`, `billing-invoice.repository.ts:128-133`): unsorted limit 100, re-enqueues future-dated prepaid renewals every 5 min, no per-item try/catch.

_Verified: due query and PAST_DUE re-match read directly._

## Fix Applied
_Applied 2026-10-21 (confirmed by user before implementation):_

1. **`subscription.repository.ts` → `listDueSubscriptions(now, renewalLeadMs, limit, afterId?)`**
   - `currentPeriodEnd <= now`, `scheduledChangeAt <= now` and the lead-window clause apply only to `ACTIVE`/`CANCELLED`.
   - `PAST_DUE` is due only when `graceEndsAt <= now` (the generic `graceEndsAt <= now` clause is kept for all statuses).
   - Keyset paging: optional `afterId` → `_id > afterId`, sort `{ _id: 1 }`.
2. **`subscription-usage-period.repository.ts` → `listDue(now, limit, afterId?)`**: same keyset paging (`_id > afterId`, sort `{ _id: 1 }`).
3. **`subscription-lifecycle.service.ts`**
   - `processDueTransitions`: page through all due subscriptions (100 per page, safety cap 50 pages) instead of one batch of 100.
   - `processDueUsageTransitions`: same paging + per-item try/catch with `logger.error`; warn logs on the silent `continue` paths.
4. **`subscription-lifecycle.processor.ts`**: each step of `due-transitions` in its own try/catch (logged), so one failing step doesn't skip the rest; per-item try/catch in `reconcile-paid-invoices`.
5. **`billing-invoice.repository.ts` → `listPaidUnapplied`**: exclude RENEWAL invoices whose `targetPeriodStart > now` (prepaid, not yet applicable), sort `{ paidAt: 1, _id: 1 }`.

Verification run: subscriptions + payments Jest suites 8/8 passed (48 tests); no tsc/ESLint errors in changed code (pre-existing errors in unrelated spec files untouched).

Not included (kept minimal): `nextLifecycleAttemptAt` backoff field (schema change) and closing orphaned usage periods — keyset paging already prevents them from blocking others.

Behaviour note: PAST_DUE subscriptions in grace are no longer re-processed every minute. That repeat only re-ran `ensureRenewalInvoice` (idempotent) and re-delivered paid invoices; paid delivery is still covered by `reconcile-paid-invoices` every 5 minutes.

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
- roya-ai-dynamo-api/src/modules/subscriptions/repositories/subscription.repository.ts
- roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-lifecycle.service.ts
- roya-ai-dynamo-api/src/modules/subscriptions/processors/subscription-lifecycle.processor.ts
- roya-ai-dynamo-api/src/modules/payments/repositories/billing-invoice.repository.ts
- roya-ai-dynamo-api/src/modules/subscriptions/repositories/subscription-usage-period.repository.ts
- roya-ai-dynamo-api/test/subscription-due-transitions.e2e-spec.ts
