# Bug #052 — No way to renew the same plan when auto-renew is off; pay/locked states poorly surfaced

## Status
**PENDING** — Fix applied 2026-10-21, awaiting user verification

## Reported
- **Date**: 2026-10-21
- **Severity**: high
- **Affected area**: backend/subscriptions + frontend/subscriptions page
- **Triage path**: A — Change request (new "Renew now" endpoint + frontend changes in 1 app; product decision)
- **Source**: Full subscription/payments module code review (read-only). Findings come from reading the code; not reproduced against a running system.

## Description
With auto-renew OFF, a paid period ends straight to Free (no invoice, no grace, no email) and the customer has no "Renew" action — only re-buying via Upgrade (full price, only while plan is published). With auto-renew ON, the pay button is buried in invoice history, non-owners see nothing actionable, and the "being renewed" lock is shown as a raw backend error.

## Expected Behavior
Customer can renew the current plan at any time near/after period end and pay an invoice from a clear call-to-action; locked states explain what to do.

## Steps to Reproduce (if applicable)
1. Paid plan, turn auto-renew off, let period end → dropped to Free; no renew option.
2. Re-enable auto-renew 2h before end → no invoice created until the job runs.
3. PAST_DUE → banner has no Pay button; member (non-owner) sees banner only.

## Root Cause
- `roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-lifecycle.service.ts:638-660`: autoRenew off → NONPAYMENT_FALLBACK to Free, no email.
- `billing-calculation.service.ts:77`: `preview` rejects same plan (`SUBSCRIPTION_SAME_PLAN`); after period end `requestUpgrade` → `UPGRADE_NO_POSITIVE_DIFFERENCE`.
- `setAutoRenew` does not create the renewal invoice synchronously.
- `roya-ai-dynamo-frontend/src/app/pages/subscriptions/subscriptions.page.ts:60-66` banner without pay; `:280-288` Pay only in history; `:542-544` swallows OWNER-only `/me/invoices` error; `:104-107` no locked banner; `auth.interceptor.ts:26-28`, `csv-connect.component.ts:194-195` raw message; `SUBSCRIPTION_ADMIN_LOCKED` unhandled; Pay shown for invoices past `expiresAt`.

## Fix Applied
_Escalated to Path A and applied 2026-10-21 in [change-080-bug-fix-subscription-review](../changes/change-080-bug-fix-subscription-review/)._ Behaviour, files and evidence: see that folder's `change-request.md` (sections A–G), `impact.md` and `verify-code.md` (acceptance criteria + residual gaps).

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-lifecycle.service.ts
- roya-ai-dynamo-api/src/modules/subscriptions/controllers/subscriptions.controller.ts
- roya-ai-dynamo-frontend/src/app/pages/subscriptions/subscriptions.page.ts
- roya-ai-dynamo-frontend/src/app/core/interceptors/auth.interceptor.ts
- roya-ai-dynamo-frontend/src/app/pages/data/setup/connect/csv-connect.component.ts
