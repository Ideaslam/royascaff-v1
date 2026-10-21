# Bug #061 — CANCELLED rows renewed/reactivated; scheduled change bills with auto-renew off; orphan/legacy subscriptions

## Status
**PENDING** — Fix applied 2026-10-21, awaiting user verification

## Reported
- **Date**: 2026-10-21
- **Severity**: medium
- **Affected area**: backend/subscriptions, workspace
- **Triage path**: B — Direct fix (subscriptions); workspace-delete part touches workspace module (may escalate)
- **Source**: Full subscription/payments module code review (read-only). Findings come from reading the code; not reproduced against a running system.

## Description
Leftover CANCELLED subscriptions are billed or silently reactivated by the due job; a scheduled paid downgrade/replacement bills even after auto-renew is turned off; deleted workspaces keep active subscriptions cycling; legacy `activateFromPayment` creates subscriptions without periods (locked forever).

## Expected Behavior
Only live, renewing subscriptions are billed; every subscription has a valid period.

## Steps to Reproduce (if applicable)
1. CANCELLED row with autoRenew true → renewal invoice + PAST_DUE.
2. Schedule paid downgrade, turn auto-renew off → invoice + PAST_DUE at boundary.

## Root Cause
- `roya-ai-dynamo-api/src/modules/subscriptions/repositories/subscription.repository.ts:829` includes CANCELLED; lifecycle `:612-690`.
- lifecycle `:641-647` (`!scheduled` exempts), `:678`; `setAutoRenew(false)` keeps schedule.
- `workspace/services/workspace.service.ts:176-213` delete leaves subscription ACTIVE.
- `subscriptions.service.ts:266-333`, repo `:449-480` create subscription without `currentPeriodId`.

## Fix Applied
_Applied 2026-10-21:_
- `subscription-lifecycle.service.ts` `processDueTransitions`: `renews = sub.autoRenew && status !== CANCELLED`. Lead-window invoices and the boundary renewal both require `renews`; with `renews` false a paid subscription falls back at the boundary (scheduled paid changes no longer bill a customer who turned auto-renew off; CANCELLED rows are never billed). Source is `DOWNGRADE` only when the scheduled target itself is applied, otherwise `NONPAYMENT_FALLBACK`.
- `subscriptions.service.ts`:
  - `getMySubscription`: if the subscription has no `currentPeriodId`/`currentUsagePeriodId`, calls the idempotent `provisionFree` to backfill (legacy rows locked "being renewed" forever).
  - `activateFromPayment`: provisions the access period when the upserted subscription has none.
  - new `closeForDeletedWorkspace(workspaceId)`: sets INACTIVE, autoRenew off, clears grace/schedule, supersedes open renewal invoices.
- `workspace/services/workspace.service.ts`: `deleteWorkspace` and `adminDeleteWorkspace` call `closeForDeletedWorkspace` (dependency already injected).

**Verification:** integration tests `bug-061: a CANCELLED paid subscription is not billed…` and `bug-061: a scheduled paid change does not bill when auto-renew is off` pass; control run with the old condition fails both. Unit suites subscriptions+payments+workspace 53/53 pass. Legacy-period backfill and workspace delete are covered by code review only (not by an automated test).

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- roya-ai-dynamo-api/src/modules/subscriptions/repositories/subscription.repository.ts
- roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-lifecycle.service.ts
- roya-ai-dynamo-api/src/modules/subscriptions/services/subscriptions.service.ts
- roya-ai-dynamo-api/src/modules/workspace/services/workspace.service.ts
- roya-ai-dynamo-api/src/modules/workspace/services/workspace.service.ts
- roya-ai-dynamo-api/test/subscription-due-transitions.e2e-spec.ts
