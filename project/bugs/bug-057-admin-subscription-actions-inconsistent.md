# Bug #057 — Admin activate/deactivate/update leave subscriptions locked or bypass the lifecycle

## Status
**PENDING** — Fix applied 2026-10-21, awaiting user verification

## Reported
- **Date**: 2026-10-21
- **Severity**: high
- **Affected area**: backend/subscriptions (admin), frontend-admin/subscriptions
- **Triage path**: A — Change request (API + admin frontend)
- **Source**: Full subscription/payments module code review (read-only). Findings come from reading the code; not reproduced against a running system.

## Description
Admin "Activate" on past_due/expired locks the workspace; paying a renewal undoes an admin deactivation; legacy `PUT /subscriptions/:id {planId, paid}` writes audit/payments without changing anything; several DTO fields are accepted and ignored.

## Expected Behavior
Admin actions have predictable, lifecycle-consistent effects.

## Steps to Reproduce (if applicable)
1. Admin clicks Activate on a past_due subscription → status ACTIVE with ended period → "being renewed" lock; job flips it back.
2. Admin deactivates; owner pays open renewal → ACTIVE again.

## Root Cause
- `roya-ai-dynamo-api/src/modules/subscriptions/services/subscriptions.service.ts:335-357` activate only sets ACTIVE; `:359-378` deactivate doesn't bump version or supersede invoices; `payment-checkout.service.ts:67-85` doesn't check INACTIVE; `subscription-period.repository.ts:~165` sets ACTIVE.
- Admin page `roya-ai-dynamo-frontend-admin/src/app/pages/admin/subscriptions/subscriptions.page.ts:251-259` shows Activate for any non-active.
- `subscriptions.service.ts:431-447,567-634` legacy plan change path; `dto/subscription.dto.ts:115,121-140` ignored fields (`effective`, `startDate`, `status`, `endDate`).

## Fix Applied
_Escalated to Path A and applied 2026-10-21 in [change-080-bug-fix-subscription-review](../changes/change-080-bug-fix-subscription-review/)._ Behaviour, files and evidence: see that folder's `change-request.md` (sections A–G), `impact.md` and `verify-code.md` (acceptance criteria + residual gaps).

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- roya-ai-dynamo-api/src/modules/subscriptions/services/subscriptions.service.ts
- roya-ai-dynamo-api/src/modules/subscriptions/dto/subscription.dto.ts
- roya-ai-dynamo-api/src/modules/payments/services/payment-checkout.service.ts
- roya-ai-dynamo-frontend-admin/src/app/pages/admin/subscriptions/subscriptions.page.ts
