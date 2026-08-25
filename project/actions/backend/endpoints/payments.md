## Module: Payments

`@Controller('payments')` · platform-admin by default; PayUp return endpoints are public and accept opaque references only.

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-PAY-01 | GET | /api/v1/payments | JWT+admin | attempt filters + pagination | 200 paginated `AdminPaymentAttemptDto` | SVC-PAY.listAttempts() | No provider tokens/raw payloads |
| EP-PAY-02 | GET | /api/v1/payments/:id | JWT+admin | `:id` | 200 `AdminPaymentAttemptDto` | SVC-PAY.getAttempt() | |
| EP-PAY-03 | POST | /api/v1/payments/manual-settlement | JWT+admin | `{ invoiceId, reference, reason, idempotencyKey }` | 201 `AdminPaymentAttemptDto` | SVC-PAY.settleManually() | Append attempt + settle |
| EP-PAY-04 | GET | /api/v1/payments/invoices | JWT+admin | filters + pagination | 200 paginated `AdminInvoiceDto` | SVC-PAY-INV.list() | Immutable ledger |
| EP-PAY-05 | GET | /api/v1/payments/invoices/:id | JWT+admin | `:id` | 200 `AdminInvoiceDetailDto` | SVC-PAY-INV.get() | Safe attempt history |
| EP-PAY-06 | POST | /api/v1/payments/invoices/:id/reconcile | JWT+admin | `{ reason, idempotencyKey }` | 202 result | SVC-PAY-INV.reconcile() | Retry verification/application |
| EP-PAY-07 | POST | /api/v1/payments/invoices/:id/void | JWT+admin | `{ reason, idempotencyKey }` | 200 `AdminInvoiceDto` | SVC-PAY-INV.void() | Open invoices only |
| EP-PAY-08 | POST | /api/v1/payments/invoices/:id/refund | JWT+admin | `{ amount?, reason, idempotencyKey }` | 202 `AdminInvoiceDto` | SVC-PAY-INV.refund() | Audited transition |
| EP-PAY-09 | POST | /api/v1/payments/invoices/:id/chargeback | JWT+admin | `{ providerReference, reason, idempotencyKey }` | 200 `AdminInvoiceDto` | SVC-PAY-INV.recordChargeback() | No silent period rewrite |
| EP-PAY-10 | GET | /api/v1/payments/payup/confirm | public | `ref` | 302 redirect | SVC-PAY-CHKOUT.confirm() | Server verifies and ensures lifecycle event |
| EP-PAY-11 | GET | /api/v1/payments/payup/cancel | public | `ref` | 302 redirect | SVC-PAY-CHKOUT.cancel() | Attempt only; entitlement unchanged |

**Contract rules:** no general PATCH/DELETE. Corrections use explicit append-only transitions with admin reason. Public callbacks ignore browser outcome/amount/plan/workspace fields. Repeated verified callbacks safely repair missing lifecycle delivery.

