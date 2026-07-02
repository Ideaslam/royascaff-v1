## Module: Payments

`@Controller('payments')` · class-level `@Roles(ADMIN)` (except PayUp return endpoints which are `@Public()`)

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-PAY-01 | GET | /api/v1/payments | JWT+admin | `ListPaymentsQueryDto` query: userId?, status?, from?, to?, page?, limit? | 200 `Paginated<PaymentDto>` | SVC-PAY.list() | |
| EP-PAY-02 | GET | /api/v1/payments/:id | JWT+admin | `:id` param | 200 `PaymentDto` | SVC-PAY.getById() | |
| EP-PAY-03 | POST | /api/v1/payments | JWT+admin | `CreatePaymentDto` { userId, subscriptionId?, planId?, amountUsd, currency?, status?, method?, reference?, paidAt?, notes? } | 201 `PaymentDto` | SVC-PAY.create() | |
| EP-PAY-04 | PATCH | /api/v1/payments/:id | JWT+admin | `:id` · `UpdatePaymentDto` | 200 `PaymentDto` | SVC-PAY.update() | |
| EP-PAY-05 | DELETE | /api/v1/payments/:id | JWT+admin | `:id` param | 204 | SVC-PAY.delete() | |
| EP-PAY-06 | GET | /api/v1/payments/payup/confirm | public | query: ref (paymentId), outcome? | 302 redirect | SVC-CHECKOUT.confirm() | (change-003) |
| EP-PAY-07 | GET | /api/v1/payments/payup/cancel | public | query: ref (paymentId), outcome? | 302 redirect | SVC-CHECKOUT.cancel() | (change-003) |

**Notes:**
- [EP-PAY-06] **(change-003):** Public browser-redirect target after successful PayUp checkout. Verifies PayUp session, sets payment log to paid, enqueues subscription-activation event (idempotent). Redirects to customer portal subscriptions page with `payment=success|failed` flag. An already-paid log redirects without re-activating. Audits `PAYMENT_UPDATE`; activation audit happens in processor.
- [EP-PAY-07] **(change-003):** Public browser-redirect target after cancelled/failed PayUp checkout. Sets payment log to failed. Redirects to customer portal subscriptions page with `payment=cancelled` flag. Does not activate any subscription.
