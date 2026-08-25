## Module: Subscriptions

`@Controller('subscriptions')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-SUB-01 | GET | /api/v1/subscriptions/plans | JWT | none | 200 `PlanDto[]` | SVC-SUB.listPlans() | Active catalog, safe snapshots |
| EP-SUB-02 | GET | /api/v1/subscriptions/plans/all | JWT+admin | none | 200 `AdminPlanDto[]` | SVC-SUB.listAllPlans() | Includes archived |
| EP-SUB-03 | POST | /api/v1/subscriptions/plans | JWT+admin | `CreatePlanDto` | 201 `AdminPlanDto` | SVC-SUB.createPlan() | Validates free/paid interval invariants |
| EP-SUB-04 | PUT | /api/v1/subscriptions/plans/:id | JWT+admin | `UpdatePlanDto` | 200 `AdminPlanDto` | SVC-SUB.updatePlan() | Identity fields locked after first use |
| EP-SUB-05 | DELETE | /api/v1/subscriptions/plans/:id | JWT+admin | `:id` | 204 | SVC-SUB.archivePlan() | Archive only; never delete history |
| EP-SUB-06 | GET | /api/v1/subscriptions/me | JWT+workspace | none | 200 `MySubscriptionResponseDto` | SVC-SUB.getMySubscription() | Safe lifecycle envelope |
| EP-SUB-07 | GET | /api/v1/subscriptions | JWT+admin | filters + pagination | 200 paginated `AdminSubscriptionDto` | SVC-SUB.listSubscriptions() | |
| EP-SUB-08 | GET | /api/v1/subscriptions/:id | JWT+admin | `:id` | 200 `AdminSubscriptionDetailDto` | SVC-SUB.getSubscription() | No secrets |
| EP-SUB-09 | POST | /api/v1/subscriptions | JWT+admin | `{ workspaceId, planId, reason }` | 201 `AdminSubscriptionDto` | SVC-SUB.createSubscription() | Migration/recovery only; idempotent |
| EP-SUB-10 | PUT | /api/v1/subscriptions/:id | JWT+admin | `UpdateSubscriptionNotesDto` | 200 `AdminSubscriptionDto` | SVC-SUB.updateNotes() | No arbitrary lifecycle edit |
| EP-SUB-11 | POST | /api/v1/subscriptions/:id/change | JWT+admin | `{ planId, effective, settlement?, reason, idempotencyKey }` | 201 `PlanChangeResultDto` | SVC-SUB-LIFE.adminChange() | Lifecycle-aware override |
| EP-SUB-12 | POST | /api/v1/subscriptions/:id/activate | JWT+admin | `{ reason, idempotencyKey }` | 200 `AdminSubscriptionDto` | SVC-SUB-LIFE.adminActivate() | Explicit unlock |
| EP-SUB-13 | POST | /api/v1/subscriptions/:id/deactivate | JWT+admin | `{ reason, idempotencyKey }` | 200 `AdminSubscriptionDto` | SVC-SUB-LIFE.adminDeactivate() | Resource lock only |
| EP-SUB-14 | POST | /api/v1/subscriptions/change/preview | JWT+workspace-owner | `{ planId }` | 200 `PlanChangePreviewDto` | SVC-SUB-CALC.preview() | Server-calculated amount/timing |
| EP-SUB-15 | POST | /api/v1/subscriptions/upgrade | JWT+workspace-owner | `{ planId, idempotencyKey }` | 201 `InvoiceCheckoutDto` | SVC-SUB-LIFE.requestUpgrade() | Activate only after verified payment |
| EP-SUB-16 | POST | /api/v1/subscriptions/downgrade | JWT+workspace-owner | `{ planId, idempotencyKey }` | 201 `ScheduledChangeDto` | SVC-SUB-LIFE.scheduleDowngrade() | Period-end, no invoice |
| EP-SUB-17 | DELETE | /api/v1/subscriptions/downgrade | JWT+workspace-owner | idempotency key header | 200 `MySubscriptionResponseDto` | SVC-SUB-LIFE.cancelDowngrade() | |
| EP-SUB-18 | PATCH | /api/v1/subscriptions/auto-renew | JWT+workspace-owner | `{ enabled, idempotencyKey }` | 200 `MySubscriptionResponseDto` | SVC-SUB-LIFE.setAutoRenew() | Disabling preserves current access |
| EP-SUB-19 | GET | /api/v1/subscriptions/me/invoices | JWT+workspace-owner | filters + pagination | 200 paginated `CustomerInvoiceDto` | SVC-PAY-INV.listForWorkspace() | Allowlisted data only |
| EP-SUB-20 | POST | /api/v1/subscriptions/invoices/:invoiceId/pay | JWT+workspace-owner | idempotency key header | 201 `InvoiceCheckoutDto` | SVC-PAY-CHKOUT.startAttempt() | Revalidates ownership/actionability |

**Contract rules:** Workspace identity comes from verified JWT context. Customer mutations require workspace-owner. `GET /me` includes plan, period, usage, limits, auto-renew, grace, scheduled change, and actionable invoices. There is no customer free-subscribe or immediate-cancel endpoint. Customer billing mutations are workspace-rate-limited and idempotent.

