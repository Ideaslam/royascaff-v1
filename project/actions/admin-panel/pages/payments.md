## Module: Billing & Payments

### Billing Page
- Route: `/app/payments`
- Components: invoices tab (action/status/amount/access period/proration/applied state); exact Plan and Package family/version snapshots with Package quota cadence; payment-attempt tab; immutable detail drawer; manual settlement, void, refund, chargeback, and reconcile dialogs.
- Service: attempts → `GET /payments` and `GET /payments/:id`; invoices → `GET /payments/invoices` and `GET /payments/invoices/:id`; manual settlement and explicit invoice transition endpoints.
- Guard: authGuard + adminGuard.
- Notes: no generic edit/delete. Every mutation requires reason/idempotency key and shows immutable audit context. Provider tokens, raw payloads, and hosted URLs are excluded. Paid-but-unapplied invoices are visibly recoverable through reconciliation.
