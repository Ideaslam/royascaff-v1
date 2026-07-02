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
- Module(s): Subscriptions, Admin — Subscriptions & Plans, Payments
- Feature(s):
  - Customer self-service upgrade / downgrade (payment-gated)
  - Payment-gated subscribe (paid plans always via invoice + PayUp)
  - Admin subscription assign/create with `paid` flag
  - Cancel vs deactivate semantics (self-service eligibility)
  - Customer pending-invoices / pay flow
- Endpoint(s):
  - `POST /api/v1/subscriptions/subscribe` (modify — always invoice+PayUp for paid; block if `inactive`)
  - `POST /api/v1/subscriptions/upgrade` (new)
  - `POST /api/v1/subscriptions/downgrade` (new)
  - `GET /api/v1/subscriptions/me/pending-payments` (new — customer's unpaid invoices)
  - `POST /api/v1/subscriptions/payments/:paymentId/pay` (new — resume PayUp checkout for pending invoice)
  - `POST /api/v1/subscriptions` (modify — admin create + `paid` flag)
  - `POST /api/v1/subscriptions/assign` (modify — admin assign + `paid` flag)
  - `POST /api/v1/subscriptions/change` (modify — admin change plan + `paid` flag)
  - `POST /api/v1/subscriptions/:id/deactivate` (modify — block customer self-service)
  - `PATCH /api/v1/subscriptions/:userId/cancel` (existing — allows re-subscribe)
- Page(s) / View(s):
  - customer-portal: subscriptions page (upgrade/downgrade buttons, pending invoices, pay CTA)
  - admin-panel: subscription create/assign/change dialogs (`paid` checkbox, default false)
- Service(s):
  - `SubscriptionsService`, `PaymentCheckoutService`, `SubscriptionActivationProcessor`, `PaymentsService`

---

## Description

Extend subscription billing so **every paid plan change creates a payment invoice** the customer must settle through **PayUp**, with clear **upgrade/downgrade** flows in the Customer Portal and a **`paid` flag** for admin operations. Tighten **cancel vs deactivate** rules for customer self-service.

Builds on change-003 (PayUp + event-driven activation) and change-004 (status, limits, free plan).

---

### 1 — Customer Portal: subscribe, upgrade, downgrade (all payment-gated for paid plans)

#### Subscribe (no active paid subscription, or after cancel)

- Customer selects a plan on `/app/subscriptions`.
- **Free plan** (`priceMonthlyUsd = 0`): unchanged — enqueue `subscription-activation` (no invoice).
- **Paid plan**: backend creates a **`pending` payment invoice** (Payment record) with action `subscribe`, opens PayUp hosted checkout, returns `{ redirectUrl }`. Subscription activates **only after confirmed payment** (existing BullMQ flow).

#### Upgrade

- Customer with an **active** subscription selects a **higher-priced** plan.
- Backend creates a `pending` invoice with action `upgrade`, target `planId`, amount = **new plan's full monthly price** (no proration in v1).
- Returns PayUp `redirectUrl`. On confirmed payment, activation processor **switches plan**, resets period dates, resets monthly usage counters.

#### Downgrade

- Customer with an **active** subscription selects a **lower-priced** paid plan.
- Same invoice + PayUp flow with action `downgrade`.
- On confirmed payment, plan switches to the lower tier.

#### Downgrade to free

- If target plan is free (`priceMonthlyUsd = 0`): skip PayUp; enqueue activation immediately (no invoice).

#### Pending invoices (customer)

- `GET /subscriptions/me/pending-payments` lists the customer's unpaid (`pending`) gateway invoices.
- Customer can pay an existing invoice via `POST /subscriptions/payments/:paymentId/pay` (re-opens or resumes PayUp checkout).
- Subscriptions page shows pending invoices with a **Pay now** button.

#### Blocked states

| Subscription status | Subscribe | Upgrade | Downgrade |
|--------------------|:---------:|:-------:|:---------:|
| none / cancelled | ✓ | — | — |
| active | — (use upgrade/downgrade) | ✓ | ✓ |
| expired | ✓ (treat as new subscribe) | — | — |
| **inactive** (admin deactivated) | **✗** | **✗** | **✗** |

When `inactive`, all self-service plan-change endpoints return `403 SUBSCRIPTION_ADMIN_LOCKED` with message: *"Your subscription was deactivated by an administrator. Please contact support."*

> **Change from change-004:** deactivated users could previously subscribe to upgrade — that is **removed**.

---

### 2 — Admin Portal: assign / create / change with `paid` flag

Admin subscription create, assign, and change-plan dialogs gain a **`paid` checkbox** (default: **`false`**).

#### `paid: false` (default)

- Backend creates a **`pending` payment invoice** for the target plan's monthly price.
- Subscription is **not** activated/changed until the customer pays via PayUp (same activation processor).
- Admin sees the pending invoice on the payments page; customer sees it on their subscriptions page.

#### `paid: true`

- Backend creates a Payment record with `status: paid`, `paidAt: now`, `method: admin`, notes referencing admin actor.
- Subscription is activated/changed **immediately** via the activation processor (synchronous or enqueued — same durable path).
- Audit log records admin user id as actor; payment notes `settled by admin`.

Free plans with `paid: false` still skip invoice (immediate activation).

---

### 3 — Admin cancel vs deactivate

| Admin action | Status set | Customer can self-subscribe / upgrade / downgrade? |
|--------------|------------|:--------------------------------------------------:|
| **Cancel** (`PATCH /subscriptions/:userId/cancel`) | `cancelled` | **Yes** — any plan |
| **Deactivate** (`POST /subscriptions/:id/deactivate`) | `inactive` | **No** — must contact admin |

Cancel clears the subscription end state but leaves the customer eligible to pick a new plan. Deactivate is an admin lock on all self-service billing actions.

Admin **Activate** (`POST /subscriptions/:id/activate`) restores self-service eligibility.

---

### Payment invoice model extensions

Extend `Payment` (payment log / invoice):

| Field | Purpose |
|-------|---------|
| `action` | `subscribe` \| `upgrade` \| `downgrade` \| `admin_assign` |
| `previousPlanId` | Plan before change (upgrade/downgrade) |
| `settledByAdminId` | Admin who marked paid (when `paid: true`) |

Activation processor job payload includes `action` + `planId` so it applies subscribe vs plan-change correctly.

---

### Out of scope

- Proration / credit for mid-cycle upgrades
- Automated recurring billing / subscription renewals
- Email notifications for new invoices (can follow later)
- Refunds on downgrade

---

## Acceptance Criteria

### Customer Portal

1. Paid **subscribe** creates a `pending` invoice and returns PayUp `redirectUrl`; subscription activates only after confirmed payment.
2. **Upgrade** to a higher-priced plan creates a `pending` invoice (action `upgrade`) and activates the new plan after payment.
3. **Downgrade** to a lower-priced paid plan creates a `pending` invoice (action `downgrade`) and switches plan after payment.
4. Downgrade to a **free** plan skips PayUp and activates via event.
5. Subscriptions page shows **Upgrade** / **Downgrade** (or equivalent) based on plan price vs current plan.
6. Customer sees **pending invoices** with amount, plan, action, and **Pay now**.
7. `POST .../payments/:paymentId/pay` resumes PayUp checkout for a pending invoice.
8. User with **`inactive`** subscription cannot subscribe, upgrade, or downgrade — returns `403 SUBSCRIPTION_ADMIN_LOCKED`.
9. User with **`cancelled`** subscription can subscribe to any plan.

### Admin Portal

10. Create / assign / change subscription dialogs include **`paid` checkbox** (default unchecked).
11. `paid: false` → pending invoice created; subscription unchanged until customer pays.
12. `paid: true` → payment marked `paid` with admin actor; subscription activated/changed immediately.
13. Cancel and Deactivate buttons behave per the table above (unchanged endpoints, updated customer-side rules).

### Backend

14. Payment records store `action`, `previousPlanId`, and optional `settledByAdminId`.
15. Activation processor handles `subscribe`, `upgrade`, and `downgrade` actions correctly.
16. Free plans never enter PayUp regardless of entry path (customer or admin with `paid: false`).
17. Idempotent confirm — duplicate PayUp callbacks do not double-activate or double-change plan.

---

## Notes

- Reuses PayUp integration from change-003; no new payment provider.
- "Invoice" = existing `payments` collection record with `status: pending` + PayUp session.
- Upgrade/downgrade amount = full target plan `priceMonthlyUsd` (document in UI: "billed at full monthly price").
- Admin manual payments page continues to list all invoices including admin-settled ones.

---

## Open assumptions (confirm or correct)

1. **No proration** — upgrade/downgrade charges the full new plan monthly price.
2. **One pending invoice per user at a time** — starting a new subscribe/upgrade/downgrade cancels or supersedes any existing `pending` invoice for that user.
3. **Expired** subscriptions are treated like cancelled for re-subscribe (customer picks any plan).
4. Admin `paid: true` uses the admin's user id as `settledByAdminId` and in the audit log.
