# Impact Analysis — Portal Dashboard Redesign

Change: `change-018-portal-dashboard-redesign` · Type: `modify-feature` · Target: `customer-portal` · Repos: `backend+frontend`

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | complete | `payup-api-typescript/src/models/Payment.ts` | All dimensions needed already exist (`appId`, `gateway`, `status`, `currency`, `customerId`, `products[]`, `errorCode`, `completedAt`). **No compound indexes** — only unique `sessionId` / `sessionToken`, so every aggregation is a collection scan |
| Service(s) | partial | `src/services/core/dashboard-service.ts` (`DashboardService`, 245 lines) | One monolithic `getDashboard()`. No range params, no `appId` filter, no deltas, no funnel, no gateway/currency breakdown, no failure grouping, no top products, no caching. `orders` stats aggregate is **date-unbounded** over the whole collection. Mixed-currency `$sum` with no FX conversion |
| Endpoint(s) | partial | `src/routes/merchant-panel/v1/reports/dashboard.controller.ts` | Only `GET /` and `GET /tokens` registered. **`GET /sessions` does not exist** but the frontend calls it → 404. Controller instantiates the service and holds no aggregation logic (layering currently OK) |
| Page(s) | partial | `payup-frontend-customer-control/src/core/pages/dashboard/dashboard.ts` (325 lines) + `dashboard.component.css` (101 lines) | 5 flat stat cards, 5-row session table, static shortcuts, 4 activity counters. **`ChartModule` imported but no `<p-chart>` in the template** — the 30-day series is fetched and discarded. Hardcoded English (no `ngx-translate`). No range selector, no app scoping, page-level error fallback only |
| Frontend service | partial | `src/core/services/dashboard.service.ts` | `getDashboard()` works. `getDashboardSessions()` targets a route that doesn't exist. `getAvailableGateways` / domains methods are unrelated leftovers |

**Feature state: partial** — extend and complete in place; do not duplicate.

## Plan-vs-Code Drift

| Item | Finding |
|------|---------|
| `pages/dashboard.md` L33 | Already documents the un-rendered chart accurately ("typed `Money` but not yet rendered — `ChartModule` is imported and no `<p-chart>` exists"). Plan is honest here; the code is the thing that's wrong |
| `endpoints/gateways.md` EP-DB01 | Documents "direct repo aggregates" — matches code, but `GET /sessions` is undocumented **and** unimplemented while the frontend calls it |
| `data-model.md` §8 | "Indexes: unique `sessionId`, unique `sessionToken`" — accurate; confirms the missing compound indexes |
| Portal route | Dashboard is routed at **`/`**, not `/dashboard` (`app.routes.ts` L36). `pages/dashboard.md` correctly says Route: `/` |
| `/reports` page | `reports.component.ts` (132 lines) is **unrouted dead code** — `app.routes.ts` L58 redirects `/reports` → `/`. It holds hardcoded Arabic dummy data and a comment pointing at `FRONTEND_TODO.md` for the analytics endpoints this change creates. Documented in `pages/dashboard.md` as a legacy placeholder redirect |
| `reportingMoney()` | Labels mixed-currency totals `USD` without conversion — a correctness bug, not documented anywhere in the plan |

## Affected Modules

- **Dashboard (backend)** — 8 new endpoints, 1 new analytics service, retain existing `DashboardService`
- **Dashboard (customer-portal)** — page rebuilt, frontend service extended, i18n keys added
- **Payments (backend)** — read-only aggregation source; `Payment` gains compound indexes (index-only, no fields)
- **Currency (backend)** — reused, unchanged: `ICurrencyService.getRateFromUsd` / `getExchangeRate` for FX normalization

## Impact Classification

### Create new
| Item | Path |
|------|------|
| `DashboardAnalyticsService` | `src/services/core/dashboard-analytics-service.ts` |
| Range/query DTO + zod schema | `src/dto/` or colocated in controller (per `sessions.controller.ts` convention) |
| 8 route handlers | `src/routes/merchant-panel/v1/reports/dashboard.controller.ts` (extend) |
| Dashboard widget components | `src/core/pages/dashboard/` (portal) |
| i18n keys | `src/assets/i18n/en.json`, `ar.json` |

### Complete in place
| Item | Action |
|------|--------|
| `dashboard.controller.ts` | Add `summary`, `timeseries`, `funnel`, `breakdown`, `failures`, `top-products`, `health`, `sessions` routes; keep `/` and `/tokens` |
| `dashboard.service.ts` (frontend) | Add typed methods + interfaces for the 8 endpoints; fix the dead `getDashboardSessions()` |
| `Payment.ts` | Add 3 compound indexes |
| `dashboard.ts` (page) | Rebuild template + component; finally render charts |

### Modify (ripple)
| Item | Reason |
|------|--------|
| `dashboard.component.css` | Rewritten for the bento layout and reference-derived component language |
| `styles.css` | Only if shared utilities are needed; prefer component-scoped CSS. No new tokens (chart colors derive from existing `--pu-*` semantics) |
| `DashboardService` (backend) | Left functional for the deprecated `GET /` endpoint. Not deleted — `api-docs` references EP-DB01 |

### Ripple set — judged safe / no action
| Item | Verdict |
|------|---------|
| Admin panel dashboard | Separate service (`admin-dashboard-service.ts`) and separate endpoint. Explicitly out of scope; untouched |
| `reports.component.ts` | Unrouted dead code. Out of scope this change; the new endpoints are what it was waiting for |
| Other portal pages | No shared component is modified; all new CSS is component-scoped |
| `transaction-session-service.ts` | Not modified — the new `sessions` endpoint reads via `PaymentRepository` following the same `appId`+`merchantId` filter convention |
| `api-docs` | EP-DB01 stays valid. New endpoints are additive; OpenAPI update is a separate change (not required for PASS here) |

## Reuse Opportunities

| Existing asset | Reuse |
|----------------|-------|
| `CacheService` (`src/utils/cache-service.ts`) | `getOrSet<T>(key, fn, ttlSeconds)` — exactly the short-TTL pattern needed. Already used by `app-service.ts` with a 120s TTL |
| `ICurrencyService` | `getRateFromUsd` / `getExchangeRate` for FX normalization |
| `money/api.ts` | `toMoney`, `reportingMoney` for `Money` response shaping |
| `validate()` middleware + zod | Query-param validation, per `sessions.controller.ts` (`appId: z.string().optional()`) |
| `ApiService.get<T>(endpoint, {params})` | Supports params — no manual `URLSearchParams` needed (current service builds them by hand) |
| `AppContextService.selectedApp$` | App scoping + "All apps" toggle |
| `MoneyPipe`, `SkeletonComponent` | Money rendering and per-widget loading states |
| `chart.js@4.5.1` + PrimeNG `ChartModule` | Charts, no new dependency |

## Plan Docs to Update

- [x] `actions/backend/endpoints/gateways.md` — Dashboard module: added EP-DB03…EP-DB10 with shared params, response envelope, auth, caching; EP-DB01 marked deprecated
- [x] `actions/backend/endpoints/_index.md` — gateways count 87 → 95, total ~199 → ~207
- [x] `actions/backend/services/core.md` — added SVC-DB02 `DashboardAnalyticsService`; SVC-DB01 annotated deprecated-but-retained
- [x] `actions/backend/services/_index.md` — core count 20 → 21, total ~76 → ~77
- [x] `actions/customer-portal/pages/dashboard.md` — Dashboard Page entry rewritten (9 widgets, parallel load model, controls, empty state, i18n, RTL, design reference)
- [x] `plan/data-model.md` — §8 Payment: Indexes line now lists the 3 compound indexes
- [x] `plan/modules.md` — Module 11 features restructured: Dashboard Analytics (new), Dashboard Stats (legacy/deprecated), Reports Page (unrouted); Currency added to depends-on
- [x] `project/rules.md` — added **RULE-025 · Reporting Totals Are FX-Normalized**
- [x] `project/description.md` — §3 Dashboard Analytics feature; §8 business rule 7 (RULE-025)

## Risk

**Complexity: Medium-High** · **Cross-module: Y** (backend + frontend, reads Payments/Apps/Products/Tokens/Gateways/Currency) · **Migration: N** (no data migration; index builds only)

| Risk | Mitigation |
|------|------------|
| Index build on a large `Payment` collection could block | Indexes are additive; build in background. Mongoose `autoIndex` behavior must be confirmed for production before deploy |
| FX normalization changes reported revenue numbers | Intended — current numbers are wrong. Surface the reporting currency and a stale-rate indicator so the change is visible, not silent |
| 8 parallel requests per page load | Short-TTL Redis cache + date-bounded, indexed pipelines. Each endpoint returns a small payload |
| Aggregations on `products[]` require `$unwind` | Bound by date range and `merchantId` first, so the unwind operates on a small working set |
| Deprecated `GET /` left in place | Retained deliberately for `api-docs`/back-compat; flagged for a later removal decision |

## Recommendation

- **Create**: `DashboardAnalyticsService`, 8 endpoints, 3 `Payment` indexes, dashboard widget components, i18n keys
- **Complete**: `dashboard.controller.ts`, frontend `dashboard.service.ts`, `dashboard.ts` page, `dashboard.component.css`
- **Modify (ripple)**: 4 plan docs (endpoints, services, pages, data-model)
- **Sequence**: backend first (service → indexes → endpoints), verify endpoints respond, then frontend page against live data
