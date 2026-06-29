## Module: Payments

### SVC-PAY · PaymentsService [internal, domain, Payments]
Admin manual payment ledger — record and manage payment entries (not a gateway checkout flow).

**Methods:**
- `list(filters): Promise<paginated>` — filterable by user/status/date range, paginated
- `getById(id)` — fetch one payment, 404 if missing
- `create(data, actorId?, ip?)` — records manual payment, audits PAYMENT_CREATE
- `update(id, data, actorId?, ip?)` — updates ledger fields, audits PAYMENT_UPDATE
- `delete(id, actorId?, ip?)` — deletes payment, audits PAYMENT_DELETE

**Deps:** PaymentRepository · AuditLogService
**Side effects:** audit writes
**Rules:** Manual admin-driven ledger; defaults currency USD and status PENDING · No gateway validation or webhook processing · Decoupled from gateway; gateway-driven logs written by PaymentCheckoutService into same Payment collection

---

### SVC-PAY-CHKOUT · PaymentCheckoutService [internal, domain, Payments]
Orchestrates the PayUp hosted-checkout flow: payment log lifecycle + event-driven subscription activation.

**Methods:**
- `initiateSubscriptionCheckout({ userId, planId, planName, amountUsd, customerEmail }, ip?)` — creates pending payment log, creates PayUp session, updates log, returns { redirectUrl }
- `confirm(paymentId)` — verifies session, sets log paid + paidAt + reference, enqueues subscription-activation; returns portal redirect URL; idempotent on already-paid
- `cancel(paymentId)` — sets log failed; checks consecutive unpaid → may call UsersService.autoSuspendForUnpaidInvoices; returns portal redirect URL

**Deps:** PaymentRepository · AuditLogService · PAYMENT_PROVIDER (PayUpProvider) · subscription-activation queue (BullMQ)
**Side effects:** PayUp API calls · audit writes (PAYMENT_CREATE, PAYMENT_UPDATE) · queue enqueue
**Rules:** Activation never performed inline — only via enqueued event · Confirm is idempotent (already-paid log returned without re-enqueueing) · Amounts come from plan (server-side), never client
