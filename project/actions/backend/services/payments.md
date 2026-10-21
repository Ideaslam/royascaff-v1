## Module: Payments

### SVC-PAY-INV · BillingInvoiceService [internal, domain, Payments]
Creates/reuses immutable invoices by workspace idempotency key and expected lifecycle version; snapshots exact Plan and Package IDs/versions, commercial charge/billing interval, entitlement/quota cadence, target access period, and proration. Supports `replacement` alongside upgrade/renewal. Lists safe projections; settlement/application and explicit admin financial transitions remain compare-and-set, audited, and non-destructive. *(change-080)* `void`/`refund` of a renewal invoice no longer blocks renewal — lifecycle issues a replacement under a suffixed key next tick; `refund`/`recordChargeback` of an applied invoice hands off to SVC-SUB-LIFE (keep access to period end, auto-renew off, `reviewRequired`/`reviewReason`). Revoking a workspace invitation voids its open extra-user invoice, and an invite-email failure never fails extra-user invoice application.

---

### SVC-PAY · PaymentsService [internal, domain, Payments]
Append-only payment-attempt ledger: safe list/get (including the admin review list: VERIFIED_PAID attempts on unpaid invoices and `failureCode` `refund_required` / `duplicate_payment`), append provider/manual attempt, and guarded verified/failed/cancelled/expired transitions. `settleManually` requires `reason` and validates the invoice is payable before appending any attempt *(change-080)*. Retries append attempts. Invoice owns charge/action truth; raw provider payloads/tokens never appear in DTOs.

---

### SVC-PAY-CHKOUT · PaymentCheckoutService [internal, domain, Payments]
`startAttempt` revalidates invoice ownership, status, lifecycle version, and expiry, rejects an `INACTIVE` subscription with `SUBSCRIPTION_ADMIN_LOCKED`, reuses the invoice's open PENDING attempt (same checkout) instead of opening a second one, and maps a reused Idempotency-Key of a cancelled/failed attempt to 409 `PAYMENT_IDEMPOTENCY_KEY_REUSED` *(change-080)*; otherwise appends an idempotent attempt and creates PayUp hosted checkout. `confirm` verifies server-side, settles invoice atomically, and ensures lifecycle event delivery; an attempt created before invoice `expiresAt` settles EXPIRED → PAID, a capture on a SUPERSEDED/VOID invoice or started after expiry is marked `refund_required`, a second capture on a PAID invoice `duplicate_payment` (both audited); the legacy `ref=<Payment>` path checks amount and currency *(change-080)*. `cancel` changes only the attempt. `reconcileAttempt` retries verification. `reverifyPendingAttempts` *(change-080)* — driven by the `payment-attempt-reverify` job: re-verifies PENDING attempts younger than 3 days via provider `getCheckoutSession` and settles through the same path as `confirm`. Amount/action/workspace derive from invoice; callbacks trust no browser outcome; checkout cancellation never suspends a user or changes entitlement. The gateway `productName` resolves through SVC-SUB-LABEL against `invoice.planSnapshot` *(change-077)* so the customer sees the same Plan label on the hosted checkout page as in the portal, falling back to `snapshot.name` for snapshots written before that change.

---

### SVC-PAY-MAIL · BillingMailService [internal, application, Payments] *(change-079)*
Renders and sends the owner invoice / plan-change email. Accepts a prepared payload (recipient, locale, event kind, invoice/plan/period fields) so Payments never looks up Workspace or User. Lifecycle calls it only after a successful apply or DOWNGRADE boundary.

**Methods:**
- `sendPaidInvoice(payload)` — invoice-receipt after a paid invoice is applied (free-to-paid, upgrade, renewal, extra-user)
- `sendPlanChange(payload)` — same template after a scheduled downgrade/replacement is applied; amount `0.00` when there is no charge

**Deps:** MailTemplateService · MAIL_PROVIDER · ConfigService (`app.frontendUrl`)
**Side effects:** outbound email (best-effort)
**Rules:** EN/AR `invoice-receipt` templates only · Plan labels via caller-supplied `resolvePlanName` values · never throw into settlement/apply · no provider secrets or raw payloads in the body
