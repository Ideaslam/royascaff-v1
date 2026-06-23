# Reconnaissance Report — change-006-workspace-onboarding

## 1. Scope Searched

All three repos: `roya-ai-dynamo-api`, `roya-ai-dynamo-frontend`, `roya-ai-dynamo-frontend-admin`.
Layers: schemas, repositories, services, controllers, guards, decorators, JWT strategy, routes, models, interceptors, app shell.

---

## 2. Feature State

| Feature | State | Notes |
|---------|-------|-------|
| Workspace entity + CRUD | `none` | Zero workspace/tenant/org code anywhere |
| Workspace membership + roles | `none` | Only global `admin/editor/viewer` system roles on User |
| Workspace invitation flow | `none` | — |
| Multi-workspace switching | `none` | — |
| Data isolation (workspace-prefixed collections) | `none` | All data collections are static; scoped by `ownerId` |
| Subscription billing per-workspace | `none` | `UserSubscription.userId` (unique: one per user) |
| Workspace branding + color templates | `none` | — |
| Onboarding wizard | `none` | No `/onboarding` route exists |
| Admin workspace management | `none` | No workspace pages in admin panel |
| Admin color template management | `none` | — |

---

## 3. Existing Code Inventory

### Backend

| Layer | File | Current state | Action needed |
|-------|------|--------------|--------------|
| User schema | `modules/auth/schemas/user.schema.ts` | `{ name, email, role, isActive, refreshTokenHash, ... }` | Add `currentWorkspaceId` |
| JWT payload | `modules/auth/strategies/jwt.strategy.ts` | `{ sub, email, role }` | Add `currentWorkspaceId`, `workspaceSlug`, `workspaceRole` |
| Auth service | `modules/auth/services/auth.service.ts` | `register()` — creates user + issues tokens | Add workspace creation + onboarding init + `redirectTo` |
| UserSubscription schema | `modules/subscriptions/schemas/user-subscription.schema.ts` | `userId` (unique per user) | Replace `userId` → `workspaceId` |
| SubscriptionsService | `modules/subscriptions/services/subscriptions.service.ts` | All methods key on `userId` | Key on `workspaceId`; only workspace-owner can subscribe |
| SubscriptionLimitService | (exists per prior changes) | Per-user limits | Per-workspace limits |
| CsvFile schema | `modules/data/schemas/csv-file.schema.ts` | Static `csvfiles` collection, `ownerId` field | Use dynamic `ws_{slug}_csvfiles`; `ownerId` stays for tracking |
| CsvFileRepository | `modules/data/repositories/csv-file.repository.ts` | Standard model injection | Use `Mongoose Connection` + dynamic model per workspace slug |
| DataService | `modules/data/services/data.service.ts` | `ownerId` filter for all queries | Pass `workspaceSlug`, list = all workspace files (not just own) |
| Dashboard schema | `modules/dashboards/schemas/dashboard.schema.ts` | Static `dashboards` collection, `projectId + ownerId` | Dynamic `ws_{slug}_dashboards`; `projectId` stays as workspace-level project ref |
| ChartWidget / ChartDataCache / DashboardDatasource schemas | dashboards module | Static collections | Dynamic workspace-prefixed collections |
| DashboardsService | `modules/dashboards/services/dashboards.service.ts` | `ownerId` filter | Workspace-scoped; all members see all dashboards |
| BG processors | `modules/ai-processing/` | Job data = `{ fileId, jobId, userId }` | Add `workspaceSlug` to job payload |
| Payment schema | `modules/payments/schemas/payment.schema.ts` | Has `userId`, no `workspaceId` | Add `workspaceId` |
| PaymentCheckoutService | `modules/payments/services/payment-checkout.service.ts` | `initiateSubscriptionCheckout({ userId, ... })` | Switch to workspace billing |
| Common decorators | `common/decorators/` | `@CurrentUser()` returns `{ id, email, role }` | Returns `{ id, email, role, currentWorkspaceId, workspaceSlug, workspaceRole }` |
| App module | `app.module.ts` | No workspace module | Import `WorkspaceModule`, `ColorTemplateModule` |

### Customer Portal

| Layer | File | Current state | Action needed |
|-------|------|--------------|--------------|
| Routes | `app.routes.ts` | `/app/*` behind `authGuard`; no `/onboarding` | Add `/onboarding`, workspace settings routes; add `onboardingGuard` |
| Auth guard | `core/guards/auth.guard.ts` | `authGuard`, `guestGuard`, `adminGuard` | Add `onboardingGuard` |
| AuthService | `core/services/auth.service.ts` | Stores `{ accessToken, refreshToken, user }` | Store workspace context from JWT; handle `redirectTo` after register |
| Auth models | `core/models/auth.models.ts` | `UserProfile { id, name, email, role, ... }` | Add `currentWorkspaceId`, `workspaceSlug`, `workspaceRole` |
| AppShell | `layouts/app-shell/app-shell.ts` | Simple sidebar; no workspace switcher | Add workspace switcher in topbar; add workspace settings nav items |
| Subscriptions service | `core/services/subscriptions.service.ts` | `subscribe({ planId })` keyed on user JWT | Same endpoint but backend now keys on workspace from JWT |
| Pages | `pages/` | No onboarding, no workspace settings | Create: onboarding (4 steps), workspace settings, members, branding |
| Services | `core/services/` | 9 services | Add: `workspace.service.ts`, `workspace-members.service.ts` |

### Admin Panel

| Layer | File | Current state | Action needed |
|-------|------|--------------|--------------|
| Routes | `app.routes.ts` | 6 admin pages | Add `/app/workspaces`, `/app/color-templates` |
| AppShell nav | `layouts/app-shell/app-shell.ts` | 6 nav items | Add Workspaces + Color Templates |
| Models | `core/models/admin.models.ts` | Payment, Subscription, User models | Add `Workspace`, `WorkspaceMember`, `ColorTemplate` interfaces |
| Services | `core/services/` | 8 services | Add: `workspaces-admin.service.ts`, `color-templates.service.ts` |
| Pages | `pages/admin/` | 6 pages | Add: `workspaces/workspaces.page.ts`, `color-templates/color-templates.page.ts` |

---

## 4. Plan-vs-Code Drift

| Plan entry | Code state |
|-----------|------------|
| `profile.md` — no workspace integration | Confirmed — no code exists |
| `services.md` — no workspace services | No code |
| `data-model.md` — no Workspace entity | No schema |

No code-without-plan drift. This is a greenfield addition.

---

## 5. Ripple / Impact Map

| Affected item | Impact | Action |
|--------------|--------|--------|
| `AuthService.register()` | Must auto-create workspace + membership + onboarding | **modify** |
| `AuthService.issueTokens()` | JWT payload must include workspace context | **modify** |
| `JwtStrategy.validate()` | Must return workspace context in request user | **modify** |
| `@CurrentUser()` decorator | Return type expands | **modify** |
| `JwtAuthGuard` | No change needed — standard JWT validation unchanged | — |
| `User` schema | Add `currentWorkspaceId` | **modify** |
| `UserSubscription` schema | Replace `userId` → `workspaceId`; billing per workspace | **modify** |
| `SubscriptionsService` (all methods) | Use `workspaceId` from JWT context | **modify** |
| `SubscriptionActivationProcessor` | Job data needs `workspaceId` instead of/alongside `userId` | **modify** |
| `CsvFile` schema + repository | Dynamic collection name; `ownerId` stays for creation tracking | **modify** |
| `ColumnMetadata` schema + repository | Dynamic collection `ws_{slug}_column_metadata` | **modify** |
| `Dashboard` schema + repository | Dynamic collection `ws_{slug}_dashboards` | **modify** |
| `ChartWidget` schema + repository | Dynamic collection `ws_{slug}_chart_widgets` | **modify** |
| `ChartDataCache` schema + repository | Dynamic collection `ws_{slug}_chart_data_cache` | **modify** |
| `DashboardDatasource` schema + repository | Dynamic collection `ws_{slug}_dashboard_datasources` | **modify** |
| `DataService` | Workspace-scoped lists; pass `workspaceSlug` to repo | **modify** |
| `DashboardsService` | Workspace-scoped; all members see all dashboards | **modify** |
| `ProjectsService` | Projects are workspace-scoped resources | **modify** |
| `Project` schema | Add `workspaceId` or replace ownerId scoping | **modify** |
| `CsvAnalysisProcessor` | Add `workspaceSlug` to job payload | **modify** |
| `DashboardGenerationProcessor` | Add `workspaceSlug` to job payload | **modify** |
| `Payment` schema | Add `workspaceId` | **modify** |
| `PaymentCheckoutService` | `initiateSubscriptionCheckout` → workspace billing | **modify** |
| `app.module.ts` | Import WorkspaceModule, ColorTemplateModule | **modify** |
| Customer portal: auth models | Add workspace fields to UserProfile/AuthResponse | **modify** |
| Customer portal: AuthService | Store workspace context; handle redirectTo | **modify** |
| Customer portal: routes | Add /onboarding + workspace settings routes | **modify** |
| Customer portal: auth guard | Add onboardingGuard | **modify** |
| Customer portal: AppShell | Add workspace switcher + settings nav | **modify** |
| Admin panel: routes | Add workspaces + color-templates | **modify** |
| Admin panel: AppShell nav | Add 2 nav items | **modify** |
| Admin panel: models | Add Workspace, ColorTemplate interfaces | **modify** |

**New items (create):**
- Backend: `WorkspaceModule` (schemas × 6, repos × 6, services × 5, controllers × 5)
- Backend: `ColorTemplateModule` (schema, repo, service, controller)
- Backend: `WorkspaceContextService` (request-scoped; resolves workspace from JWT)
- Backend: `WorkspaceRoleGuard` + `@WorkspaceRoles()` decorator
- Backend: `SampleCsvSeeder`
- Customer portal: 4 new pages (onboarding wizard, workspace settings, members, branding)
- Customer portal: 2 new services (workspace, workspace-members)
- Admin panel: 2 new pages (workspaces, color-templates)
- Admin panel: 2 new services (workspaces-admin, color-templates)

---

## 6. Reuse Opportunities

- `MAIL_PROVIDER` (MailjetProvider) — reuse for invitation emails
- `STORAGE_PROVIDER` (R2StorageProvider) — reuse for workspace logo upload
- Existing `parsePagination()` utility — reuse in workspace repositories
- `AuditLogService` — reuse for workspace-level audit events
- PrimeNG components pattern — reuse existing page patterns for new admin pages
- Existing `OnModuleInit` seeder pattern — reuse for `SampleCsvSeeder`

---

## 7. Risks

| Risk | Mitigation |
|------|-----------|
| Dynamic Mongoose models: potential model caching collision per workspace slug | Cache by collection name in the connection; guard with `connection.models[name]` check |
| JWT size increase (workspace context added) | Keep JWT slim — only `currentWorkspaceId` + `workspaceSlug` + `workspaceRole`; no heavy data |
| All existing service method signatures change (workspaceSlug param everywhere) | Systematic refactor — all controllers already inject `@CurrentUser()`, just add workspace fields |
| Subscription `userId` → `workspaceId` schema change | No migration needed (confirmed fresh start) |
| REQUEST-scoped providers cascade (if `WorkspaceContextService` is REQUEST-scoped, all its consumers must be too) | Avoid REQUEST-scope — pass `workspaceSlug` as an explicit method parameter instead |
| Duplicate workspace slug collision during registration | DB unique index + retry logic in slug generator |

---

## 8. Step 5.1 Direction

| Item | Action |
|------|--------|
| WorkspaceModule (all layers) | **create** |
| ColorTemplateModule (all layers) | **create** |
| SampleCsvSeeder | **create** |
| User schema + repository | **modify** (`currentWorkspaceId`) |
| AuthService + JwtStrategy + JWT payload | **modify** (workspace context in tokens) |
| UserSubscription schema | **modify** (`userId` → `workspaceId`) |
| SubscriptionsService + processor | **modify** (workspace billing) |
| CsvFile/Dashboard/Widget/Cache/Datasource/ColumnMetadata schemas + repos | **modify** (dynamic collections) |
| Project schema | **modify** (add `workspaceId`) |
| DataService + DashboardsService + ProjectsService | **modify** (workspace-scoped) |
| BG processors (CsvAnalysis, DashboardGeneration) | **modify** (add `workspaceSlug` to job data) |
| Payment schema | **modify** (+`workspaceId`) |
| PaymentCheckoutService | **modify** (workspace billing) |
| app.module.ts | **modify** (import new modules) |
| common decorators + guards | **modify** (workspace role support) |
| Customer portal: auth models, service, routes, guard, AppShell | **modify** |
| Customer portal: onboarding + workspace settings pages | **create** |
| Customer portal: workspace + members services | **create** |
| Admin panel: routes, AppShell, models | **modify** |
| Admin panel: workspaces + color-templates pages | **create** |
| Admin panel: workspaces-admin + color-templates services | **create** |
