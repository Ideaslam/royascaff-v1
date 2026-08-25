## Module: Payments

### SVC-PAY-INV · BillingInvoiceService [internal, domain, Payments]
Creates/reuses immutable invoices by workspace idempotency key and expected lifecycle version; snapshots charge, currency, plan, limits, target period, and proration. Lists safe customer/admin projections. Verified/manual settlement compare-and-sets the actionable invoice to paid and persists lifecycle outbox/audit atomically. Explicit `void`, `refund`, `recordChargeback`, `reconcile`, expiry, and supersession methods require reasons where admin-triggered. No arbitrary update/delete.

---

### SVC-PAY · PaymentsService [internal, domain, Payments]
Append-only payment-attempt ledger: safe list/get, append provider/manual attempt, and guarded verified/failed/cancelled/expired transitions. Retries append attempts. Invoice owns charge/action truth; raw provider payloads/tokens never appear in DTOs.

---

### SVC-PAY-CHKOUT · PaymentCheckoutService [internal, domain, Payments]
`startAttempt` revalidates invoice ownership, status, lifecycle version, and expiry; appends/reuses an idempotent attempt and creates PayUp hosted checkout. `confirm` verifies server-side, settles invoice atomically, and ensures lifecycle event delivery. `cancel` changes only the attempt. `reconcileAttempt` retries verification. Amount/action/workspace derive from invoice; callbacks trust no browser outcome; checkout cancellation never suspends a user or changes entitlement.

