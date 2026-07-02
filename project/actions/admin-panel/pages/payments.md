## Module: Payments

### Payments Page
- Route: `/app/payments`
- Components: PaymentsPage (filter bar, payments table with Gateway/Plan/Session reference columns, create/edit dialog, delete confirm)
- Service: PaymentsService.list() → `GET /api/v1/payments`; PaymentsService.create() → `POST /api/v1/payments`; PaymentsService.update() → `PATCH /api/v1/payments/:id`; PaymentsService.delete() → `DELETE /api/v1/payments/:id`
- Guard: authGuard + adminGuard
- Notes: Tracks both manual ledger and PayUp gateway payment log. Gateway entries (`gateway: payup`) are written by checkout flow; admins read them to track payment → subscription.
