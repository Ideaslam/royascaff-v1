# Code Reconnaissance — Change #009 Subscription Plan Limit Per User

**Date**: 2026-06-24
**Target app(s)**: customer-portal, admin-panel, backend
**Scope under review**: Workspace (invitations), Subscriptions, Payments, Admin
**Repos scanned**: backend, frontend, admin

## 1. Existing Implementation Found

Check the actual code at every layer. Record the path if it exists, and what is missing.

| Layer | State | Location (path) | Notes / gaps |
|-------|:-----:|-----------------|--------------|
| Schema / data model | partial | `roya-ai-dynamo-api/src/modules/subscriptions/schemas/subscription-plan.schema.ts`<br>`roya-ai-dynamo-api/src/modules/workspace/schemas/workspace-invitation.schema.ts`<br>`roya-ai-dynamo-api/src/modules/payments/schemas/payment.schema.ts` | Gaps: `SubscriptionPlan` needs `freeUsers` and `pricePerExtraUserMonthlyUsd` fields. `WorkspaceInvitation` status enum needs `pending-payment`. `Payment` needs `invitationId` ref and `add_user` in `PaymentAction` enum. |
| Repository | partial | `roya-ai-dynamo-api/src/modules/workspace/repositories/workspace-invitation.repository.ts` | Gaps: Needs `countPendingByWorkspaceId` to get active pending invites. |
| Service(s) | partial | `roya-ai-dynamo-api/src/modules/workspace/services/workspace-invitation.service.ts`<br>`roya-ai-dynamo-api/src/modules/subscriptions/services/subscriptions.service.ts`<br>`roya-ai-dynamo-api/src/modules/payments/services/payment-checkout.service.ts` | Gaps: `WorkspaceInvitationService.invite()` needs checks for user limits, creating payment, returning result. `SubscriptionsService.activateFromPayment()` needs handlers for action `add_user` to set invitation status and send email. `PaymentCheckoutService` needs `invitationId` linkage when creating pending invoice. |
| Endpoint(s) / controller | partial | `roya-ai-dynamo-api/src/modules/workspace/controllers/workspace-invite.controller.ts` | Gaps: Needs to propagate the new `{ direct, paymentId, invitation }` structure to the frontend. |
| Frontend service | complete | `roya-ai-dynamo-frontend/src/app/core/services/workspace.service.ts`<br>`roya-ai-dynamo-frontend-admin/src/app/core/services/subscriptions-admin.service.ts` | Service APIs use Partial/generics which will automatically carry new payload attributes; no typescript method signature changes needed. |
| Page(s) / component(s) | partial | `roya-ai-dynamo-frontend/src/app/pages/settings/workspace/workspace-settings.page.ts`<br>`roya-ai-dynamo-frontend-admin/src/app/pages/admin/subscriptions/subscriptions.page.ts` | Gaps: `workspace-settings.page.ts` needs to handle non-direct invites and call `payInvoice()`. `subscriptions.page.ts` needs inputs for `freeUsers` and `pricePerExtraUserMonthlyUsd` in plan CRUD dialog and column display. |
| Route registration | complete | N/A | Existing routes are fully sufficient. |

## 2. Feature State Verdict

**State**: partial — exists but incomplete

If **partial**, list precisely what is implemented vs. what is missing, so Step 5.2 **completes it in place** instead of creating a duplicate:
- Implemented: Workspace multi-tenancy, email invitation sending, PayUp payment/invoice creation/confirmation, admin plan list/edit/delete page.
- Missing: Free user limit check on invitations, `pending-payment` invitation state, automatic redirection of the inviter to checkout on limit reached, admin editing/displaying of user limit values, automatic email dispatch upon payment.

## 3. Plan vs. Code Drift

- Code that exists but is **not** in the plan docs: None (the codebase matches the current change logs and profile).
- Plan entries with **no** code yet: None.

## 4. Ripple / Impact Map

Everything that depends on, or is depended on by, the area being changed.

| Affected item | Type | Relationship | Breaks if changed? | Action needed |
|---------------|------|--------------|:------------------:|---------------|
| `WorkspaceInvitation` | Schema | Holds invitation status | yes | Add `pending-payment` to status enum |
| `SubscriptionPlan` | Schema | Defines plan limits | yes | Add `freeUsers` and `pricePerExtraUserMonthlyUsd` fields |
| `Payment` | Schema | Defines payment record | yes | Add `invitationId` ref and `add_user` action |
| `WorkspaceInviteController` | Endpoint | Creates invitation | yes | Update return type to handle payment redirect data |
| `WorkspaceInvitationService` | Service | Processes invitations | yes | Inject `SubscriptionRepository` and update `invite()` |
| `SubscriptionsService` | Service | Activates subscriptions | yes | Handle `add_user` action in `activateFromPayment` |
| `PaymentCheckoutService` | Service | Generates invoices | yes | Link `invitationId` in `createPendingInvoice` |
| `WorkspaceSettingsPage` | Page | UI for inviting members | yes | Redirect to PayUp checkout on payment required |
| `AdminSubscriptionsPage` | Page | Admin plan editor | yes | Add `freeUsers` and `pricePerExtraUserMonthlyUsd` to CRUD forms and list view |

- Shared DTOs / schemas touched: `SubscriptionPlan`, `WorkspaceInvitation`, `Payment` schemas, and related dtos in workspace/subscriptions.
- Auth / role implications: Workspace invites are only triggered by workspace admin/owner. This is already protected by `@WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)`.
- Async jobs / queues / webhooks involved: standard PayUp webhook triggers BullMQ `subscription-activation` queue.
- Data migration required? yes — Mongo DB migration script or seeder to backfill existing plans with `freeUsers = 5` and `pricePerExtraUserMonthlyUsd = 10`.

## 5. Reuse Opportunities

Existing services, endpoints, or components to reuse instead of creating new ones:
- `PaymentCheckoutService.createPendingInvoice` can be reused to create the user upgrade invoice.
- `SubscriptionsService.payPendingInvoice` (and frontend's `SubscriptionsService.payInvoice`) can be reused on the settings page to start the checkout session.
- `MailProvider` (`MAIL_PROVIDER`) can be injected in `SubscriptionsService` to send the invitation email.

## 6. Recommendation for Impact Analysis (Step 5.1)

- **Create new**: DB migration script to backfill existing plans.
- **Complete in place** (partial):
  - `SubscriptionPlan`, `WorkspaceInvitation`, `Payment` schemas
  - `WorkspaceInvitationService.invite`
  - `SubscriptionsService.activateFromPayment`
  - `WorkspaceInviteController.invite`
  - `WorkspaceSettingsPage` (frontend)
  - `AdminSubscriptionsPage` (admin frontend)
- **Modify** (ripple): None.
- **Out of scope / deferred**: None.

## Open Questions
- None.
