# Verification — Portal Dashboard Redesign

**Status: PASS** (automated + static + live backend). Browser-rendered visual/RTL pass **not run** — no merchant credentials available this session; see *Not Verified* below.

Repos: `payup-api-typescript`, `payup-frontend-customer-control`

## Plan Consistency
- [x] All 8 new endpoints exist in `endpoints/gateways.md` (EP-DB03…EP-DB10); counts updated in `endpoints/_index.md` (87→95, 199→207)
- [x] `DashboardAnalyticsService` documented as SVC-DB02 in `services/core.md`; counts updated in `services/_index.md` (20→21, 76→77)
- [x] Page spec rewritten in `customer-portal/pages/dashboard.md` (9 widgets, parallel load, controls, empty state, i18n, RTL)
- [x] Three compound indexes recorded in `plan/data-model.md`
- [x] RULE-025 (FX-normalized reporting totals) added to `rules.md` and referenced from `description.md`
- [x] `verify-plan.md` — all consistency checks PASS

## Code Verification

### Backend
- [x] `npx tsc --noEmit` — clean, zero errors
- [x] Layering per `backend-rule.md`: controller → service → repository → model. `dashboard.controller.ts` contains no aggregation and no Mongo syntax; it parses Zod schemas, calls `resolveScope`, and delegates
- [x] All pipeline syntax confined to `PaymentRepository`; FX/shaping/caching confined to `DashboardAnalyticsService`
- [x] Every route guarded by `authMiddleware` + `merchantContext`; `merchantId` read from verified context, never from the query
- [x] Route registration confirmed live — all 8 return `401` (auth required), not `404`
- [x] Zod validation on every query param; `appId` and `reportingCurrency` format-checked

### Frontend
- [x] `npx ng build --configuration development` — success, zero errors, zero warnings
- [x] No component performs direct HTTP; all calls go through `DashboardService` → `ApiService`
- [x] No hardcoded display strings in `dashboard.html` (audited — every text node is a `translate` binding)
- [x] `en.json` / `ar.json` both gained a `dashboard` namespace (27 groups each); no pre-existing key altered or lost (diffed against backup)
- [x] All 36 referenced `--pu-*` tokens exist in `styles.css`; no new color literals except the dark feature card's neutral surfaces
- [x] All 24 referenced PrimeIcons names exist (`pi-rocket` was invalid and was replaced with `pi-bolt`)
- [x] No new charting dependency — uses the installed `chart.js` via PrimeNG `p-chart`, plus inline SVG for sparklines
- [x] Linter clean across all new files

## Live Evidence

Run against the local database (merchant `6a8c1069…`, 7 payments, SAR-denominated).

### FX normalization (RULE-025)
```
CURRENCY: SAR native=750.00 SAR  norm=199.72 USD
normalized total: 199.72 USD
```
750.00 SAR → 199.72 USD implies 3.755 SAR/USD, matching the stored rate. Mixed-currency minor units are **not** summed raw.

### Index usage (AC-13)
```
merchantId_1_createdAt_-1            {"merchantId":1,"createdAt":-1}
merchantId_1_status_1_createdAt_-1   {"merchantId":1,"status":1,"createdAt":-1}
merchantId_1_appId_1_createdAt_-1    {"merchantId":1,"appId":1,"createdAt":-1}

summary / timeseries   → IXSCAN via merchantId_1_status_1_createdAt_-1
funnel / sessions      → IXSCAN via merchantId_1_createdAt_-1
app-scoped             → IXSCAN via merchantId_1_appId_1_createdAt_-1
```
No `COLLSCAN` on any analytics query shape.

### Caching (AC-12)
```
cold (cache miss):  689ms   → key present after: true
warm (cache hit):     1ms
refresh=true:       259ms   (recomputed, cache bypassed)
```

### Parallelism (AC-15)
All 10 service calls issued concurrently completed in **924 ms** total — less than the sum of their individual costs, confirming they do not serialize.

### Live browser traffic (AC-9, AC-10, AC-15)
Captured from the running API while the portal rendered the page:
```
13:15:50.001  GET /funnel?range=30d&appId=6a8c11ae…             200
13:15:50.001  GET /breakdown?range=30d&appId=6a8c11ae…&facet=gateway  200
13:15:50.00x  GET /health?range=30d&appId=6a8c11ae…             200
13:15:50.00x  GET /failures?range=30d&appId=6a8c11ae…&limit=5   200
13:15:50.681  GET /top-products?range=30d&appId=6a8c11ae…&limit=5     200
13:15:50.xxx  GET /sessions?range=30d&appId=6a8c11ae…&page=1&limit=6  200
```
Six endpoints confirmed `200` against a real authenticated session with `appId` scoping applied; no `4xx` or `5xx` on any request in the capture. `funnel` and `breakdown` are logged in the **same millisecond**, confirming the page dispatches in parallel from the browser rather than serializing.

## Acceptance Criteria

### Endpoints
- [x] 1 · `/summary` — net revenue, successful count, success rate, AOV, each with value + previous + `deltaPct` vs the equal-length preceding window
- [x] 2 · `/timeseries` — revenue and count buckets; `granularity=day|week` honored (`%Y-%m-%d` / `%G-W%V`), zero-filled so charts have no holes
- [x] 3 · `/funnel` — initiated/pending/completed with per-stage `dropOffPct`. Stages are monotonically narrowing reach sets, verified `7 → 4 → 4`
- [x] 4 · `/breakdown` — `facet=status|gateway|currency`; gateway facet carries `count`, `successRate`, `avgAmount`
- [x] 5 · `/failures` — grouped by `errorCode` (falling back to `error`), ordered by frequency
- [x] 6 · `/top-products` — ranked by revenue with `units`
- [x] 7 · `/health` — active app/gateway/token/verified-domain counts plus `hasPayments`; returned `5/5 complete`
- [x] 8 · `/sessions` — paginated recent sessions. **The frontend's previously 404-ing call now resolves** (`{page:1, limit:3, total:7, pages:3}`)
- [x] 9 · Shared `range` (`7d`/`30d`/`90d`) or explicit `from`/`to`, plus optional `appId`; omitting `appId` aggregates across all apps
- [x] 10 · Guarded by `authMiddleware` + `merchantContext`; `merchantId` always the first `$match` term, so a foreign `appId` intersects to zero results
- [x] 11 · All money FX-normalized to one reporting currency via `ICurrencyService`; `meta.fxStale` + `meta.fxAsOf` exposed and surfaced in the header
- [x] 12 · Redis-cached at 60 s TTL; `refresh=true` recomputes and overwrites
- [x] 13 · Three compound indexes declared and used (`IXSCAN`, evidence above)
- [x] 14 · Controllers hold no aggregation logic

### Page
- [x] 15 · 9 widgets render; requests fire together and resolve independently (no `forkJoin` — each widget owns a `Slot`)
- [x] 16 · A failed request sets only that `Slot` to `error`, showing an inline retry; siblings are unaffected
- [x] 17 · Zero-payment merchants get `app-setup-guide` instead of zeroed charts, gated on the health probe so it cannot flash mid-load
- [x] 18 · Range and app/"All apps" toggles re-request and update every widget; granularity re-requests only the revenue chart
- [x] 19 · All strings via `ngx-translate` with `en` + `ar` entries
- [~] 20 · RTL — implemented via logical CSS properties, `reverse`/`position` on chart scales, `rtl: true` on tooltips, and mirrored sparkline/chevron. **Not visually confirmed in a browser** (see below)
- [x] 21 · Only `--pu-*` tokens; no new charting dependency
- [x] 22 · No direct HTTP in components

## Defects Found and Fixed During Build

1. **`completedAt` is unreliable as a time axis.** `webhook-service.ts` flips `status` to `completed` without stamping `completedAt`; only `payment-status-sync-service.ts` sets it. The planned `{merchantId, status, completedAt}` index and a `completedAt` filter would have silently dropped every webhook-completed payment from revenue. Switched the whole analytics time axis to `createdAt` (always set by `{ timestamps: true }`), changed the index to `{merchantId, status, createdAt}`, and recorded the constraint in `plan/data-model.md`.

2. **Duplicate rows from split currency-exponent buckets.** Pipelines group by `{currency, currencyExponent}` so each bucket converts at the scale its amounts were stored with, but older payments carry no exponent snapshot — so `$group` split one currency into a `2` bucket and a `null` bucket, surfacing `SAR` twice and the same product twice. Conversion was already correct per bucket; the presentation fold now merges by currency code and by `storeCode`, rescaling native totals to the currency's canonical exponent before adding. `sumTopProducts` now returns a bounded candidate set (`limit × 5`, capped at 100) so merging cannot truncate the true top N.

3. **Delta pill conflated direction with desirability.** A single `direction` drove both the arrow and the color, so an inverted metric (`higherIsBetter=false`) would render an up-arrow for a falling number. Split into `trend` (arrow) and `tone` (color).

4. **Invalid icon.** `pi-rocket` does not exist in the installed PrimeIcons; replaced with `pi-bolt`.

5. **Guessed RTL icon codepoint.** An `[dir="rtl"] … ::before { content: "\e9a4" }` override would have rendered an arbitrary glyph; replaced with a `scaleX(-1)` transform.

## Pre-Existing Defect Amplified by This Change

**Rate limiter fails open on every request.** `rate-limiter-flexible` logs `this.client.rlflxIncr is not a function` and falls back to `fallbackMode: 'allow'` (`rate-limit-service.ts:137`), so requests succeed but are effectively unlimited. Cause is a client-API mismatch: the installed `redis` is v5, whose custom-command/script registration differs from what `rate-limiter-flexible` expects, so its Lua `rlflxIncr` command never registers.

This is **not caused by this change** — it affects every rate-limited endpoint. But the dashboard now issues 9 requests per load instead of 2, so the error rate roughly quadruples and it is far more visible in logs. Worth its own bug entry; **not fixed here** (out of scope, and rate limiting is a security control that deserves its own verification).

## Not Verified

- **Visual layout and RTL pass.** Endpoint behavior *is* now confirmed from a real authenticated browser session (see live traffic above), but nobody has looked at the rendered page: spacing, chart legibility, the bento grid at intermediate widths, and the Arabic/RTL mirror remain unconfirmed. `/summary` and `/timeseries` were also outside the captured log window, so they are verified at the service layer but not yet observed over HTTP.
- The merchant login could not be exercised directly by the agent — the only seeded credentials in the repo belong to the *admin* panel (`seed-admin-user.ts`) and are rejected by `/api/merchant/v1/auth/login`. Backend behavior was verified by driving `DashboardAnalyticsService` against the live database instead.
- **Legacy `/reports` page.** `reports.component.ts` remains a hardcoded mockup and is unreachable (the `/reports` route redirects). Left untouched — out of scope, flagged in `impact.md`.
- **`profile.md` palette drift.** Brand primary is listed as coral `#ff6b35` while the portal ships indigo `#4f46e5`. Per the user's "use my colors", the portal tokens were followed; the doc drift is unchanged.
