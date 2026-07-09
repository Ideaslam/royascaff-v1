# Impact Analysis — Share Link Filters Stuck Loading

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | complete | `sharing/schemas/share-link.schema.ts` | No change needed |
| Service(s) | partial | `dashboards.service.ts` (`getFilterOptions`, `searchFilterValues`, `getChartData`); `sharing.service.ts` | `shareToken` param on `getChartData` is unused; filter methods JWT-only; no share-token resolve helper for dashboard access |
| Endpoint(s) | partial | `dashboards.controller.ts` EP-DASH-08/14/15 | Controller requires JWT (`@UseGuards(JwtAuthGuard)`); no `@Public` / optional JWT; filter endpoints ignore `shareToken` query |
| Page(s) | partial | `shared-viewer.page.ts/html`; `filter-widget.component.ts`; `dashboards.service.ts` (FE) | Shared viewer omits `dashboardId`/`shareToken`; no `FilterService` reload; FE filter API helpers omit `shareToken` |

Feature state: **partial** (plan already documents `JWT | token` for EP-DASH-14/15/08; code + shared viewer incomplete)

## Plan-vs-code drift
- Plan (`endpoints/dashboards.md`): EP-DASH-08/14/15 auth = `JWT | token`, query `shareToken?`
- Code: JWT required; `shareToken` unused in `getChartData`; filter endpoints have no shareToken param
- Plan (`pages/sharing.md`): static `GET /shared/:token` only — does not mention interactive filters

## Affected Modules
- **Dashboards (backend)** — optional JWT + share-token access for filter-options, filter search, and widget data
- **Sharing (backend)** — expose reusable token validation (dashboardId + workspaceSlug)
- **Customer portal shared viewer + filter widget** — pass ids/token, fetch options, reload widgets on filter change

## Plan Docs to Update
- [x] `project/actions/backend/endpoints/dashboards.md` — note optional JWT + shareToken validation behavior (align notes with implementation)
- [x] `project/actions/backend/services/dashboards.md` — update `getFilterOptions` / `searchFilterValues` / `getChartData` signatures for share access
- [x] `project/actions/customer-portal/pages/sharing.md` — document filter interactivity on shared viewer
- [ ] data-model / modules.md / rules.md — no change (no schema/rules change)

## Code files to change

### Backend (complete in place)
- `sharing/services/sharing.service.ts` — add `resolveShareToken(token)` → `{ dashboardId, workspaceSlug, permission }`
- `dashboards/dashboards.module.ts` — import `SharingModule` via `forwardRef` (cycle with Sharing→Dashboards)
- `dashboards/services/dashboards.service.ts` — enforce JWT ownership **or** valid shareToken; resolve workspace from token when anonymous
- `dashboards/controllers/dashboards.controller.ts` — optional JWT for EP-DASH-08/14/15; accept `shareToken` query; allow missing user
- `common/guards/` — add `OptionalJwtAuthGuard` (or method-level override) so anonymous + authenticated both work

### Frontend (complete in place)
- `core/services/dashboards.service.ts` — pass `shareToken` on `getFilterOptions` / `searchFilterValues`
- `shared/widgets/filter-widget/*` — accept `@Input() shareToken`; pass through to API calls
- `shared/widgets/widget-renderer/*` — forward `shareToken` to filter widget
- `pages/dashboards/shared-viewer/*` — pass `dashboardId` + `shareToken`; subscribe to `FilterService` and refetch widget data via `getWidgetData`

## Ripple map
| Item | Action |
|------|--------|
| Authenticated dashboard-viewer filters | Modify carefully — keep JWT path; shareToken optional |
| `GET /shared/:token` payload | Safe — keep embedding initial chartData; filters trigger live refetch |
| Auth interceptor 401 refresh on share page | Risk — anonymous filter calls must not trigger logout/refresh; ensure 401 from bad token doesn't call `auth.refreshToken` when no session (or skip refresh for shareToken requests) |

## Risk
- **Complexity**: medium (auth path + FE wiring)
- **Cross-module**: yes (dashboards ↔ sharing)
- **Migration**: no
- **Circular module import**: mitigated with `forwardRef`

## Recommendation
- **Complete**: EP-DASH-08/14/15 share-token auth (plan already claims it)
- **Complete**: Shared Dashboard Viewer filter interactivity
- **Create**: `OptionalJwtAuthGuard` + `SharingService.resolveShareToken`
- **Modify**: FilterWidget / WidgetRenderer / DashboardsService (FE) to thread `shareToken`
