# Change Request

## Metadata

- **date**: 2026-06-23
- **change-type**: general
- **target-app**: all-apps
- **affected-repos**: all
- **priority**: high

---

## Scope

- App(s): backend, customer-portal, admin-panel
- Module(s): Subscriptions, Admin — Subscriptions & Plans, Auth, Users, Dashboards, Data
- Feature(s):
  - Account status enforcement (suspend / activate)
  - Subscription status enforcement (activate / deactivate / expired resource lock)
  - Subscription usage limits (extensible quota system)
  - Free plan (no payment flow, event-driven activation)
- Endpoint(s):
  - `PATCH /api/v1/users/:id/suspend` (existing — extend: token revoke, clearer errors)
  - `PATCH /api/v1/users/:id/reactivate` (existing — extend behavior/docs)
  - `POST /api/v1/subscriptions/:id/activate` (new — admin activate subscription)
  - `POST /api/v1/subscriptions/:id/deactivate` (new — admin deactivate subscription)
  - `POST /api/v1/subscriptions/subscribe` (modify — free-plan path skips PayUp)
  - Dashboard / data endpoints that create or mutate resources (modify — enforce subscription locks + usage limits)
- Page(s) / View(s):
  - admin-panel: user management (suspend/activate), subscription management (activate/deactivate), plan editor (limits)
  - customer-portal: subscriptions page (show account/subscription status, usage vs limits), blocked-action UX
- Service(s):
  - `SubscriptionsService`, `SubscriptionLimitService` (new), `SubscriptionActivationProcessor`, `PaymentCheckoutService`, `UsersService`, `AuthService`, `DashboardsService`, `DataService`

---

## Description

Extend the **Subscriptions** module with three related capabilities: **account vs subscription status enforcement**, an **extensible usage-limit system**, and **free-plan support** without a payment gateway.

### 1 — Account and subscription status (two independent layers)

The system must distinguish **account status** (can the user enter the platform?) from **subscription status** (what can the user do once inside?).

#### Account suspended — user cannot enter the system

**Triggers:**

1. **Admin action** — admin suspends the account (`POST /users/:id/suspend`; sets `users.isActive = false`).
2. **Automatic** — **two consecutive unpaid payment invoices** for the user (two payment records that reached a terminal unpaid state — `failed` or expired `pending` — without an intervening `paid` payment). When the second unpaid invoice is recorded, the account is auto-suspended.

**Effect:**

- Login rejected (`401` / friendly error page on the portal).
- All authenticated API calls rejected for that user (`403 Account suspended`).
- Existing refresh tokens revoked on suspension.

**Recovery:**

- Admin reactivates the account (`POST /users/:id/reactivate`).
- Auto-suspended accounts require admin reactivation (paying a new invoice alone does not unsuspend — admin must explicitly reactivate, or a separate admin workflow clears the suspension).

#### Subscription resource lock — user can enter but cannot mutate resources

**Triggers:**

1. **Subscription expired** — `usersubscriptions.status = expired` (period ended without renewal / payment).
2. **Admin deactivation** — admin deactivates the subscription (`POST /subscriptions/:id/deactivate`; sets `status = inactive`).

**Effect (user **can** log in and view existing data):

- **Blocked:** create dashboard, upload files, update/refresh data.
- **Allowed:** read dashboards, view files, view subscription/usage info, subscribe/upgrade to restore access.

**Recovery:**

- Admin activates the subscription (`POST /subscriptions/:id/activate`).
- User completes payment (paid plan) or selects a free plan → event-driven activation restores `status = active`.

#### Admin controls

| Action | Endpoint | Result |
|--------|----------|--------|
| Suspend account | `POST /users/:id/suspend` | `isActive = false`; user locked out |
| Activate account | `POST /users/:id/reactivate` | `isActive = true`; user can log in again |
| Deactivate subscription | `POST /subscriptions/:id/deactivate` | `status = inactive`; resource lock |
| Activate subscription | `POST /subscriptions/:id/activate` | `status = active`; limits apply normally |

Add `inactive` to `SubscriptionStatus` enum (`active`, `inactive`, `expired`, `cancelled`). Admin deactivation uses `inactive`; natural non-payment expiry uses `expired`.

---

### 2 — Subscription usage limits (extensible)

Plans define **limits on resources and actions**. Limits must be easy to extend in code without rewriting enforcement logic.

**Initial limit keys** (stored on `subscriptionplans` and enforced per user):

| Limit key | Plan field | Counter on `usersubscriptions` | Enforced on |
|-----------|------------|--------------------------------|-------------|
| `maxDashboards` | `maxDashboards` | count of user's dashboards (live query or cached) | dashboard create |
| `maxDataUploadsPerMonth` | `maxDataUploadsPerMonth` | `uploadsUsedThisMonth` | CSV upload |
| `maxDataUpdatesPerMonth` | `maxDataUpdatesPerMonth` | `updatesUsedThisMonth` | data refresh / update |

**Design:**

- Introduce a **`SubscriptionLimitRegistry`** (or equivalent) — each limit is a registered handler with: `key`, `getLimit(plan)`, `getUsage(subscription, userId)`, `increment?(subscription)` (for monthly counters).
- **`SubscriptionLimitService.check(userId, limitKey)`** — returns allowed/denied + current/limit; called from business services **after auth, before writes**.
- **`SubscriptionLimitService.assertAllowed(userId, limitKey)`** — throws `403` with a clear, user-facing message when denied.
- Adding a future limit = add plan field + register one handler + call `assertAllowed` at the action site. No changes to unrelated limits.

**Admin plan CRUD** (existing admin plan endpoints) must expose all limit fields when creating/editing plans.

**Period rollover:** monthly counters (`uploadsUsedThisMonth`, `updatesUsedThisMonth`) reset when `currentPeriodEnd` passes (existing data-model intent; wire the reset job if not yet implemented).

**Enforcement scope:** limit checks apply only when subscription `status = active`. Expired/inactive/cancelled subscriptions are blocked by the resource-lock guard first; usage limits are secondary.

---

### 3 — Free plan

Admins can create a **free plan** (`priceMonthlyUsd = 0`) with the same limit fields as paid plans.

**Subscribe flow for free plans:**

1. User selects a free plan → `POST /subscriptions/subscribe`.
2. Backend **skips PayUp** — no payment log, no redirect URL.
3. Backend **enqueues a `subscription-activation` BullMQ job** (same durable, retryable event path as paid activation).
4. `SubscriptionActivationProcessor` activates the subscription (`status = active`, sets period dates, resets usage counters).

Paid plans (`priceMonthlyUsd > 0`) continue through the existing PayUp checkout flow (change-003).

Free and paid activation share **`SubscriptionsService.activateFromPayment`** (rename or generalize to `activateSubscription` if needed) so activation logic stays in one place.

---

### Out of scope

- Automated billing / recurring invoice generation (only the "two unpaid invoices → suspend account" rule on existing payment records).
- Changing PayUp integration beyond the free-plan branch in subscribe.
- New payment providers.
- Customer self-service unsuspend (admin-only).
- Proration or mid-cycle plan changes.

---

## Acceptance Criteria

### Account status

1. Admin suspend sets `users.isActive = false`, revokes refresh tokens, and writes an audit log.
2. A suspended user cannot log in and receives a clear "account suspended" message.
3. A suspended user's JWT/API requests return `403` with an account-suspended error code.
4. Admin reactivate sets `users.isActive = true` and restores login access.
5. When a user accumulates **two consecutive unpaid payment invoices**, the account is auto-suspended and an audit log is written.
6. Auto-suspended accounts behave identically to admin-suspended accounts (no system entry).

### Subscription status

7. Admin deactivate sets subscription `status = inactive`; the user can still log in.
8. Admin activate sets subscription `status = active` (with valid period dates).
9. A user with `expired` or `inactive` subscription cannot: create dashboards, upload files, or update/refresh data — each returns `403` with a subscription-locked message.
10. A user with `expired` or `inactive` subscription **can** view existing dashboards/files and access the subscriptions page to upgrade.
11. Natural subscription expiry (period end without renewal) sets `status = expired` and applies the same resource lock as `inactive`.

### Usage limits

12. Dashboard create is blocked with `403` when the user is at `maxDashboards` for their active plan.
13. CSV upload increments `uploadsUsedThisMonth` and is blocked at `maxDataUploadsPerMonth`.
14. Data update/refresh increments `updatesUsedThisMonth` and is blocked at `maxDataUpdatesPerMonth`.
15. `GET /subscriptions/me` returns current usage vs limits for all registered limit keys.
16. Admin plan create/update accepts and persists all limit fields.
17. Adding a new limit key requires only: plan schema field + registry entry + one `assertAllowed` call (documented in code comment / rules.md).
18. Monthly usage counters reset on period rollover.

### Free plan

19. A plan with `priceMonthlyUsd = 0` is subscribable without PayUp redirect.
20. Free-plan subscribe enqueues `subscription-activation` and activates via the same processor as paid plans.
21. Free-plan activation sets `status = active` with period dates and zeroed/resetted usage counters.
22. Paid plans (`priceMonthlyUsd > 0`) still redirect to PayUp — unchanged from change-003.

### Admin UI

23. Admin panel exposes suspend/activate on user detail and activate/deactivate on subscription detail.
24. Admin plan form shows all limit fields (dashboards, uploads/month, updates/month).
25. Customer portal subscriptions page shows account status, subscription status, and usage vs limits; blocked actions show a clear upgrade/reactivate message.

---

## Notes

- Builds on change-001 (self-service subscribe/cancel), change-003 (PayUp + event-driven activation).
- `SubscriptionRepository.incrementUsage` exists but is unwired — this change wires it through the limit registry.
- Global rule 7 (`project/rules.md`) already requires limit enforcement; this change implements it.
- **Open assumption (confirm):** "two unpaid invoices" = two consecutive payment records for the user that end in `failed` (or abandoned `pending`) without a `paid` payment between them. Adjust if you mean total lifetime unpaid count or calendar-month overdue invoices.
- **Open assumption (confirm):** auto-suspended accounts require admin reactivation even after a successful new payment.
- Consider a shared **`AccountGuard`** (checks `isActive`) and **`SubscriptionResourceGuard`** (checks subscription status before mutating endpoints) to avoid duplicating checks in every service.
