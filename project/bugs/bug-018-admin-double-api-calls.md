# Bug #018 — Admin panel endpoints called twice

## Status
**DONE** — Confirmed by user 2026-07-08

## Reported
- **Date**: 2026-07-08
- **Severity**: medium
- **Affected area**: admin-portal pages (HTTP data loading, UI consistency)

## Description
All API endpoints in the admin panel appeared to be called twice when opening admin pages (visible in browser Network tab). Subscriptions page additionally fired three separate requests on load (plans, workspaces, list).

## Expected Behavior
Each page should fetch its data once on initial load. Filter dropdown data should come from a single lite endpoint; table data from one list endpoint.

## Steps to Reproduce
1. Log in to the admin panel.
2. Open any admin list page (Users, Workspaces, Clients, Payments, Audit, AI Logs, Subscriptions).
3. Observe duplicate identical API requests in the Network tab.

## Root Cause
1. **Duplicate list fetches:** PrimeNG lazy `p-table` auto-fires `onLazyLoad` on init while pages also called `load()` from `ngOnInit`, causing two identical list API calls.
2. **Multi-endpoint page loads:** Several pages fetched separate endpoints for filters/supporting data (e.g. subscriptions loaded `plans/all`, `workspaces?limit=500`, and `subscriptions` on init).

**Runtime evidence (debug session 40dd89):**
- `users.page.ts:ngOnInit` → `load()` → `GET /users`
- `users.page.ts:onLazyLoad` → `load()` → `GET /users` again 10ms later
- No auth interceptor 401-retry involved

## Fix Applied

### 1. Remove duplicate `ngOnInit` loads (frontend)
Removed redundant `load()` from `ngOnInit` on lazy-table pages; initial data fetch is handled solely by `onLazyLoad`.

### 2. Consolidated admin API routes (backend + frontend)
Added `/admin/{resource}/filters` (lite projection) and `/admin/{resource}` (full list) endpoints:

| Resource | Filters | List |
|----------|---------|------|
| subscriptions | `GET /admin/subscriptions/filters` | `GET /admin/subscriptions` |
| clients | `GET /admin/clients/filters` | `GET /admin/clients` (+ `subscriptionStatus`) |
| users | `GET /admin/users/filters` | `GET /admin/users` |
| workspaces | `GET /admin/workspaces/filters` | `GET /admin/workspaces` |
| payments | `GET /admin/payments/filters` | `GET /admin/payments` |
| audit | `GET /admin/audit/filters` | `GET /admin/audit` |
| ai-logs | `GET /admin/ai-logs/filters` | `GET /admin/ai-logs` (+ `summary`) |

### 3. UI consistency (frontend)
- Fixed search field icon positioning globally (subscriptions page pattern).
- Moved shared form/layout/table styles to `styles.css`; components retain only page-specific styles.

**Subscriptions page load after fix:** `GET /admin/subscriptions/filters` + `GET /admin/subscriptions` (2 calls total).

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced (API + frontend builds pass)
- [x] User confirmed fix resolves the issue

**Confirmed**: 2026-07-08

## Related Files

**Backend**
- `roya-ai-dynamo-api/src/modules/admin/admin-pages.service.ts`
- `roya-ai-dynamo-api/src/modules/admin/admin.controller.ts`
- `roya-ai-dynamo-api/src/modules/admin/admin.module.ts`
- `roya-ai-dynamo-api/src/modules/subscriptions/repositories/subscription.repository.ts`
- `roya-ai-dynamo-api/src/integrations/ai/repositories/ai-log.repository.ts`

**Frontend — services**
- `roya-ai-dynamo-frontend-admin/src/app/core/services/subscriptions-admin.service.ts`
- `roya-ai-dynamo-frontend-admin/src/app/core/services/clients.service.ts`
- `roya-ai-dynamo-frontend-admin/src/app/core/services/users.service.ts`
- `roya-ai-dynamo-frontend-admin/src/app/core/services/workspaces-admin.service.ts`
- `roya-ai-dynamo-frontend-admin/src/app/core/services/payments.service.ts`
- `roya-ai-dynamo-frontend-admin/src/app/core/services/audit.service.ts`
- `roya-ai-dynamo-frontend-admin/src/app/core/services/ai-logs.service.ts`
- `roya-ai-dynamo-frontend-admin/src/app/core/models/admin.models.ts`

**Frontend — pages**
- `roya-ai-dynamo-frontend-admin/src/app/pages/admin/users/users.page.ts`
- `roya-ai-dynamo-frontend-admin/src/app/pages/admin/workspaces/workspaces.page.ts`
- `roya-ai-dynamo-frontend-admin/src/app/pages/admin/clients/clients.page.ts`
- `roya-ai-dynamo-frontend-admin/src/app/pages/admin/payments/payments.page.ts`
- `roya-ai-dynamo-frontend-admin/src/app/pages/admin/audit/audit.page.ts`
- `roya-ai-dynamo-frontend-admin/src/app/pages/admin/ai-logs/ai-logs.page.ts`
- `roya-ai-dynamo-frontend-admin/src/app/pages/admin/subscriptions/subscriptions.page.ts`

**Frontend — global styles**
- `roya-ai-dynamo-frontend-admin/src/styles.css`
- `roya-ai-dynamo-frontend-admin/src/app/pages/settings/profile/profile.page.scss`
