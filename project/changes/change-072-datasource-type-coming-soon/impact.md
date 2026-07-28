# Impact Analysis — Datasource Type Coming Soon + Visibility

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | complete | `roya-ai-dynamo-api/.../schemas/datasource-type-meta.schema.ts` | No `comingSoon` field |
| DTO | complete | `.../dto/datasource-type-meta.dto.ts` | `UpdateDatasourceTypeMetaDto` lacks `comingSoon` / `isActive` |
| Repository | complete | `.../repositories/datasource-type-meta.repository.ts` | No connectability helper |
| Service (meta) | complete | `.../services/datasource-type-meta.service.ts` | No `assertConnectable` / toggle coming soon |
| Service (create) | complete | `data-connection.service.ts`, `data-source.service.ts` | No guard on create for inactive/coming-soon |
| Endpoint(s) | complete | `datasource-type-meta.controller.ts` (EP-DATA-47), `admin-datasource-types.controller.ts` (EP-DSTYPE-01..04) | Response/docs omit `comingSoon`; PATCH body omits it |
| Seed | complete | `database/seeds/datasource-type-meta.seed.ts` | No `comingSoon: false` on rows |
| Admin FE model/svc | complete | `datasource-types-admin.service.ts` | Interfaces omit `comingSoon` |
| Admin page | complete | `pages/admin/data-source-types/data-source-types.page.ts` | Active toggle only; no Coming soon column/toggle |
| Customer FE model | complete | `datasource-type-meta.models.ts` | Omits `comingSoon` |
| Customer pickers | complete | `data-sources.page.ts/html`, `connections.page.ts/html` | Cards always selectable; no badge; filter treats missing map entry as active |
| Wizard / detail | complete | `dataset-setup-wizard.page.ts`, `source-detail.page.ts` | Use meta for labels only — no picker change required beyond blocking entry |

**Feature state:** complete (modification) — change-048 fully implemented; this extends it.

**Plan-vs-code drift:** Admin Data Source Types page exists in code + nav (`/app/data-source-types`) but is **missing** from `admin-panel/pages/_index.md` and has no page spec file.

## Affected Modules
- **Data** — `DatasourceTypeMeta` field + admin/customer surfaces + create-path enforcement

## Plan Docs to Update
- [x] `project/plan/data-model.md` — add `comingSoon` to `datasource_type_meta`
- [x] `project/plan/modules.md` — update feature #9 Data Source Type Metadata
- [x] `project/actions/backend/services/data.md` — SVC-DSTYPE methods (`assertConnectable`, update fields)
- [x] `project/actions/backend/endpoints/data.md` — EP-DATA-47 / EP-DSTYPE-03 (+ optional toggle note); create endpoints note rejection
- [x] `project/actions/customer-portal/pages/data.md` — type pickers: coming-soon badge + non-selectable
- [x] `project/actions/admin-panel/pages/_index.md` + new `data-source-types.md` — fix drift + document Coming soon toggle
- [ ] `project/rules.md` — only if a new cross-cutting rule is needed (likely skip; behavior stays in data-model/endpoints)
- [ ] `project/description.md` — skip (incremental admin flag, not a product-section rewrite)

## Ripple / Impact Map

| Artifact | Action | Notes |
|----------|--------|-------|
| `DatasourceTypeMeta` schema | **Modify** | Add `comingSoon` boolean, default `false` |
| Seed rows | **Modify** | Set `comingSoon: false` on all upserts |
| `UpdateDatasourceTypeMetaDto` | **Modify** | Optional `comingSoon?: boolean` |
| `DatasourceTypeMetaService` | **Modify** | Accept field on update; add `assertConnectable(sourceType)` → 400 if missing / inactive / comingSoon |
| `DataConnectionService.create` | **Modify** | Call `assertConnectable` before test/save |
| `DataSourceService.create` | **Modify** | Call `assertConnectable` (covers CSV + connection-backed) |
| OAuth authorize starts (Google/Shopify/Salla/Zid/Google Ads/Meta Ads) | **Modify** (ripple) | Call `assertConnectable` so users cannot start OAuth for coming-soon types |
| EP-DATA-47 / EP-DSTYPE-* | **Modify** | Document + return `comingSoon`; PATCH accepts it |
| Admin toggle Coming soon | **Modify** | Table `p-toggleSwitch` → `PATCH` with `{ comingSoon }` (no new endpoint required) |
| Customer `DatasourceTypeMeta` model | **Modify** | Add `comingSoon` |
| Data Sources connect drawer | **Modify** | Show coming-soon types with tag; disable select |
| Connections type picker | **Modify** | Same UX |
| Picker filter logic | **Modify** | When DB meta loaded, show only types present in API map (fixes inactive types leaking from static registry) |
| i18n EN/AR | **Modify** | Add `DATA.*.COMING_SOON` (or shared key) |

**Reuse:** existing `isActive`, admin toggle UX, EP-DATA-47, type pickers — no new collections/endpoints required.

## Risk
- **Complexity:** Low–Medium (small field + UI + create guards)
- **Cross-module:** No (stays in Data; OAuth controllers are data-module)
- **Migration:** No dedicated script — schema default `false`; seed upserts set explicit `false`
- **Auth:** Unchanged (admin write / JWT customer read)
- **Existing data:** Connections/sources for a type later marked coming-soon remain usable (guards only on **create** / OAuth **start**, not on sync/reauth of existing)

## Recommendation
- **Create:** `admin-panel/pages/data-source-types.md` (plan drift fix)
- **Modify:** schema/DTO/service/seed; connection + data-source create + OAuth starts; admin page; customer pickers + models + i18n; plan docs listed above
- **Complete:** N/A (feature already complete)
- **Skip new endpoint:** Coming soon toggle via existing `PATCH :type` with `{ comingSoon }`
