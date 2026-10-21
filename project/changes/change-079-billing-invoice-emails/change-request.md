# Change Request

## Metadata
- **date**: 2026-09-03
- **change-type**: modify-feature
- **target-app**: backend
- **affected-repos**: backend
- **priority**: medium

## Scope
- Module(s): Subscriptions (10), Payments (16), Email (S7)
- Feature(s): Immediate Upgrade After Payment; Scheduled Downgrade and Same-Tier Replacement; Immutable Billing Ledger; Transactional Email Service
- Endpoint(s): none (no new or modified HTTP surface)
- Page(s)/View(s): none
- Service(s): SVC-SUB-LIFE (hook after apply), new SVC-PAY-MAIL `BillingMailService`, SVC-EXT-MAIL-TPL (new invoice template pair)

## Description

### Problem
Clients receive no invoice or receipt email after they pay, upgrade, or have a scheduled downgrade applied. Billing is already recorded on immutable invoices, but the workspace owner is not notified by email.

### Who is affected
- Workspace **owners** (recipient of billing emails; language from `languagePreference`)
- Backend billing lifecycle only
- **Not affected**: customer-portal or admin-panel UI, checkout HTTP APIs, retirement emails (already exist)

### Desired behavior

Send a branded HTML **invoice / receipt** email for two important, already-durable events — one email per event, never two for the same payment:

1. **Paid invoice applied** (`SubscriptionLifecycleService.applyPaidInvoice` after `markApplied`)
   - Covers: free-to-paid, immediate upgrade, renewal, extra-user, admin-adjustment
   - Upgrade + payment stay a single email (upgrade entitlement is applied in the same `applyPaidInvoice` path)
   - Body is an invoice: invoice id, action label, amount + currency, from/to Plan labels (via `resolvePlanName`), billing period, workspace name, CTA to `/app/subscriptions`

2. **Scheduled downgrade / replacement applied** (`appendAtBoundary` when `source === DOWNGRADE`)
   - Period-end transition the owner already scheduled
   - Same invoice-style template; amount shown as `0.00` when no charge
   - Headline/subject distinguish “plan changed” from “payment received”

Recipient is the **workspace owner**. Send is **best-effort**: log and continue; never fail settlement, entitlement apply, or the lifecycle job. `applyPaidInvoice` already returns early when `appliedAt` is set, so a successful apply sends at most once. Downgrade send is only when `appendPeriod` actually creates the new period (CAS already prevents duplicates).

### Events chosen (and why)

| Event | Send? | Why |
|-------|:-----:|-----|
| Paid invoice applied (incl. upgrade, renewal, extra-user) | Yes | Money moved and entitlement changed |
| Scheduled downgrade / replacement applied | Yes | Plan actually changed; owner asked for this |
| Downgrade merely scheduled | No | Owner already confirmed in-app; no invoice yet |
| Payment failed / cancelled / expired | No | Not an invoice; checkout UI already shows this |
| Grace / non-payment fallback to Free | No | Not a customer invoice; avoid surprise mail |
| Plan retirement notice | No | Already durable in Notifications |
| Refund / chargeback | No | Out of scope |

### Out of scope
- New HTTP endpoints or frontend pages
- PDF attachments or generated invoice files
- New data-model fields or durable email retry ledger
- In-app notification rows for these events
- Changing PayUp checkout, settlement, or lifecycle rules
- Password-reset / invite / verification / welcome / retirement emails

### Constraints
- Reuse `MailTemplateService` + `MAIL_PROVIDER` — no Mailjet SDK in business modules
- One new branded template pair: `invoice-receipt.en.html` + `invoice-receipt.ar.html` (same visual language as welcome/verification: purple header, coral CTA)
- Plan labels through existing `resolvePlanName` (EN/AR)
- Amounts formatted from the invoice snapshot; never invent prices
- Keep lifecycle code clean: a small `BillingMailService` owns render + send; lifecycle only calls it after a successful apply/transition
- No new collections, fields, queues, or endpoints

### Data model changes
None.

### Permissions
No new auth surface. Emails are a system side-effect of existing owner/admin billing actions and the lifecycle worker. Invoice ids and Plan names only — no payment-provider secrets, tokens, or raw payloads.

### Edge cases
- Missing owner or owner email: skip send, log warning
- Mail provider failure: warn-log; entitlement stays applied
- Replay of `applyPaidInvoice`: early return when already applied — no second email
- Extra-user invoice: still send the owner the receipt; invitee email remains the existing invitation mail
- Locale fallback: non-`ar` → English template

## Acceptance Criteria
1. After a paid invoice is applied (free-to-paid, upgrade, renewal, or extra-user), the workspace owner receives one EN or AR invoice-receipt email with amount, currency, Plan label(s), period, and invoice id.
2. A paid upgrade produces **one** email, not a separate payment email plus a separate upgrade email.
3. When a scheduled downgrade or same-tier replacement is applied at period end, the workspace owner receives one invoice-style plan-change email.
4. Email failure never rolls back payment settlement, invoice application, or period transition.
5. No new endpoints, pages, collections, or schema fields are added.
6. Templates live in `src/integrations/mail/templates/` and are rendered only through `MailTemplateService`.
7. Lifecycle / payment services do not call the Mailjet SDK directly.

## Notes
- Fast-Track rejected: touches Subscriptions + Payments + Email (more than one module).
- Numbered **079** because `078` is already used by notification tenant isolation.
- Code hook points already exist and are idempotent: `applyPaidInvoice` + `appendAtBoundary(DOWNGRADE)`.
