# Impact Analysis — Admin Panel (Phase 1 Planning)

**Date:** 2026-06-30  
**Phase:** 1 complete → ready for Phase 2 (Actions)

---

## Feature State (code recon)

| Area | State | Action |
|------|-------|--------|
| `/api/admin/*` router | `none` (empty stub) | **Create** full `/api/admin/v1` module |
| Admin on merchant API | `partial` | **Migrate** audit, currencies, libraries, gateway admin |
| Gateway `isAdmin()` helper | `broken` | **Fix** — uses `user.isAdmin` instead of `role === 'admin'` |
| Customer portal admin board | `complete` | **Move** to admin app, **remove** from portal |
| Merchant admin services | `partial` | AuditService, CurrencyService, LibraryService, GatewayRequestService exist |
| AvailableGateway admin CRUD | `none` | **Create** admin endpoints + service methods |
| Cross-merchant payments | `none` | **Create** AdminPaymentService |
| Merchants management | `none` | **Create** AdminMerchantService |
| Notifications health (platform) | `none` | **Create** AdminNotificationHealthService |
| Admin dashboard aggregations | `none` | **Create** AdminDashboardService |
| `payup-frontend-admin` repo | `none` | **Create** — copy customer-control shell |

---

## Planning Docs Updated (Phase 1)

| Document | Changes |
|----------|---------|
| `project/profile.md` | Added `admin-panel` app, URLs, ports, CORS |
| `project/description.md` | Admin panel in scope; workflow + success criteria |
| `project/plan/modules.md` | Module 14 — Admin Panel (9 features) |
| `project/plan/roles-and-authorization.md` | Admin API routes, page access, guards |
| `project/plan/data-model.md` | Admin entity usage table; no new collections |
| `project/rules.md` | RULE-016 Admin API Isolation |

---

## Phase 2 Deliverables (next step)

### Backend — `project/actions/backend/`

| Artifact | Content |
|----------|---------|
| `services/admin.md` | **AdminAuthService**, AdminDashboardService, AdminMerchantService, AdminPaymentService, AdminGatewayRequestService, AdminNotificationHealthService, AdminAvailableGatewayService |
| `endpoints/admin.md` | ~28 endpoints under `/api/admin/v1` (incl. `/auth/*`) |
| Update `endpoints/_index.md` | Register admin module |
| Update `services/_index.md` | Register admin services |

### Frontend — `project/actions/admin-panel/`

| Artifact | Content |
|----------|---------|
| `pages/_index.md` | Registry |
| `pages/admin-panel.md` | All admin pages spec |

### Admin pages (planned)

| Route | Module | Endpoints |
|-------|--------|-----------|
| `/` | Dashboard | `GET /dashboard` |
| `/merchants` | Merchants | `GET /merchants` |
| `/merchants/:id` | Merchants | `GET /merchants/:id`, `PATCH .../status`, `PATCH .../role` |
| `/gateway-requests` | Gateway onboarding | `GET /gateway-requests`, admin actions |
| `/gateway-requests/:id` | Gateway onboarding | detail + status/corrections/forward |
| `/audit-logs` | Audit | `GET /audit-logs` |
| `/currencies` | Platform config | currency admin CRUD |
| `/libraries` | Platform config | library admin CRUD |
| `/payments` | Payments overview | `GET /payments` |
| `/payments/:sessionId` | Payments overview | `GET /payments/:sessionId` |
| `/notifications/deliveries` | Notifications health | platform deliveries |
| `/notifications/webhooks` | Notifications health | disabled/failing endpoints |
| `/gateways/catalog` | Available gateways | catalog CRUD |
| `/auth/login` | Auth | `POST /auth/login`, `POST /auth/2fa/verify` |
| `/auth/access` | Auth | non-admin denied (no API) |

---

## Phase 3 Build (after Phase 2 + confirmation gate)

### Backend code

- `src/routes/company-admin/v1/auth/` — admin login controller
- `src/services/admin/admin-auth-service.ts` — wraps `AuthService`, enforces admin role + active account
- Wire `admin.routes.ts` → `/api/admin/v1`
- Fix gateway-requests `isAdmin()` during migration

### Frontend code

- Copy `payup-frontend-customer-control` → `payup-frontend-admin`
- Strip merchant pages/services/menu items
- Add admin services + pages
- `environment.*.ts` → `apiUrl: .../api/admin/v1`
- Port **4401**

### Customer portal cleanup

- Remove `/gateway-requests/admin` route + board component references from menu
- Remove `adminGuard` usage from portal (optional — no admin routes remain)

---

## Risks

| Risk | Mitigation |
|------|------------|
| Duplicate admin endpoints during migration | Deprecate merchant admin routes after admin API live |
| Gateway `isAdmin()` bug | Fix as part of gateway request migration |
| Cross-merchant PII exposure | Read-only payments; mask sensitive fields in admin DTOs |
| Large frontend copy | Strip incrementally; keep only layout + auth + shared core |

---

## Ripple Effects

- OpenAPI (`api-docs/openapi/payup-merchant.yml`) — add admin spec or separate file in Phase 2/3
- `blueprint-review.md` — update deferred admin item when complete
- CORS `.env` — add `admin.payupconnect.com` and `localhost:4401` in build phase

---

**Phase 1 status: COMPLETE**  
**Phase 2 status: COMPLETE** — see `project/actions/backend/services/admin.md`, `endpoints/admin.md`, `project/actions/admin-panel/pages/`

**Next:** Phase 3 — Pre-Build Confirmation Gate → implement backend + `payup-frontend-admin`
