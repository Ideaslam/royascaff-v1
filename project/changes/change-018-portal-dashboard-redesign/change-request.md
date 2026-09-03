# Change Request

## Metadata
- **date**: 2026-09-03
- **change-type**: modify-feature
- **target-app**: customer-portal
- **affected-repos**: backend+frontend
- **priority**: high

## Scope
- Module(s): Reports/Dashboard (portal), Payments (read-only aggregation source)
- Feature(s): Merchant dashboard analytics — KPIs, trends, funnel, gateway performance, failure reasons, top products, integration health
- Endpoint(s):
  - `GET /api/merchant/v1/reports/dashboard/summary` — new
  - `GET /api/merchant/v1/reports/dashboard/timeseries` — new
  - `GET /api/merchant/v1/reports/dashboard/funnel` — new
  - `GET /api/merchant/v1/reports/dashboard/breakdown` — new (facet: `status` | `gateway` | `currency`)
  - `GET /api/merchant/v1/reports/dashboard/failures` — new
  - `GET /api/merchant/v1/reports/dashboard/top-products` — new
  - `GET /api/merchant/v1/reports/dashboard/health` — new
  - `GET /api/merchant/v1/reports/dashboard/sessions` — new (frontend already calls it; route does not exist today → 404)
  - `GET /api/merchant/v1/reports/dashboard` — existing, retained for backward compatibility (deprecated)
- Page(s)/View(s): `customer-portal: dashboard` (`/dashboard`)
- Service(s): `DashboardAnalyticsService` (new), `DashboardService` (existing, retained), `ICurrencyService` (reused for FX normalization), `PaymentRepository`, `AppRepository`, `ProductRepository`, `TokenRepository`, `GatewayRepository`

## Description

### Problem / motivation
The portal dashboard is too shallow to be useful. It shows five flat counters (apps, products, orders, revenue, tokens), a five-row session table, a static shortcut list, and four "recent activity" numbers. There is no trend, no comparison against a previous period, no breakdown by gateway or status, and no indication of *why* payments fail. A merchant owner cannot answer basic questions like "is revenue up or down this week", "where are customers dropping off", or "which gateway is failing".

Three concrete defects found during recon:
1. **A chart is fetched and thrown away.** The backend returns `chartData.dailyPayments` (30-day series) and the component imports PrimeNG `ChartModule`, but the template never renders a chart. The payload is computed, transferred, and discarded.
2. **Mixed-currency revenue is wrong.** `reportingMoney()` stamps aggregated totals as `USD`, but the aggregation `$sum`s raw `amountMinor` across all currencies with no FX conversion. A merchant taking both SAR and USD sees a meaningless number labelled USD, and minor units of different exponents are added together.
3. **A dead frontend call.** `DashboardService.getDashboardSessions()` requests `/v1/reports/dashboard/sessions`, but `dashboard.controller.ts` only registers `/` and `/tokens`. That endpoint 404s.

Additionally, the dashboard endpoint is merchant-wide and ignores `appId`, which is inconsistent with the rest of the portal — most pages scope to the selected app via `AppContextService` + `localStorage.selectedAppId`.

### Desired behavior
Replace the dashboard with an insight-focused analytics page, backed by focused endpoints that the page requests in parallel and renders progressively.

**Widgets (9):**
1. **KPI row with trend deltas** — net revenue, successful payments, success rate, average order value. Each shows a % delta versus the immediately preceding period of equal length, plus a sparkline.
2. **Revenue over time** — revenue and payment count over the selected range, switchable daily/weekly granularity.
3. **Payment funnel** — `init → pending → completed` with drop-off percentage at each stage, to expose checkout abandonment.
4. **Status breakdown** — donut over completed / pending / failed / cancelled / expired.
5. **Gateway performance** — per gateway: volume, success rate, average amount. Actionable for gateway routing rules.
6. **Top failure reasons** — grouped by `errorCode` / `error`, so a merchant sees what to fix.
7. **Top products** — by revenue and units, derived from `Payment.products[]`.
8. **Recent payment sessions** — table, retained from the current page.
9. **Integration health checklist** — active gateways, tokens, verified domains; replaces the static Quick Actions block with something state-aware.

**Behavior:**
- A single range selector (`7d` / `30d` / `90d` / custom) applies to the whole dashboard.
- Scoped to the selected app, with an "All apps" toggle.
- Every money metric is normalized into one reporting currency through the existing currency service (`getRateFromUsd` / `getExchangeRate`), and stale FX rates are surfaced rather than silently used.
- Each widget loads independently: if one query fails or times out, that card shows an inline error with retry and the rest of the page still renders.
- A brand-new merchant with zero payments sees a guided setup empty state (create app → configure gateway → generate token → first payment), not a wall of zeros and blank charts.

### Who is affected
Merchant owners and admins are the primary audience (revenue and payment health). All merchant roles — owner, admin, member, developer — retain access, matching today's behavior.

### User story
- **Happy path**: Owner opens `/dashboard`, sees revenue for the last 30 days with a +/- delta against the previous 30 days, spots a dip in the revenue chart, checks gateway performance, notices one gateway's success rate has dropped, and confirms the cause in top failure reasons.
- **Edge**: Owner switches to a 7-day range on a newly created app with no payments; the page shows the guided setup state instead of empty charts. If the failure-reasons query errors, that single card shows a retry control while every other widget stays usable.

### Permissions
`authMiddleware` + `merchantContext`, unchanged from the existing dashboard endpoint. No role restriction — all merchant roles may read analytics. Customer emails continue to be shown as they are today (merchants own that data).

### Data changes
No new collections and no new fields. This is read-only aggregation over existing documents. The only schema-level change is **indexes** on `Payment` to keep aggregations off collection scans:
`{merchantId, createdAt}`, `{merchantId, status, completedAt}`, `{merchantId, appId, createdAt}`.

### Performance approach
- Focused endpoints, requested in parallel by the page, each independently cacheable.
- Server-side `Promise.all` within each endpoint where multiple pipelines are needed.
- Short-TTL Redis cache (~60s) keyed by merchant + app + range + facet, with a manual refresh that bypasses the cache.
- Aggregation pipelines are date-bounded (the current `orders` stats aggregate is unbounded over the whole collection).

### Frontend approach
- Angular 21 standalone, PrimeNG 21, existing `--pu-*` design token system.
- chart.js 4.5.1 (via PrimeNG `ChartModule`) for real charts; inline SVG for sparklines and the funnel.
- Refined analytics aesthetic: airy spacing, soft cards, restrained color, strong typographic hierarchy, subtle motion.
- Strings wired into `ngx-translate` with `en` / `ar` keys, consistent with other portal pages (the current dashboard hardcodes English).
- RTL correct for layout and charts.

### Visual reference

A reference dashboard screenshot was supplied by the user (stored alongside this request as `reference-dashboard.png`). Its **layout and component language are adopted; its palette is not** — colors come from the portal's own tokens.

Design language to adopt:
- **Bento grid** — cards of deliberately mixed sizes on a light neutral canvas, not a uniform equal-card grid.
- **Large corner radius** and very soft shadows on white surfaces (`--pu-radius-xl` / `--pu-radius-2xl`, `--pu-shadow-sm`/`md`).
- **Metric typography** — small muted uppercase-ish label, oversized bold value beneath it.
- **Delta pills** — compact rounded badges next to each metric value, green for positive and red/pink for negative, with a directional arrow (maps to the KPI trend deltas).
- **Segmented pill toggle** with a solid dark active segment (maps to the day/week granularity switch and the app / "All apps" toggle).
- **Circular icon buttons** in card corners for the card-level action ("view all" / drill-through), replacing text links.
- **Bar chart** with thick, rounded-cap bars in a small categorical palette (maps to gateway performance).
- **Gradient-filled area chart** with a floating value tooltip on hover and a light dashed grid (maps to revenue over time).
- **One dark feature card** used for the highest-priority call to action (maps to the integration health checklist when setup is incomplete).
- **Compact list rows** with a leading circular logo/icon, two-line primary/secondary text, and a right-aligned amount (maps to recent sessions and top products).

Deliberately **not** adopted: the reference's coral/orange gradient promo card, avatar stacks, and team/participant widgets — PayUp's dashboard has no equivalent data and they would be decorative filler.

**Palette (confirmed)**: the portal's `--pu-*` token system, indigo `--pu-primary` `#4f46e5` as the accent — so the dashboard matches the portal it lives in. The reference's coral is **not** used. Multi-series chart colors are derived from the existing `--pu-*` semantic tokens (`--pu-success`, `--pu-warning`, `--pu-danger`, `--pu-info`, `--pu-primary`) so status colors carry their established meaning; no new chart token set is introduced. The coral `#ff6b35` in `profile.md` remains documented drift and is not applied here.

### Out of scope
- No new database collections or entities (read-only aggregation only).
- No CSV/PDF export.
- No realtime/websocket push — manual refresh and short-TTL cache only.
- No changes to the admin panel dashboard.
- The `/reports` mockup page is not redesigned in this change, though the new endpoints are intended to back it later.

## Acceptance Criteria

1. `GET /api/merchant/v1/reports/dashboard/summary` returns net revenue, successful payment count, success rate, and average order value, each with an absolute value and a delta versus the preceding period of equal length.
2. `GET /api/merchant/v1/reports/dashboard/timeseries` returns revenue and count buckets for the requested range, honoring `granularity=day|week`.
3. `GET /api/merchant/v1/reports/dashboard/funnel` returns `init`, `pending`, and `completed` counts with a drop-off percentage per stage.
4. `GET /api/merchant/v1/reports/dashboard/breakdown` returns grouped totals for `facet=status`, `facet=gateway`, and `facet=currency`; the `gateway` facet includes volume, success rate, and average amount.
5. `GET /api/merchant/v1/reports/dashboard/failures` returns failure reasons grouped by `errorCode` with counts, ordered by frequency.
6. `GET /api/merchant/v1/reports/dashboard/top-products` returns products ranked by revenue with units sold.
7. `GET /api/merchant/v1/reports/dashboard/health` returns active-gateway, token, and verified-domain state for the setup checklist.
8. `GET /api/merchant/v1/reports/dashboard/sessions` exists and returns paginated recent sessions — the call the frontend already makes no longer 404s.
9. Every new endpoint accepts `range` (`7d`/`30d`/`90d`) or explicit `from`/`to`, plus an optional `appId`; omitting `appId` aggregates across all of the merchant's apps.
10. Every new endpoint is guarded by `authMiddleware` + `merchantContext` and returns data only for the caller's merchant; a request for another merchant's `appId` returns no data from that app.
11. All money values in every response are normalized to a single reporting currency via the currency service, and a stale-rate indicator is present when FX data exceeds the configured staleness window.
12. Repeat requests within the cache TTL are served from Redis; a request with the refresh flag bypasses the cache.
13. `Payment` declares the three compound indexes, and the summary/timeseries pipelines use an index rather than a full collection scan.
14. Controllers contain no aggregation logic — they delegate to `DashboardAnalyticsService` (layering per `backend-rule.md`).
15. The `/dashboard` page renders all 9 widgets, issues its requests in parallel, and each widget resolves independently.
16. If one widget's request fails, that card shows an inline error with a retry control and every other widget still renders.
17. A merchant with zero payments sees the guided setup empty state instead of zeroed charts.
18. The range selector and the app / "All apps" toggle re-request data and update every widget.
19. All dashboard strings resolve through `ngx-translate` with `en` and `ar` entries; no hardcoded display strings remain in the component.
20. The page is visually correct in RTL, including chart axis and legend direction.
21. The page uses only `--pu-*` design tokens and adds no new charting dependency beyond the installed chart.js.
22. No component performs direct HTTP; all calls go through `DashboardService` → `ApiService` using `environment.apiUrl`.

## Notes

- **Visual reference supplied** (`reference-dashboard.png`). Layout and component language are adopted; the palette is explicitly overridden by the portal's own tokens per the user's instruction "use my colors". See the *Visual reference* section above.
- The existing `/reports` page (`reports.component.ts`) is a pure mockup with hardcoded Arabic dummy data and a comment pointing to `FRONTEND_TODO.md` for the analytics endpoints it needs. Its funnel + pie + stat-card composition is useful prior art for the visual direction, and the endpoints created here are the ones it was waiting for.
- `profile.md` lists brand primary as coral `#ff6b35`, but the portal design system uses indigo `#4f46e5` (`--pu-primary`). The dashboard will follow the portal's actual token system; the profile drift is noted but not corrected in this change.
- The legacy `GET /v1/reports/dashboard` becomes unused by the portal once the page is migrated. It is retained as deprecated to avoid breaking `api-docs`; removal is a separate decision.
