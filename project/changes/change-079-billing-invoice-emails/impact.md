# Impact Analysis — Billing Invoice Emails (change-079)

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | complete | `billing-invoice.schema.ts`, `user-subscription.schema.ts`, `subscription-period.schema.ts`, `workspace.schema.ts` (`ownerId`) | No new fields needed; invoice already has amount, currency, action, snapshots, period, `appliedAt` |
| Service — lifecycle | complete | `subscriptions/services/subscription-lifecycle.service.ts` | `applyPaidInvoice` applies entitlement then `markApplied` (incl. extra-user early return); `appendAtBoundary` applies scheduled `DOWNGRADE`; no owner invoice email |
| Service — mail | complete | `integrations/mail/mail-template.service.ts`, `MAIL_PROVIDER` (global) | Templates exist for verification + welcome only; no invoice template |
| Service — billing mail | none | — | No dedicated invoice-mail helper; lifecycle already injects raw `MAIL_PROVIDER` for extra-user invite HTML |
| Endpoint(s) | complete | payments + subscriptions controllers | No HTTP change |
| Page(s) | n/a | — | Backend-only |
| Jobs | complete | `subscription-lifecycle.processor.ts` | `apply-paid-invoice` + `due-transitions` already call the hook points |
| Tests | complete | `subscription-lifecycle.service.spec.ts` | Three `new SubscriptionLifecycleService(...)` constructors must gain the new mail helper mock |

**Feature state:** none for invoice email — billing apply/downgrade are complete; mail templates/renderer are complete; the send hook is missing.

**Plan-vs-code drift (in scope):**
- `modules.md` S7 lists “password reset, share/dashboard notifications” as MailTemplateService templates — those still use inline HTML in callers; only verification + welcome are file templates. This change adds invoice-receipt files only; does not migrate legacy inline mail.
- `profile.md` MailJet notes omit billing invoices (and verification, already shipped in change-056).

## Affected Modules

### Payments (16) — new mail helper
- Add `BillingMailService` (`SVC-PAY-MAIL`): render `invoice-receipt.{en|ar}` via `MailTemplateService`, send via `MAIL_PROVIDER`, best-effort `.catch` + warn log.
- Accept a prepared payload (recipient, locale, event kind, invoice/plan/period fields). Do **not** pull Workspace/User models into Payments — lifecycle already owns those lookups.
- Export from `PaymentsModule` (already imported by Subscriptions).

### Subscriptions (10) — two hook points
- After successful `markApplied` in `applyPaidInvoice` (main path **and** extra-user early return): `billingMail.sendPaidInvoice(...)`.
- After `appendAtBoundary` creates a period with `source === DOWNGRADE`: `billingMail.sendPlanChange(...)`.
- Resolve workspace owner via existing `workspaces` model + `UserRepository` (AuthModule already imported/exported). Skip + warn if owner/email missing.
- Do not send on replay (`appliedAt` already set / `appendPeriod` CAS miss).

### Email (S7) — one template pair
- `src/integrations/mail/templates/invoice-receipt.en.html`
- `src/integrations/mail/templates/invoice-receipt.ar.html`
- Same brand shell as welcome/verification. `nest-cli.json` already copies `integrations/mail/templates/**/*.html`.

### Not in scope
- Endpoints, pages, schemas, queues, retirement mail, invite mail rewrite, checkout/settlement rules.

## Plan Docs to Update

- [x] `project/plan/modules.md` — Subscriptions features 5/6/9 + S7 template list
- [x] `project/actions/backend/services/payments.md` — add SVC-PAY-MAIL
- [x] `project/actions/backend/services/_index.md` — Payments count 3 → 4; total 61 → 62
- [x] `project/actions/backend/services/subscriptions.md` — SVC-SUB-LIFE side-effect: invoice/plan-change mail after apply
- [x] `project/actions/backend/services/integration-providers.md` — SVC-EXT-MAIL-TPL template list
- [x] `project/rules.md` — RULE-NOTIF-001: invoice-receipt is ordinary best-effort (not durable like retirement)
- [x] `project/description.md` — MailJet usage: invoice receipt on paid apply + applied downgrade
- [x] `project/profile.md` — MailJet notes: add invoice receipt
- [x] `project/plan/data-model.md` — skip (no fields)
- [x] endpoints / pages — skip

## Code Files to Create

| File | Purpose |
|------|---------|
| `roya-ai-dynamo-api/src/modules/payments/services/billing-mail.service.ts` | Render + send invoice/plan-change email |
| `roya-ai-dynamo-api/src/integrations/mail/templates/invoice-receipt.en.html` | Branded invoice email EN |
| `roya-ai-dynamo-api/src/integrations/mail/templates/invoice-receipt.ar.html` | Branded invoice email AR |

## Code Files to Modify

| File | Change |
|------|--------|
| `payments/payments.module.ts` | Register + export `BillingMailService` |
| `subscriptions/services/subscription-lifecycle.service.ts` | Inject helper + `UserRepository`; call after paid apply and DOWNGRADE boundary |
| `subscriptions/services/subscription-lifecycle.service.spec.ts` | Add mail-helper mock to 3 constructors; assert send on apply / downgrade, not on replay |
| `subscriptions/subscriptions.module.ts` | No new import if helper is exported from PaymentsModule (already imported) |

## Ripple / Impact Map

| ID | Item | Location | Action |
|----|------|----------|--------|
| R1 | `applyPaidInvoice` extra-user early return | lifecycle ~409–419 | **Modify** — send after `markApplied` before return |
| R2 | `applyPaidInvoice` upgrade / free-to-paid / renewal | lifecycle ~532–545 | **Modify** — send after `markApplied` |
| R3 | `appendAtBoundary` scheduled downgrade/replacement | lifecycle ~741–795 | **Modify** — send when `created && source === DOWNGRADE` |
| R4 | Extra-user invitee email | lifecycle `applyExtraUserInvoice` | **No change** — invitee still gets existing invite HTML; owner gets the new receipt |
| R5 | Lifecycle unit constructors | `subscription-lifecycle.service.spec.ts` | **Modify** — new constructor arg |
| R6 | Settlement / checkout | `payment-checkout.service.ts` | **No change** — mail after apply, not at PayUp confirm |
| R7 | Retirement mail | `notifications.service.ts` | **No change** |
| R8 | Endpoints EP-SUB / EP-PAY | controllers | **No change** |

## Reuse Opportunities

- `MailTemplateService.render` + branded table layout from `welcome.*.html`
- `resolvePlanName` for EN/AR Plan labels (same as checkout + retirement)
- Lifecycle idempotency: `appliedAt` guard + `appendPeriod` CAS — no new email ledger
- Global `MailModule` — no new provider wiring
- `app.frontendUrl` + `/app/subscriptions` CTA (same path as retirement)

## Risks

| Risk | Level | Mitigation |
|------|-------|------------|
| Double email on paid upgrade | Low | One hook after apply; upgrade is not a separate send |
| Mail failure after apply | Low | Best-effort catch; never throw into lifecycle |
| Missed extra-user receipt | Low | Explicit hook on the early-return path |
| Spec constructor drift | Low | Update all 3 `new SubscriptionLifecycleService` sites |
| Owner missing / inactive | Low | Skip send, warn-log |
| Complexity | Low | Thin helper; two call sites |
| Cross-module | Yes | Payments helper + Subscriptions hooks + S7 templates |
| Migration | No | |

## Recommendation

- **Create:** `BillingMailService`, `invoice-receipt.en|ar.html`
- **Complete:** invoice notification (feature was missing)
- **Modify:** `applyPaidInvoice` (both returns), `appendAtBoundary(DOWNGRADE)`, lifecycle spec constructors, plan docs listed above

**Risk:** complexity L · cross-module Y · migration N
