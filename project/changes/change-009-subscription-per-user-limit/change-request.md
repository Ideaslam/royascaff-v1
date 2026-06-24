# Change Request

## Metadata

- **date**: 2026-06-24
- **change-type**: general
- **target-app**: all-apps
- **affected-repos**: all
- **priority**: high

---

## Scope

- App(s): backend, customer-portal, admin-panel
- Module(s): Workspace (invitations), Subscriptions, Payments, Admin
- Feature(s): Workspace-level user limit checks, extra user invoicing/payments, admin plan customization
- Endpoint(s):
  - `POST /workspaces/:workspaceId/invite` (modified — checks limits, creates invoice if limit exceeded)
  - `GET /workspaces/:workspaceId/invitations` (modified or reused)
- Page(s) / View(s):
  - customer-portal: Workspace Settings (Members & Invitations tabs)
  - admin-panel: Subscriptions Page (Plans tab and Create/Edit Plan dialog)
- Service(s):
  - `WorkspaceInvitationService`, `PaymentCheckoutService`, `SubscriptionsService`

---

## Description

Currently, subscription plans do not limit the number of users in a workspace, nor do they charge for extra users. This change introduces user-based billing:
1. **Plan schema changes**: Add `freeUsers` (default 5) and `pricePerExtraUserMonthlyUsd` (default 10) fields to the SubscriptionPlan model.
2. **Workspace invitation logic**: When inviting a new member to a workspace, check the active subscription's plan.
   - Count the workspace's active memberships (status doesn't exist, all membership records count) plus pending invitations (status `pending` only).
   - If the total count is less than `freeUsers`, create the invitation with status `pending` and send the email immediately.
   - If the limit is reached or exceeded, create the invitation with status `pending-payment`. Generate a pending payment/invoice using `PaymentCheckoutService.createPendingInvoice` with `amountUsd` equal to `pricePerExtraUserMonthlyUsd` and `action` equal to `add_user`. Return the payment ID to the frontend to redirect the user to checkout.
3. **Payment activation logic**: When an `add_user` invoice is paid:
   - Mark the payment as `paid`.
   - Update the corresponding invitation's status to `pending`.
   - Send the invitation email to the invited user.
4. **Admin UI updates**: Add fields to edit `freeUsers` and `pricePerExtraUserMonthlyUsd` in the admin panel's plan editor, and show them in the plans table.
5. **Customer Portal updates**: Handle the invitation response on the frontend: if checkout is required, automatically redirect the user to the checkout page.

---

## Acceptance Criteria

1. `SubscriptionPlan` model in the backend database has `freeUsers` (default: 5) and `pricePerExtraUserMonthlyUsd` (default: 10) fields.
2. Existing subscription plans in the database are migrated/backfilled to have `freeUsers = 5` and `pricePerExtraUserMonthlyUsd = 10`.
3. Creating or updating plans in the admin panel allows the admin to specify the "Free Users Limit" and "Price Per Extra User (USD)". These values are displayed in the plans table.
4. When inviting a member:
   - If `(active members + pending invitations) < freeUsers` limit, invitation is created in `pending` status, email is sent, and API returns status indicating direct success.
   - If `(active members + pending invitations) >= freeUsers` limit, invitation is created in `pending-payment` status, a pending invoice of `pricePerExtraUserMonthlyUsd` is created with action `add_user`, and API returns `{ direct: false, paymentId }`.
5. When the user completes payment for `add_user` invoice:
   - The invoice status updates to `paid` via standard PayUp callbacks.
   - The invitation status updates from `pending-payment` to `pending`.
   - The invitation email is sent to the invitee.
6. The customer portal frontend's workspace settings page automatically redirects the user to the PayUp checkout flow when the invitation requires payment.

---

## Notes

- Uses `PaymentAction.ADD_USER = 'add_user'` as the action code.
- Registers a new invitation status `pending-payment`.
- Integrates `SubscriptionsService` / `PaymentCheckoutService` with `WorkspaceInvitationService`.
