# Bug #059 — Voided/refunded invoices block renewal or keep entitlement; extra-user invoice failures

## Status
**PENDING** — Fix applied 2026-10-21, awaiting user verification

## Reported
- **Date**: 2026-10-21
- **Severity**: medium
- **Affected area**: backend/payments, subscriptions, workspace
- **Triage path**: A — Change request (payments + subscriptions + workspace; refund policy decision)
- **Source**: Full subscription/payments module code review (read-only). Findings come from reading the code; not reproduced against a running system.

## Description
A voided/refunded renewal invoice is returned forever by `createOrGet`, leaving the subscription PAST_DUE with nothing payable. Refunds and chargebacks never change entitlement or auto-renew. Revoking an invite leaves its extra-user invoice payable; an invite-email failure makes the apply job fail and re-send emails.

## Expected Behavior
Void/refund have defined lifecycle effects; extra-user invoices follow the invitation state.

## Steps to Reproduce (if applicable)
1. Admin voids open renewal → PAST_DUE, no payable invoice → Free after grace.
2. Revoke invite, owner pays → apply throws "no longer actionable", money captured.

## Root Cause
- `roya-ai-dynamo-api/src/modules/payments/repositories/billing-invoice.repository.ts:19-35`; `subscriptions/services/subscription-lifecycle.service.ts:678-690,895-915`.
- `payments/services/billing-invoice.service.ts:177-215` refund/chargeback = status + audit only.
- `workspace/services/workspace-invitation.service.ts:224-230` revoke doesn't void; lifecycle `:1030-1064` `mail.send` uncaught.

## Fix Applied
_Escalated to Path A and applied 2026-10-21 in [change-080-bug-fix-subscription-review](../changes/change-080-bug-fix-subscription-review/)._ Behaviour, files and evidence: see that folder's `change-request.md` (sections A–G), `impact.md` and `verify-code.md` (acceptance criteria + residual gaps).

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-lifecycle.service.ts
- roya-ai-dynamo-api/src/modules/payments/services/billing-invoice.service.ts
- roya-ai-dynamo-api/src/modules/workspace/services/workspace-invitation.service.ts
