# Impact Analysis — change-048-datasource-type-metadata

## Feature State

| Area | State | Notes |
|---|---|---|
| `datasource_type_meta` schema/collection | **none** (greenfield) | No schema, repository, service, or controller exists |
| `GET /data/source-types` endpoint | **none** (greenfield) | Not declared in data.md or implemented |
| Admin CRUD endpoints | **none** (greenfield) | No admin endpoints in data module at all |
| Seed script | **none** (greenfield) | No seed for this collection |
| Customer portal: DB-driven type metadata | **none** | All source type labels/icons hardcoded in `source-connect.registry.ts` |
| Admin Panel: Data Source Types page | **none** (greenfield) | No route or page exists |

## Code Reconnaissance

### Backend
- `DataSourceType` enum lives in `src/modules/data/schemas/data-connection.schema.ts` — 7 values.
- `data.module.ts`: clear pattern for schema + repository + service + controller registration. All global (non-workspace-scoped) collections use `MongooseModule.forFeature([{ name, schema }])`.
- Admin endpoints across the system are under the `/admin/` prefix with `@Roles('admin')` guard (see `audit.md`, `settings.md` patterns).
- No `datasource_type_meta` schema, repository, service, or controller anywhere.

### Customer Portal Frontend
- `src/app/pages/data/setup/source-connect.registry.ts`: all metadata (label, description, icon, color, bgColor, category) is hardcoded in `SOURCE_DEFINITIONS` array. Used by the picker dialog, wizard header, list page, detail page.
- `data-sources.page.ts`: builds `sourceTypes` and `sourceTypeOptions` from `SOURCE_DEFINITIONS`; `getSourceMeta()` / `formatSourceType()` return hardcoded data.
- `source-detail.page.ts`: `sourceMeta()` / `sourceLabel()` call `findSourceDefinition()` from registry.
- `dataset-setup-wizard.page.ts`: `sourceDef` signal holds `SourceDefinition`; `sourceDef().label` + `sourceDef().icon` shown in wizard header.
- No `DataService.getSourceTypes()` method exists.

### Admin Panel Frontend
- No "Data Source Types" page, route, or service exists.
- `app-shell.ts` `navItems` array is hardcoded — needs one new entry.
- `app.routes.ts` needs one new lazy-loaded route.
- Pattern: each admin module has its own injectable service (e.g. `clients.service.ts`, `subscriptions-admin.service.ts`).

## Plan-vs-Code Drift
- None relevant to this change; all existing features are in sync.

## Impact Map

### Create New

| # | Artifact | Type | Location |
|---|---|---|---|
| BE-1 | `DatasourceTypeMeta` schema | schema | `src/modules/data/schemas/datasource-type-meta.schema.ts` |
| BE-2 | `DatasourceTypeMetaRepository` | repository | `src/modules/data/repositories/datasource-type-meta.repository.ts` |
| BE-3 | `DatasourceTypeMetaService` | service | `src/modules/data/services/datasource-type-meta.service.ts` |
| BE-4 | `DatasourceTypeMetaController` | controller | `src/modules/data/controllers/datasource-type-meta.controller.ts` (customer endpoint) |
| BE-5 | `AdminDatasourceTypesController` | controller | `src/modules/data/controllers/admin-datasource-types.controller.ts` |
| BE-6 | DTOs | dto | `src/modules/data/dto/datasource-type-meta.dto.ts` |
| BE-7 | Seed script | script | `src/database/seeds/datasource-type-meta.seed.ts` |
| CP-1 | `DatasourceTypeMeta` model interface | model | `src/app/core/models/datasource-type-meta.models.ts` |
| CP-2 | Admin panel service | service | `roya-ai-dynamo-frontend-admin/src/app/core/services/datasource-types-admin.service.ts` |
| AP-1 | Admin "Data Source Types" page | page | `roya-ai-dynamo-frontend-admin/src/app/pages/admin/data-source-types/data-source-types.page.ts` |

### Modify

| # | Artifact | Change |
|---|---|---|
| BE-M1 | `data.module.ts` | Register new schema, repository, service, two controllers |
| CP-M1 | `data.service.ts` (CP) | Add `getSourceTypes()` method |
| CP-M2 | `data-sources.page.ts` | Load source type meta from API on init; merge with registry fallback; filter inactive types from picker |
| CP-M3 | `data-sources.page.html` | Show `logoUrl` (or icon fallback) in cards and picker dialog; expandable instructions panel in each card |
| CP-M4 | `source-detail.page.ts` | Load source type meta; show logo + instructions panel |
| CP-M5 | `source-detail.page.html` | Logo in header; expandable instructions panel |
| CP-M6 | `dataset-setup-wizard.page.ts` | Load source type meta; pass logo + DB title to wizard header |
| CP-M7 | `dataset-setup-wizard.page.html` | Show logo + DB title in wizard header |
| AP-M1 | `app-shell.ts` | Add "Data Source Types" nav item |
| AP-M2 | `app.routes.ts` | Add `data-source-types` lazy-loaded route |

## Ripple Effects
- `sourceTypeOptions` in `data-sources.page.ts` (the filter dropdown) should continue to list all 7 types for filtering even if some are inactive — so it uses the registry static list, not the DB active-only list. Only the **picker dialog** hides inactive types.
- Existing `DataConnection` records for disabled source types are NOT affected — they remain functional; only new-connection creation is gated.
- No changes to sync, pipeline, or OLAP layers.

## Risks
- None significant. New global collection, no workspace-scoping needed.
- Logo URL is stored as a plain string — no R2 upload needed, no storage side effects.
- Seed script is idempotent (upsert by `sourceType`) so it can be safely re-run.

## Planning Docs to Update
| Doc | Change |
|---|---|
| `project/plan/data-model.md` | Add `datasource_type_meta` entity |
| `project/actions/backend/services/data.md` | Add `SVC-DSTYPE` service entry |
| `project/actions/backend/endpoints/data.md` | Add EP-DATA-47 + EP-DSTYPE-01..04 |
| `project/plan/modules.md` | Add feature to Module 4 (Data) |
