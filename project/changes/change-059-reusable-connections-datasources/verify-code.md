# Verification — Reusable Connections + Data Sources Split (change-059)

## Plan Consistency (pre-build)
- [x] Endpoints in specs — Connection CRUD/test/reauth; Data Sources CRUD; datasets/entities under `/sources`
- [x] Services in specs — SVC-DATA-CONN, SVC-DATA-SOURCE, SVC-DATA-DS resolve chain
- [x] Data model — Connection auth-only; DataSource; Dataset.`dataSourceId`
- [x] Pages — Connections table; Data Sources home; choose-connection wizard; source detail
- [x] Auth — JWT + workspace; no public credential endpoints
- [x] Recon findings reflected — preserve Connection `_id`; cascade/delete guards; CSV one-off

## Code Verification (post-build)

### Endpoints in code
- [x] `GET|POST|PATCH|DELETE /api/v1/data/connections` (+ test, reauth) — `datasets.controller.ts`
- [x] `GET|POST|PATCH|DELETE /api/v1/data/sources` (+ nested datasets/entities/from-entities)
- [x] Dataset create accepts `dataSourceId` (legacy `connectionId` optional for transition)
- [x] Setup flow includes `choose-connection` for non-CSV — `pipeline-type.registry.ts`
- [x] Throttle on test (20/min) and reauth (10/min)

### Services / layering
- [x] `DataSourceService` — CRUD, cascade delete, dashboard 409, `resolveForConnector`
- [x] `DataConnectionService` — `dataSourceCount`, delete-in-use 409, real `testConnection`, test-before-save on create, `reauth`, OAuth `skipTest`
- [x] Dataset/Sync/processor resolve `dataset → dataSource → connection` with scope merged into credentials
- [x] Controllers → services → repositories only

### Pages / routes
- [x] `/app/data` lists Data Sources (`listDataSources`)
- [x] `/app/data/connections` table page (create/edit/test/reauth/delete)
- [x] `/app/data/sources/:dataSourceId` detail (rename, add tables, delete+409)
- [x] Wizard `choose-connection` step + DataSource create after pick
- [x] CSV skips choose-connection (one-off Data Source)
- [x] EN/AR i18n keys present

### Frontend isolation / auth
- [x] Calls via `environment.apiUrl` + `DataService`
- [x] Routes under auth shell / guards unchanged

### Migration
- [x] Script: `src/database/seeds/connection-datasource-split.migrate.ts` (idempotent; preserves Connection `_id`)
- [ ] **Operator must run** before relying on sources list for existing workspaces:
  `npx ts-node -r tsconfig-paths/register src/database/seeds/connection-datasource-split.migrate.ts`

### Acceptance criteria (from change-request)
1. [x] Connection auth-only; secrets not returned
2. [x] Data Source = name + connectionId + scope; many:1 Connection
3. [x] Dataset uses `dataSourceId`; add tables via parent Connection
4. [x] Connections table page searchable/filterable/sortable; drawers; i18n
5. [x] Choose-connection wizard step; test-before-save on Connection create
6. [x] CSV one-off without reusable Connection
7. [x] Rename Connection + Data Source; no rebind
8. [x] Delete Connection blocked when in use
9. [x] Delete Data Source confirm + cascade; blocked if dashboards use tables
10. [x] OAuth reauth endpoint (EP-DATA-50); in-place credential update
11. [x] Rate limits on test + reauth (OAuth public callbacks still under global throttler)
12. [x] Migration script present (run required for existing data)
13. [x] Data Sources home primary; Connections secondary link
14. [x] Workspace-scoped JWT management

### UI screenshots
- [ ] skipped (not submitted)

### Builds
- [x] API `tsc --noEmit` PASS
- [x] Frontend `ng build --configuration=development` PASS

## Deferred / notes
- Run migration on each environment before production cutover; remove script after success per CR.
- Global throttler already covers OAuth callbacks; dedicated `@Throttle` applied to test/reauth.
- Legacy `/data/connections/:id/datasets|entities` kept for transition.

## Overall: PASS
`}