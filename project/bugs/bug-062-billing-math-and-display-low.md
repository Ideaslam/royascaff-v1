# Bug #062 — Low-severity billing math and display issues

## Status
**PENDING** — Fix applied 2026-10-21, awaiting user verification

## Reported
- **Date**: 2026-10-21
- **Severity**: low
- **Affected area**: backend/subscriptions (billing calc), frontend/subscriptions page
- **Triage path**: B — Direct fix (each item isolated)
- **Source**: Full subscription/payments module code review (read-only). Findings come from reading the code; not reproduced against a running system.

## Description
Collection of low-severity issues found in the review.

## Expected Behavior
Accurate period dates and readable labels.

## Steps to Reproduce (if applicable)
See items below.

## Root Cause
1. FREE_TO_PAID period starts at invoice creation, not payment — up to 24h lost (`roya-ai-dynamo-api/src/modules/subscriptions/services/billing-calculation.service.ts:121-131`, lifecycle :480-525).
2. Month-end anchor drift Jan 31 → Feb 28 → Mar 28 permanently (`billing-calculation.service.ts:32-44,55-65`) — fix needs an anchor-day schema field.
3. Customer page shows raw enum `past_due` and `Free_to_paid` (`roya-ai-dynamo-frontend/src/app/pages/subscriptions/subscriptions.page.ts:105,265`).
4. Dead code: `SubscriptionPeriodRolloverProcessor` / `repo.processPeriodRollovers` not registered — risk of re-enabling old logic.
5. `incrementSyncedRows` failing at grace expiry throws LIMIT_EXCEEDED ("upgrade") instead of LOCKED (`subscription-limit.service.ts:186-209`).

## Fix Applied
_Applied 2026-10-21:_
1. **FREE_TO_PAID start** — `subscription-lifecycle.service.ts` `applyPaidInvoice`: if paid after the quoted `targetPeriodStart`, the paid period starts at `paidAt` and its end is recomputed with `addInterval`. Renewals keep the billing anchor.
2. **Month-end anchor drift** — _not fixed_: needs a new `billingAnchorDay` field on the subscription (schema change → would need a change request).
3. **Raw labels** — `roya-ai-dynamo-frontend/src/app/pages/subscriptions/subscriptions.page.ts`: subscription status, invoice status and invoice action now go through `translate`; new keys `SUBSCRIPTIONS.STATUS_LABEL.*`, `SUBSCRIPTIONS.INVOICE_STATUS.*`, `SUBSCRIPTIONS.INVOICE_ACTION.*` in `public/i18n/en.json` and `ar.json`.
4. **Dead code** — deleted `subscriptions/processors/subscription-period-rollover.processor.ts` (never registered) and `SubscriptionRepository.processPeriodRollovers()` (old rollover that marks subscriptions expired).
5. **Lock vs limit code** — `subscription-limit.service.ts` `incrementSyncedRows`: when the subscription is locked, calls `assertResourceUnlocked` first so the error is `SUBSCRIPTION_LOCKED`, not "limit reached, upgrade".

**Verification:** full API unit run 17 suites / 91 tests pass; API integration tests 11/11 pass; frontend `ng build --configuration development` succeeds. Items 1 and 5 are covered by code review only (no dedicated automated test).

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- roya-ai-dynamo-api/src/modules/subscriptions/services/billing-calculation.service.ts
- roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-limit.service.ts
- roya-ai-dynamo-frontend/src/app/pages/subscriptions/subscriptions.page.ts
- roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-lifecycle.service.ts
- roya-ai-dynamo-api/src/modules/subscriptions/repositories/subscription.repository.ts
- roya-ai-dynamo-api/src/modules/subscriptions/processors/subscription-period-rollover.processor.ts (deleted)
- roya-ai-dynamo-frontend/public/i18n/en.json
- roya-ai-dynamo-frontend/public/i18n/ar.json
