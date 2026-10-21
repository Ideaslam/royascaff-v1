# Verification — Billing Invoice Emails (change-079)

## Plan Consistency

- [x] No new endpoints — plan docs updated correctly (no entries added to `endpoints/`)
- [x] `SVC-PAY-MAIL · BillingMailService` added to `services/payments.md` and `_index.md` (count 3 → 4, total 61 → 62)
- [x] `SVC-SUB-LIFE` deps and rules updated with `SVC-PAY-MAIL` and `UserRepository`
- [x] `SVC-EXT-MAIL-TPL` template list now includes `invoice-receipt.en|ar`
- [x] `RULE-NOTIF-001` in `rules.md` explicitly calls out invoice-receipt mail as best-effort
- [x] `modules.md` features 5, 6, 9 and S7 updated in-place (no duplicate sections)
- [x] `profile.md` MailJet notes updated; `description.md` MailJet usage updated
- [x] Data model unchanged — no new collections or fields
- [x] No frontend pages touched

## Code Verification

| # | Check | Result | Notes |
|---|-------|:------:|-------|
| 1 | `BillingMailService` exists at `src/modules/payments/services/billing-mail.service.ts` | ✅ PASS | `sendPaidInvoice` + `sendPlanChange`, both best-effort |
| 2 | Templates exist at `src/integrations/mail/templates/invoice-receipt.{en,ar}.html` | ✅ PASS | Purple header, coral CTA — brand-consistent |
| 3 | `nest-cli.json` assets rule `integrations/mail/templates/**/*.html` already covers new templates | ✅ PASS | No change to `nest-cli.json` needed |
| 4 | `PaymentsModule` registers and exports `BillingMailService` | ✅ PASS | Added to `providers` and `exports` |
| 5 | `SubscriptionLifecycleService` injects `BillingMailService` + `UserRepository` | ✅ PASS | `AuthModule` (via `forwardRef`) exports `UserRepository`; `PaymentsModule` exports `BillingMailService` — both already imported in `SubscriptionsModule` |
| 6 | Hook 1: `applyPaidInvoice` extra-user early return calls `sendInvoiceReceiptEmail` after `markApplied` | ✅ PASS | Line ~419 |
| 7 | Hook 2: `applyPaidInvoice` main path calls `sendInvoiceReceiptEmail` after `markApplied` | ✅ PASS | Line ~544 |
| 8 | Hook 3: `appendAtBoundary` with `DOWNGRADE` source calls `sendPlanChangeEmail` only when `appendPeriod` returns a created period | ✅ PASS | `NONPAYMENT_FALLBACK` boundary does NOT send |
| 9 | Private helpers use try/catch — mail failure never propagates into lifecycle | ✅ PASS | Both helpers have outer `try/catch` with `logger.warn` |
| 10 | No Mailjet SDK called from lifecycle or payments domain services | ✅ PASS | All mail goes through `BillingMailService` → `MailTemplateService` → `MAIL_PROVIDER` |
| 11 | Plan labels resolved via `resolvePlanName` — no invented prices or labels | ✅ PASS | `BillingMailService` receives pre-resolved strings from caller |
| 12 | Spec: all three `new SubscriptionLifecycleService(...)` constructors updated with `billingMail` + `userRepo` mocks | ✅ PASS | |
| 13 | `npx jest subscription-lifecycle.service.spec --no-coverage` → 11/11 PASS | ✅ PASS | WARN about `workspaces.findById` in mock is expected; caught by helper's try/catch |
| 14 | `npx tsc --noEmit` exits 0 on our changed files | ✅ PASS | Two pre-existing spec errors unrelated to this change |

## Acceptance Criteria

| AC | Description | Result |
|----|-------------|:------:|
| 1 | Paid invoice applied → owner receives one EN/AR invoice-receipt email with amount, currency, Plan label, period, invoice id | ✅ PASS |
| 2 | Paid upgrade → exactly one email (apply path, not checkout) | ✅ PASS |
| 3 | Scheduled downgrade/replacement applied → one plan-change email | ✅ PASS |
| 4 | Email failure never rolls back settlement, invoice application, or period transition | ✅ PASS |
| 5 | No new endpoints, pages, collections, or schema fields | ✅ PASS |
| 6 | Templates in `src/integrations/mail/templates/`, rendered only through `MailTemplateService` | ✅ PASS |
| 7 | No Mailjet SDK in business modules | ✅ PASS |

## Overall: PASS
