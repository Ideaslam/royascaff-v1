# Bug #049 — Failed apply-paid-invoice jobs are never re-delivered

## Status
**PENDING** — Fix applied 2026-10-21, awaiting user verification

## Reported
- **Date**: 2026-10-21
- **Severity**: high
- **Affected area**: backend/payments (billing-invoice.service)
- **Triage path**: B — Direct fix (payments module only)
- **Source**: Full subscription/payments module code review (read-only). Findings come from reading the code; not reproduced against a running system.

## Description
Once an `apply-paid-invoice` job exhausts its attempts, reconciliation (every 5 min) and the admin `POST payments/invoices/:id/reconcile` silently do nothing; the paid invoice stays unapplied forever.

## Expected Behavior
Reconciliation and admin reconcile re-run failed apply jobs.

## Steps to Reproduce (if applicable)
1. Any transient failure makes the apply job fail 10 times (e.g. bug-047).
2. Fix the underlying cause.
3. Reconcile runs → nothing happens.

## Root Cause
`roya-ai-dynamo-api/src/modules/payments/services/billing-invoice.service.ts:133-144` adds the job with a fixed `jobId: invoice-${id}`, `removeOnComplete` only, no `removeOnFail`. BullMQ ignores `add()` when a job with that id already exists (in failed state).

## Fix Applied
_Applied 2026-10-21:_
- `payments/services/billing-invoice.service.ts` `ensureLifecycleDelivery`: looks up the existing `invoice-<id>` job; if it is in the `failed` state it calls `job.retry('failed')` instead of `add()` (which BullMQ silently ignores for an existing id). Otherwise behaviour is unchanged.
- Covers `reconcile-paid-invoices` (every 5 min), admin `POST payments/invoices/:id/reconcile`, and the boundary re-delivery in `processDueTransitions`.

**Verification:** `roya-ai-dynamo-api/test/billing-invoice-delivery.e2e-spec.ts` against a disposable Redis (`redis:7-alpine` on 127.0.0.1:6390): a job that failed is re-delivered and completes. Control run with the old behaviour: the job stays failed (`Error: transient`). Unit suites subscriptions+payments 48/48 pass.
Run: `REDIS_TEST_URL=redis://127.0.0.1:6390 npm run test:e2e -- billing-invoice-delivery`

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- roya-ai-dynamo-api/src/modules/payments/services/billing-invoice.service.ts
- roya-ai-dynamo-api/test/billing-invoice-delivery.e2e-spec.ts
