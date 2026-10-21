# Bug #047 — Quota rollover bumps lifecycleVersion and breaks paid renewal/upgrade invoices

## Status
**PENDING** — Fix applied 2026-10-21, awaiting user verification

## Reported
- **Date**: 2026-10-21
- **Severity**: critical
- **Affected area**: backend/subscriptions (usage periods, lifecycle), payments
- **Triage path**: B — Direct fix (isolated to subscriptions repo); one-off reconcile of already-stuck paid invoices needs confirmation
- **Source**: Full subscription/payments module code review (read-only). Findings come from reading the code; not reproduced against a running system.

## Description
A customer who prepays a renewal (or pays an upgrade / free-to-paid invoice) can have the payment never applied, receive a second renewal invoice, and finally be dropped to Free after grace even though they paid.

## Expected Behavior
A paid invoice is always applied exactly once; a quota (usage) rollover never invalidates billing invoices.

## Steps to Reproduce (if applicable)
1. Paid monthly plan, autoRenew on. Renewal invoice created in the 24h lead window at `lifecycleVersion = v`.
2. Customer pays before the boundary (apply deferred because `targetPeriodStart` is in the future).
3. At the boundary the `due-transitions` job sets PAST_DUE, then `processDueUsageTransitions` appends a usage period → `lifecycleVersion = v+1`.
4. `apply-paid-invoice` throws `INVOICE_LIFECYCLE_VERSION_MISMATCH` on all attempts; next tick creates a new invoice with key `…:v{v+1}`.

## Root Cause
`roya-ai-dynamo-api/src/modules/subscriptions/repositories/subscription-usage-period.repository.ts:148` does `$inc: { lifecycleVersion: 1 }` on **every** usage-period append, including routine QUOTA_ROLLOVER. `applyPaidInvoice` (`subscription-lifecycle.service.ts:430`) requires an exact `lifecycleVersion` match, and `ensureRenewalInvoice` puts the version in the idempotency key (`:915`). A quota reset is not a commercial change but is treated as one. Free has two unaligned rollovers per month (access = fixed 30 days vs quota = monthly), making collisions frequent (see bug-055).

_Verified by reading the code (usage repo :140-150, lifecycle :430-435)._

## Fix Applied
_Applied 2026-10-21:_
- `subscriptions/repositories/subscription-usage-period.repository.ts` `append`: no `$inc lifecycleVersion` when `source === QUOTA_ROLLOVER` (optimistic guard on `currentUsagePeriodId` + version is kept).
- `subscriptions/repositories/subscription-period.repository.ts` `appendPeriod`: no `$inc lifecycleVersion` when `source === FREE_ROLLOVER` (same terms; guard on `currentPeriodId` kept).
- Renewal idempotency key still includes the version on purpose: genuine commercial changes (auto-renew toggle, plan change) supersede the old invoice and need a new key.

**Not done (needs your go-ahead):** data repair of invoices already stuck as PAID-but-unapplied with `INVOICE_LIFECYCLE_VERSION_MISMATCH`. After deploy these can be re-applied via admin `POST payments/invoices/:id/reconcile` once bug-049 is also deployed, provided their subscription version is realigned — a one-off script is required for that.

**Verification:** integration test `bug-047: prepaid renewal still applies after the boundary quota rollover` in `roya-ai-dynamo-api/test/subscription-due-transitions.e2e-spec.ts` (Docker mongo:7) passes; control run with the old `$inc` restored fails with `Paid invoice requires admin reconciliation`. Unit suites subscriptions+payments 48/48 pass.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- roya-ai-dynamo-api/src/modules/subscriptions/repositories/subscription-usage-period.repository.ts
- roya-ai-dynamo-api/src/modules/subscriptions/repositories/subscription-period.repository.ts
- roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-lifecycle.service.ts
- roya-ai-dynamo-api/test/subscription-due-transitions.e2e-spec.ts
