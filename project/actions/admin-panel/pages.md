# Pages — Admin Panel

## Short Summary

> Routed pages for the **Admin Panel** app (`roya-ai-dynamo-frontend-admin`) of Roya AI Dynamo.
> One app per file: this file covers **only** the Admin Panel. Customer pages live in
> `project/actions/customer-portal/pages.md`. Backend endpoint links match
> `project/actions/backend/endpoints.md`.

App: **Admin Panel** — `roya-ai-dynamo-frontend-admin` — Angular 21 (standalone) platform operations
app (clients, subscriptions, payments, audit, AI logs). Shares the single NestJS backend
(`project/actions/backend/`).

Layouts: `AuthLayout` and `AppShell` (admin sidebar). Guards: `guestGuard` (login also rejects non-admin
client-side), `authGuard`, `adminGuard`. All `/app/*` pages require `authGuard` + `adminGuard`.

Conventions:

- All routes are **lazy** (`loadComponent`). Component paths are relative to the app's `src/app/`.
- Backend paths show the global prefix `/api/v1` (frontend builds them from `environment.apiUrl`).
- UI library: **PrimeNG** + PrimeIcons. Brand: `#ff6043` (main), `#5922ea` (primary), `#282828` (secondary). i18n: EN (LTR) + AR (RTL).

---

## Module: Auth

---

### Page 17

- Name: `Admin Login Page`
- Route: `/auth/login`
- Type: `auth`
- Layout: `AuthLayout`
- Guard: `guestGuard`
- Summary: `Admin sign-in; rejects non-admin accounts.`

#### Main Component

- Component Name: `LoginPage`
- Folder: `src/app/pages/auth/login`
- Files: `login.page.ts`, `login.page.html`

#### Services

- `AuthService - login (throws if user role !== admin)`

#### Backend Endpoints Used

- `POST /api/v1/auth/login - authenticate`

#### Rules / Notes

- Client rejects non-admin users before storing the session.

---

### Page 18

- Name: `Admin Forgot Password Page`
- Route: `/auth/forgot-password`
- Type: `auth`
- Layout: `AuthLayout`
- Guard: `guestGuard`
- Summary: `Request a password-reset email.`

#### Main Component

- Component Name: `ForgotPasswordPage`
- Folder: `src/app/pages/auth/forgot-password`

#### Backend Endpoints Used

- `POST /api/v1/auth/forgot-password`

---

### Page 19

- Name: `Admin Reset Password Page`
- Route: `/auth/reset-password` (`?token=`)
- Type: `auth`
- Layout: `AuthLayout`
- Guard: `guestGuard`
- Summary: `Set a new password from a reset token.`

#### Main Component

- Component Name: `ResetPasswordPage`
- Folder: `src/app/pages/auth/reset-password`

#### Backend Endpoints Used

- `POST /api/v1/auth/reset-password`

#### Rules / Notes

- A `RegisterPage` component exists in this repo but is **not routed** (admin accounts are provisioned, not self-registered).

---

## Module: Admin — Overview

---

### Page 20

- Name: `Overview Page`
- Route: `/app/overview`
- Type: `dashboard`
- Layout: `AppShell`
- Guard: `authGuard` + `adminGuard`
- Summary: `Platform stats and AI cost chart.`

#### Main Component

- Component Name: `OverviewPage`
- Folder: `src/app/pages/admin/overview`
- Files: `overview.page.ts`, `overview.page.html`

#### Services

- `AdminService - overview stats`

#### Backend Endpoints Used

- `GET /api/v1/admin/overview/stats - clients, projects, dashboards, subscriptions, 30-day AI cost`

#### UI Sections / States

- Stat cards + AI cost chart; loading / error.

---

## Module: Admin — Client Management

---

### Page 21

- Name: `Clients Page`
- Route: `/app/clients`
- Type: `admin CRUD`
- Layout: `AppShell`
- Guard: `authGuard` + `adminGuard`
- Summary: `Full client (user) management: CRUD + suspend/reactivate.`

#### Main Component

- Component Name: `ClientsPage`
- Folder: `src/app/pages/admin/clients`
- Files: `clients.page.ts`, `clients.page.html`

#### Services

- `ClientsService - list, create, update, suspend, reactivate, delete`

#### Models / DTOs

- `User`, `CreateUserRequest`, `UpdateUserRequest`

#### Backend Endpoints Used

- `GET /api/v1/users - paginated list (filters)`
- `POST /api/v1/users - create user`
- `PUT /api/v1/users/:id - update user`
- `PATCH /api/v1/users/:id/suspend - suspend`
- `PATCH /api/v1/users/:id/reactivate - reactivate`
- `DELETE /api/v1/users/:id - delete`

#### UI Sections / Actions

- Users table with filters; create/edit dialog; suspend/reactivate toggle; delete confirm.

#### States

- Loading / empty / error

---

## Module: Admin — Subscriptions & Plans

---

### Page 22

- Name: `Subscriptions Page`
- Route: `/app/subscriptions`
- Type: `admin CRUD (tabs)`
- Layout: `AppShell`
- Guard: `authGuard` + `adminGuard`
- Summary: `Manage user subscriptions and subscription plans (two tabs).`

#### Main Component

- Component Name: `SubscriptionsPage`
- Folder: `src/app/pages/admin/subscriptions`
- Files: `subscriptions.page.ts`, `subscriptions.page.html`

#### Services

- `SubscriptionsAdminService - subscriptions + plans CRUD`
- `ClientsService/UsersService - user picker`

#### Models / DTOs

- `SubscriptionPlan`, `UserSubscription`, `CreatePlanRequest`, `CreateSubscriptionRequest`, `ChangeSubscriptionRequest`

#### Backend Endpoints Used

- `GET /api/v1/users - client picker`
- `GET /api/v1/subscriptions - list user subscriptions`
- `POST /api/v1/subscriptions - create`
- `PUT /api/v1/subscriptions/:id - update`
- `POST /api/v1/subscriptions/change - change a user's plan`
- `PATCH /api/v1/subscriptions/:userId/cancel - cancel a user's subscription`
- `GET /api/v1/subscriptions/plans/all - all plans (incl. inactive)`
- `POST /api/v1/subscriptions/plans - create plan`
- `PUT /api/v1/subscriptions/plans/:id - update plan`
- `DELETE /api/v1/subscriptions/plans/:id - delete plan`

#### UI Sections / Actions

- Tab 1: user subscriptions table (assign/change/cancel). Tab 2: plans table (CRUD).

#### States

- Loading / empty / error

---

## Module: Admin — Payments

---

### Page 23

- Name: `Payments Page`
- Route: `/app/payments`
- Type: `admin ledger`
- Layout: `AppShell`
- Guard: `authGuard` + `adminGuard`
- Summary: `Payment log: track manual + PayUp gateway payments; filter, edit, delete.`

#### Main Component

- Component Name: `PaymentsPage`
- Folder: `src/app/pages/admin/payments`
- Files: `payments.page.ts`, `payments.page.html`

#### Services

- `PaymentsService - list, create, update, delete`

#### Models / DTOs

- `Payment` (incl. `gateway`, `providerSessionId`, `planId`), `CreatePaymentRequest`, `UpdatePaymentRequest`, `ListPaymentsQuery`

#### Backend Endpoints Used

- `GET /api/v1/payments - filterable list (userId, status, from, to)`
- `POST /api/v1/payments - record payment`
- `PATCH /api/v1/payments/:id - update payment`
- `DELETE /api/v1/payments/:id - delete payment`

#### UI Sections / Actions

- Filter bar, payments table (now incl. Gateway, Plan, Session reference columns), create/edit dialog, delete confirm.

#### Rules / Notes

- Tracks both the **manual ledger** and the **PayUp gateway** payment log (change-003). Gateway entries
  (`gateway: payup`) are written by the checkout flow; admins read them to track payment → subscription.

---

## Module: Admin — Audit Logs

---

### Page 24

- Name: `Audit Log Page`
- Route: `/app/audit`
- Type: `admin list`
- Layout: `AppShell`
- Guard: `authGuard` + `adminGuard`
- Summary: `Searchable, read-only audit trail of platform actions.`

#### Main Component

- Component Name: `AuditPage`
- Folder: `src/app/pages/admin/audit`
- Files: `audit.page.ts`, `audit.page.html`

#### Services

- `AuditService - list`

#### Backend Endpoints Used

- `GET /api/v1/audit - filterable list (userId, action, entityType, entityId, from, to)`

#### UI Sections / States

- Filter bar + audit table (actor, action, entity, time); loading / empty / error.

#### Rules / Notes

- Read-only; audit entries are immutable.

---

## Module: Admin — AI Logs

---

### Page 25

- Name: `AI Logs Page`
- Route: `/app/ai-logs`
- Type: `admin list + detail`
- Layout: `AppShell`
- Guard: `authGuard` + `adminGuard`
- Summary: `AI usage logs, cost summary, and per-request detail.`

#### Main Component

- Component Name: `AiLogsPage`
- Folder: `src/app/pages/admin/ai-logs`
- Files: `ai-logs.page.ts`, `ai-logs.page.html`

#### Services

- `AiLogsService - cost summary, list, detail`

#### Models / DTOs

- `AiLog - provider, model, tokens, costUsd, durationMs, status`

#### Backend Endpoints Used

- `GET /api/v1/ai-logs/cost-summary - aggregated cost over a period`
- `GET /api/v1/ai-logs - filterable list (provider, model, status, from, to)`
- `GET /api/v1/ai-logs/:id - single log detail`

#### UI Sections / Actions

- Cost summary cards/chart, logs table, detail drawer.

#### States

- Loading / empty / error

---

## Module: Admin — System Settings (profile)

---

### Page 26

- Name: `Admin Profile Page`
- Route: `/app/settings/profile`
- Type: `settings`
- Layout: `AppShell`
- Guard: `authGuard` + `adminGuard`
- Summary: `Edit admin profile (name, language) and change password.`

#### Main Component

- Component Name: `ProfilePage`
- Folder: `src/app/pages/settings/profile`
- Files: `profile.page.ts`, `profile.page.html`

#### Services

- `UsersService - update profile, change password`

#### Backend Endpoints Used

- `PUT /api/v1/users/me - update profile`
- `PUT /api/v1/users/me/password - change password`

#### Rules / Notes

- Initializes from the cached current user (no `GET /users/me` on load).
- Global system settings (`GET/PATCH /api/v1/settings`) are not yet wired to a dedicated admin settings page.

---

## Page Route Map Summary

| # | Page | Route | Layout | Guard |
|---|------|-------|--------|-------|
| 17 | Login | `/auth/login` | AuthLayout | guestGuard |
| 18 | Forgot Password | `/auth/forgot-password` | AuthLayout | guestGuard |
| 19 | Reset Password | `/auth/reset-password` | AuthLayout | guestGuard |
| 20 | Overview | `/app/overview` | AppShell | authGuard + adminGuard |
| 21 | Clients | `/app/clients` | AppShell | authGuard + adminGuard |
| 22 | Subscriptions & Plans | `/app/subscriptions` | AppShell | authGuard + adminGuard |
| 23 | Payments | `/app/payments` | AppShell | authGuard + adminGuard |
| 24 | Audit Log | `/app/audit` | AppShell | authGuard + adminGuard |
| 25 | AI Logs | `/app/ai-logs` | AppShell | authGuard + adminGuard |
| 26 | Profile | `/app/settings/profile` | AppShell | authGuard + adminGuard |

> Page numbers continue from the Customer Portal map (1–16) so cross-app references stay unique.

---

## Known Frontend Gaps (vs. routes/links)

- Admin Panel `RegisterPage` component exists but is not routed.
