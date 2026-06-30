# Change Request — Admin Panel (Initial Build)

## Metadata
- **date**: 2026-06-30
- **change-type**: new-app
- **target-app**: admin-panel
- **affected-repos**: backend, payup-frontend-admin, customer-portal (cleanup)
- **priority**: high

## Scope
- **Module(s)**: Admin Panel (Module 14)
- **Feature(s)**: All 9 features — Dashboard, Gateway Onboarding, Audit Logs, Currencies, Libraries, Merchants, Payments Overview, Notifications Health, Available Gateways Catalog
- **Endpoint(s)**: New `/api/admin/v1/*` namespace (~25 endpoints)
- **Page(s)/View(s)**: admin-panel — 12+ pages (see `impact.md`)
- **Service(s)**: New `services/admin/*` + migrate existing admin logic

## Description

Build a dedicated platform admin panel as a new Angular app (`payup-frontend-admin`), copying the customer-control shell (layout, PrimeNG theme, auth, i18n) and removing merchant-specific modules.

Backend: implement `/api/admin/v1/*` with `requireAdmin` on all routes. Migrate admin-only operations currently scattered on `/api/merchant/v1/*` (audit logs, currency/library CRUD, gateway request admin actions). Add new platform-scoped services for merchants list, cross-merchant payments, notifications health, and available gateway catalog admin CRUD.

Remove gateway admin Kanban board from customer portal after admin app ships.

Login: **`POST /api/admin/v1/auth/login`** via new `AdminAuthService` (wraps `AuthService`, enforces `role: admin`); admin frontend calls only `/api/admin/v1`. `adminGuard` on all app routes after login.

## Acceptance Criteria

1. `payup-frontend-admin` runs on port 4401 locally with admin-only navigation
2. `/api/admin/v1` mounted with `requireAdmin` on every route
3. All 8 discovery modules have working admin pages and API backing
4. Non-admin users cannot access admin panel (redirect to access page)
5. Gateway admin board removed from customer portal
6. `profile.md`, `modules.md`, `roles-and-authorization.md`, `data-model.md`, `rules.md` updated
7. Admin merchant suspend blocks login; role changes audited
8. Payments overview is read-only (no admin refund in V1)

## Notes

- No new MongoDB collections for V1
- Disputes/settlements/risk remain out of scope
- Phase 1 (planning) complete — Phase 2 generates action specs; Phase 3 builds code
