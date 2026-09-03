## Module: Payments

### SVC-PAY-INV · BillingInvoiceService [internal, domain, Payments]
Creates/reuses immutable invoices by workspace idempotency key and expected lifecycle version; snapshots exact Plan and Package IDs/versions, commercial charge/billing interval, entitlement/quota cadence, target access period, and proration. Supports `replacement` alongside upgrade/renewal. Lists safe projections; settlement/application and explicit admin financial transitions remain compare-and-set, audited, and non-destructive.

---

### SVC-PAY · PaymentsService [internal, domain, Payments]
Append-only payment-attempt ledger: safe list/get, append provider/manual attempt, and guarded verified/failed/cancelled/expired transitions. Retries append attempts. Invoice owns charge/action truth; raw provider payloads/tokens never appear in DTOs.

---

### SVC-PAY-CHKOUT · PaymentCheckoutService [internal, domain, Payments]
`startAttempt` revalidates invoice ownership, status, lifecycle version, and expiry; appends/reuses an idempotent attempt and creates PayUp hosted checkout. `confirm` verifies server-side, settles invoice atomically, and ensures lifecycle event delivery. `cancel` changes only the attempt. `reconcileAttempt` retries verification. Amount/action/workspace derive from invoice; callbacks trust no browser outcome; checkout cancellation never suspends a user or changes entitlement. The gateway `productName` resolves through SVC-SUB-LABEL against `invoice.planSnapshot` *(change-077)* so the customer sees the same Plan label on the hosted checkout page as in the portal, falling back to `snapshot.name` for snapshots written before that change.
