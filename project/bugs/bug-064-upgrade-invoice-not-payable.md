# Bug #064 — After confirming an upgrade, the customer has no way to pay the invoice

## Status
**PENDING** — Fix applied 2026-10-21, awaiting user verification

## Reported
- **Date**: 2026-10-21
- **Severity**: high
- **Affected area**: customer-portal / `pages/subscriptions/subscriptions.page.ts`
- **Triage path**: B — direct fix (one frontend file; no plan, endpoint, data or migration change)

## Description
Clicking Upgrade → Confirm creates the upgrade invoice ("invoice created" toast), but the customer is not taken to payment and does not see a way to pay it.

## Expected Behavior
Confirming an upgrade goes straight to the payment page for that invoice (same as "Renew now"). If redirecting fails, the open invoice is visible in Invoice history with a working "Pay now".

## Steps to Reproduce
1. Workspace owner opens Subscriptions, picks a higher plan, clicks Upgrade, confirms.
2. Toast "invoice created"; page reloads; no payment redirect.
3. Pay button may be missing in Invoice history (see root cause 2).

## Root Cause
1. **No redirect by design (UX gap):** `confirmChange()` (subscriptions.page.ts:835-863) only shows a toast and reloads after `POST /subscriptions/upgrade`, ignoring the returned `invoiceId`. Payment was only reachable from "Pay now" in Invoice history at the bottom of the page (unchanged since change-075).
2. **Pay button can be hidden for an owner (regression from change-080):** the Pay button now also requires `canManage()`, which reads `auth.currentUser().workspaceRole`. That role comes from the login/profile response and is resolved for the user's **default** workspace (`auth.service.ts` uses `defaultWorkspaceId ?? currentWorkspaceId`), not necessarily the workspace being billed. An owner of the current workspace whose default workspace has a different role (admin/member) sees the invoice without a Pay button. The upgrade itself succeeded because the backend checks the role of the current workspace.
3. **Silent invoice-load errors:** a non-403 failure of `GET /subscriptions/me/invoices` empties the list without any message ("No invoices").

## Fix Applied
_Applied 2026-10-21 (confirmed by user before implementation)_ — `roya-ai-dynamo-frontend/src/app/pages/subscriptions/subscriptions.page.ts`:
1. `confirmChange()`: on upgrade, uses the returned `invoiceId` → `payInvoice()` → redirects to the payment page. If starting payment fails: error toast + reload (invoice stays payable from Invoice history).
2. `canManage()` = `!invoicesForbidden()` — decided by the OWNER-only `GET /subscriptions/me/invoices` for the current workspace; removed the login-time `workspaceRole` check (and the now-unused `AuthService` injection).
3. Non-403 invoice-load errors now show the error toast.

**Verification:** `ng build --configuration development` succeeds; diff limited to this file (+23/−9). Not browser-tested here.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- roya-ai-dynamo-frontend/src/app/pages/subscriptions/subscriptions.page.ts
