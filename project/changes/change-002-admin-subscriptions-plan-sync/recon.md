# Reconnaissance Report — change-002-admin-subscriptions-plan-sync

## 1. Scope Searched

Affected module: **Admin — Subscriptions & Plans**
Repos searched: `roya-ai-dynamo-frontend-admin`, `roya-ai-dynamo-api`

---

## 2. Feature State

### Feature: Manage Subscription Plans (Admin)
**State: `complete`** — full CRUD implemented in the Plans tab of the admin subscriptions page.

### Feature: Manage User Subscriptions (Admin)
**State: `complete`** — full lifecycle management (create, edit, change plan, cancel, paginated list) implemented in the User Subscriptions tab.

---

## 3. Existing Code Inventory

### Admin Frontend — `src/app/pages/admin/subscriptions/subscriptions.page.ts`

Single-file standalone component (`SubscriptionsPage`) implementing a two-tab layout. No separate child component files (all inline):

| Concern | Implementation |
|---------|----------------|
| User Subscriptions tab | Lazy-loaded p-table, status filter, "New Subscription" button |
| Create Subscription | Inline dialog with userId (select from clients), planId, startDate, endDate, status, notes |
| Edit Subscription | Same dialog, pre-populated, calls PUT |
| Change Plan | Separate inline dialog, calls POST /change |
| Cancel Subscription | Confirmation dialog, calls PATCH /:userId/cancel |
| Plans tab | p-table of all plans (incl. inactive) |
| Create/Edit Plan | Reactive-form dialog with all plan fields |
| Delete Plan | Confirmation, calls DELETE |

### Admin Frontend — `src/app/core/services/subscriptions-admin.service.ts`

`SubscriptionsAdminService` calls 10 backend endpoints:

| Method | Called Endpoint |
|--------|----------------|
| `listAllSubscriptions(filters)` | `GET /subscriptions` |
| `getById(id)` | `GET /subscriptions/:id` |
| `create(data)` | `POST /subscriptions` |
| `update(id, data)` | `PUT /subscriptions/:id` |
| `listAllPlans()` | `GET /subscriptions/plans/all` |
| `createPlan(data)` | `POST /subscriptions/plans` |
| `updatePlan(id, data)` | `PUT /subscriptions/plans/:id` |
| `deletePlan(id)` | `DELETE /subscriptions/plans/:id` |
| `changeSubscription(userId, planId)` | `POST /subscriptions/change` |
| `cancelSubscription(userId)` | `PATCH /subscriptions/:userId/cancel` |

All calls use `${environment.apiUrl}` — no direct external URLs.

### Admin Frontend — `src/app/core/models/subscription.models.ts`

Defines `SubscriptionPlan` and `UserSubscription` interfaces matching the backend schema.

### Backend — no changes needed

All 10 endpoints are implemented and admin-guarded. Covered by existing endpoint entries in `endpoints.md`.

---

## 4. Plan-vs-Code Drift (the core issue)

| Plan entry (pages.md Page 16) | Actual code | Gap |
|-------------------------------|-------------|-----|
| Component: `AdminSubscriptionsPage` | Component: `SubscriptionsPage` | Wrong name |
| Files: `subscriptions.page.ts`, `.html`, `.scss` | Files: `subscriptions.page.ts` (inline template + styles) | Separate HTML/SCSS files don't exist |
| Child components: `AssignSubscriptionDialogComponent`, `SubscriptionsTableComponent` | No separate child components — all inline in one file | Wrong structure |
| Service: `AdminSubscriptionsService` | Service: `SubscriptionsAdminService` | Wrong name |
| Model: `SubscriptionListItemDto`, `AssignSubscriptionRequest` | Models: `UserSubscription`, `SubscriptionPlan`, `CreateSubscriptionPayload`, `UpdateSubscriptionPayload` | Wrong names |
| Backend endpoints: 2 listed | Backend endpoints: 10 used | 8 endpoints missing from plan |
| UI: single assign workflow | UI: two-tab layout (User Subscriptions + Plans) with full CRUD | Severely incomplete |
| Summary: "view and assign subscription plans" | Actual: full subscription + plan management | Understates scope |

---

## 5. Ripple / Impact Map

| Item | Impact | Action |
|------|--------|--------|
| `pages.md` Page 16 | Major drift from actual implementation | **Rewrite entry to match code** |
| `features.md` Admin — Subscriptions & Plans | Already marked fully implemented | **No change** |
| `endpoints.md` | All 10 endpoints exist (Endpoints 55–67 + system entries) | **No change** |
| `services.md` | No backend service change | **No change** |
| Backend code | Fully implemented | **No code change** |
| Admin frontend code | Fully implemented | **No code change** |

---

## 6. Step 5.1 Direction

| Item | Action |
|------|--------|
| `pages.md` Page 16 | **Rewrite** (complete plan-vs-code drift correction) |
| All other docs and all code | **No change** |
