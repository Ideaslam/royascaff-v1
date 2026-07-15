# Impact Analysis — Dashboard Dataset Picker UX

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | complete | `dataset.schema.ts` (`dataSourceId`); `data-source.schema.ts` (`name`) | fields exist; not exposed on lite |
| Repository | complete | `dataset.repository.ts` → `findSelectableLitePaginated` | projects only `_id, name, sourceType, rowCount, columnCount`; no `$lookup` to data sources; sort by `sourceType, name` only |
| Service(s) BE | complete | `dataset.service.ts` → `listLite` | pass-through; no change needed beyond repo |
| Endpoint(s) | complete (code) / **drift** (plan) | `datasets.controller.ts` `GET datasets/lite` | works; **missing from** `endpoints/data.md` (bug-032 labeled it EP-DATA-50, but plan uses EP-DATA-50 for connection reauth) |
| Frontend models | complete | `data.models.ts` → `DatasetLite` | missing `dataSourceId`, `dataSourceName` |
| Frontend service | complete | `data.service.ts` → `listDatasetsLite` | types only need update |
| Page — Project Detail | complete | `project-detail.page.{ts,html,scss}` | groups by **sourceType** only; radio-style `pi-circle`; large top selected tray; no select-all; default `limit=8` |
| i18n | complete | `en.json` / `ar.json` `PROJECTS.DETAIL.DATASETS_*` | need keys for select-all, sources count, sticky summary |

Feature state: **complete** (modify UX + enrich existing lite projection)

### Plan-vs-code drift
- Lite picker endpoint exists in code and is used by Project Detail, but is **not listed** in `project/actions/backend/endpoints/data.md`. This change should document it under a free EP id (e.g. **EP-DATA-56**) and note the response enrichment.
- `projects.md` still describes type-grouped cards + top selected tray (change-057); will update in-place to data-source grouping + sticky summary.

## Affected Modules
- **Projects / Dashboards (Create Dashboard)** — dataset picker UX on Project Detail
- **Data** — lite list projection only (no create/sync behavior change)

## Plan Docs to Update
- [x] `project/actions/customer-portal/pages/projects.md` — picker UX: group by data source, select-all, checkboxes, sticky selection summary
- [x] `project/actions/backend/endpoints/data.md` (+ `_index.md`) — document `GET /data/datasets/lite` as EP-DATA-56 with enriched fields
- [x] `project/plan/modules.md` — skipped (Create Dashboard already covers multi-dataset select; no detail change needed)
- [x] data-model / services / rules / description — **skip** (no new entities; projection-only)

## Code Impact Map

| Action | Item |
|--------|------|
| **Modify** | `dataset.repository.ts` — `$lookup` `ws_{slug}_data_sources`; project `dataSourceId`, `dataSourceName`; sort by data source then name; include `dataSourceName` in search `$or` |
| **Modify** | `data.models.ts` — extend `DatasetLite` |
| **Modify** | `project-detail.page.ts` — group by `dataSourceId`; select-all / deselect-all; sticky summary expand/collapse; raise default `datasetsLimit` (e.g. 24); keep selection across filter/search |
| **Modify** | `project-detail.page.html` — checkbox rows, group headers with bulk actions, sticky selection bar (replace top tray) |
| **Modify** | `project-detail.page.scss` — styles for groups, checkboxes, sticky bar |
| **Modify** | `public/i18n/en.json`, `ar.json` — new `PROJECTS.DETAIL.DATASETS_*` strings |
| **Ripple** | none — create dashboard `POST` payload unchanged; template flow out of scope |

## Risk
- **Complexity**: L–M (UX rewrite in one page + one aggregate)
- **Cross-module**: Y (Projects UI + Data lite) but narrow
- **Migration**: N
- **Select-all caveat**: applies to **loaded** tables in the group (pagination retained); mitigated by higher default page size — documented in acceptance criteria

## Recommendation
- **Modify**: lite projection + Project Detail picker UX + plan docs (`projects.md`, `endpoints/data.md` as **EP-DATA-56**)
- **Create**: none (no new components required; keep logic on the page unless a tiny shared piece emerges)
- **Complete**: document drifted lite endpoint in plan
