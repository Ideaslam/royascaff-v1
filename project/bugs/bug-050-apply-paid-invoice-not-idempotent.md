# Bug #050 — applyPaidInvoice is multi-step/non-idempotent; unguarded PAST_DUE write can overwrite a paid renewal

## Status
**PENDING** — Fix applied 2026-10-21, awaiting user verification

## Reported
- **Date**: 2026-10-21
- **Severity**: high
- **Affected area**: backend/subscriptions (lifecycle)
- **Triage path**: B — Direct fix (subscriptions module only)
- **Source**: Full subscription/payments module code review (read-only). Findings come from reading the code; not reproduced against a running system.

## Description
Partial failures in `applyPaidInvoice` leave subscriptions half-applied (usage on new package, plan on old; access granted but invoice never marked applied), and every retry fails the version check. Separately, the boundary tick writes PAST_DUE without a guard and even when the renewal is already paid.

## Expected Behavior
Applying a paid invoice is resumable and atomic; a paid customer is never marked PAST_DUE or dropped to Free.

## Steps to Reproduce (if applicable)
1. Prepaid renewal: at the boundary `ensureRenewalInvoice` returns the PAID invoice but the code still sets PAST_DUE + `graceEndsAt` (lifecycle :676-689).
2. If apply then fails (bug-047), customer falls to Free at grace end.
3. With >1 worker/pod, `setCurrentPeriod` (repo :699) can overwrite a just-applied ACTIVE renewal to PAST_DUE.

## Root Cause
- `roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-lifecycle.service.ts:444-541`: several sequential writes, the first of which bumps the version; no resume detection.
- `:676-689`: PAST_DUE written before checking `invoice.status === PAID`.
- `subscription.repository.ts:699` `setCurrentPeriod`: no `currentPeriodId`/`lifecycleVersion` filter.

## Fix Applied
_Applied 2026-10-21:_
- `subscription-lifecycle.service.ts` `applyPaidInvoice`: reads the current access + usage periods first; if either already carries this invoice's `sourceInvoiceId`, the version check is skipped and only the missing steps run (UPGRADE: usage swap / plan switch; RENEWAL & FREE_TO_PAID: access append / usage append). A crash between steps, or before `markApplied`, is now resumable.
- `processDueTransitions` boundary: if the renewal invoice is already PAID it is applied immediately; PAST_DUE + grace is only the fallback if that apply throws (logged as warning).
- `subscription.repository.ts` `setCurrentPeriod(id, data, guard)`: optional guard filter; the PAST_DUE write is now conditional on `{ currentPeriodId, lifecycleVersion }` so it cannot overwrite a concurrent renewal.
- Unit spec updated for the new guard argument.

Not done: Mongo transaction wrapping (resume-by-`sourceInvoiceId` used instead).

**Verification:** integration tests in `roya-ai-dynamo-api/test/subscription-due-transitions.e2e-spec.ts`:
- `bug-050: prepaid renewal is applied at the boundary, never marked PAST_DUE` — pass.
- `bug-050: an interrupted apply (access written, invoice not marked) resumes` — pass; control run without resume logic fails with `Paid invoice requires admin reconciliation`.
Unit suites subscriptions+payments 48/48 pass.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-lifecycle.service.ts
- roya-ai-dynamo-api/src/modules/subscriptions/repositories/subscription.repository.ts
- roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-lifecycle.service.spec.ts
- roya-ai-dynamo-api/test/subscription-due-transitions.e2e-spec.ts
