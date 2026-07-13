# Impact Analysis — Reusable Connections + Data Sources Split

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema — Connection (auth) | complete (conflated) | `roya-ai-dynamo-api/src/modules/data/schemas/data-connection.schema.ts` → collection `ws_{slug}_data_connections` | Scope mixed into `credentialsEncrypted`; UI treats this as “Data Source” |
| Schema — DataSource | **none** | — | New entity required (`name`, `connectionId`, `sourceType`, `scope`, `status`) |
| Schema — Dataset | complete | `schemas/dataset.schema.ts` → `ws_{slug}_datasets` | Uses `connectionId`; must move to `dataSourceId` |
| Schema — WebhookRoute | complete | `schemas/webhook-route.schema.ts` | Keeps `connectionId` → Connection (store-level auth) |
| Schema — DashboardDatasource | complete | `dashboards/schemas/dashboard-datasource.schema.ts` | `datasetId` only — stable if IDs preserved |
| Service — DataConnection | complete | `services/data-connection.service.ts` + repository | Evolve to auth-only; add delete-guard (in-use); real test-before-save; re-auth |
| Service — DataSource | **none** | — | New CRUD + cascade delete + dashboard-usage guard |
| Service — Dataset / Sync | complete | `dataset.service.ts`, `sync.service.ts`, `processors/data-sync.processor.ts` | Resolve credentials via `dataset → dataSource → connection`; nest lists under dataSource |
| Endpoint(s) | partial | `controllers/datasets.controller.ts` + OAuth controllers | Connections become auth-only; add `/data/sources` CRUD; move `…/datasets`, `…/entities` under sources; rate-limit test + OAuth |
| Page(s) — Data Sources home | complete (wrong entity) | `frontend/.../pages/data/data-sources/` | Must list **DataSources**, not Connections; link to Connections |
| Page(s) — Source detail | complete | `pages/data/source-detail/` | Param → `dataSourceId`; rename source; add tables via parent Connection |
| Page(s) — Connect wizard | complete | `pages/data/setup/dataset-setup-wizard.page.ts` + `connect/*` | Add **Choose connection** step; split credentials vs scope in connect components |
| Page(s) — Connections | **none** | — | New `/app/data/connections` **table** + create/edit drawers |
| Frontend service/models | complete (old model) | `core/services/data.service.ts`, `core/models/data.models.ts` | Add DataSource types/APIs; rename `Dataset.connectionId` → `dataSourceId`; rename wizard DTO `DataSourceEntity` collision risk |

**Feature state:** **partial** — ingest stack complete under conflated `DataConnection`; reusable Connection + DataSource entity + Connections UI = **greenfield**.

### Plan-vs-code drift (relevant)
- Plan/UI call today’s `DataConnection` a “Data Source”; API/routes use `connections`.
- Collection names: code `data_connections` / `sync_runs` vs plan `dataconnections` / `syncruns`.
- `testConnection` in code always returns `{ ok: true }` after decrypt — must become real connector test + gate save.
- Delete connection has no “in-use” guard; delete dataset has no dashboard guard — both required by CR.
- `data-model.md` already labels schema-discovery fields as *(change-058)* — those fields exist in code from a parallel track; this change-058 owns the Connection/DataSource split (keep discovery fields; update Dataset relation to DataSource).

## Affected Modules
- **Data** — primary: Connection/DataSource split, services, endpoints, migration, wizard, Connections UI
- **Connectors / OAuth** — create Connection only; scope on DataSource; re-auth updates Connection credentials
- **Pipelines** — setup-flow adds choose-connection step; extract still receives connection doc (+ scope from DataSource)
- **Dashboards** — delete-DataSource guard via `DashboardDatasource.datasetId` count only (no schema change if IDs preserved)
- **Webhook routes** — keep pointing at Connection `_id`

## Plan Docs to Update
- [ ] `project/plan/modules.md` — Data module features: Connections management; Data Source uses connectionId; terminology fix
- [ ] `project/plan/data-model.md` — evolve DataConnection → Connection (auth-only); add DataSource; Dataset.`dataSourceId`; WebhookRoute still → Connection; indexes/rules
- [ ] `project/actions/backend/services/data.md` — SVC-DATA-CONN auth-only; new SVC-DATA-SOURCE; Dataset/Sync resolve chain
- [ ] `project/actions/backend/endpoints/data.md` + `_index.md` — Connections CRUD/test/re-auth; Data Sources CRUD; nest datasets/entities under sources; rate limits
- [ ] `project/actions/customer-portal/pages/data.md` + `_index.md` — Connections table page; wizard choose-connection; home lists Data Sources; detail rename/cascade
- [ ] `project/description.md` — short Data section terminology update
- [ ] `project/rules.md` — encryption on Connection only; delete guards; test-before-save; no rebind
- [ ] `project/profile.md` — only if new integration note needed (likely skip)

## Code Impact (create / complete / modify)

### Create
- Backend: `data-source.schema.ts`, repository, service, controller routes for `/data/sources`
- Backend: migration script `connection-datasource.split.migrate.ts` (pattern: `dataset-available-columns.migrate.ts`)
- Frontend: Connections list page (table) + route `/app/data/connections`
- Frontend: Choose-connection wizard step component
- Frontend: DataSource models + `DataService` methods for sources

### Complete / harden
- Real `testConnection` via connector before save
- Delete Connection blocked when DataSources reference it
- Delete DataSource: confirm → cascade datasets/sync runs; block if dashboards use any table
- OAuth re-auth path on existing Connection
- Rate limits on test-connection + OAuth endpoints

### Modify (ripple)
- `DataConnection` schema/service/repo → auth-only credentials (strip scope fields from encrypted blob over time via migration)
- `Dataset` schema: `connectionId` → `dataSourceId`; all `findByConnection*` → `findByDataSource*`
- Nested APIs: `GET/POST …/connections/:id/datasets|entities` → under `…/sources/:id/…` (or dual-route during transition — prefer clean cut post-migration)
- OAuth controllers + `*-dataset.service.ts`: create Connection; defer scope to DataSource step
- SQL/Mongo controllers: decrypt Connection; apply DataSource.scope for DB name
- Sync processor / DatasetService: resolve `dataset → dataSource → connection`
- Connect components: credentials vs scope split; CSV stays one-off Data Source (no Connection)
- Data Sources home + source-detail + dataset-detail parent load path
- Pipelines `getSetupFlow`: insert choose-connection step (non-CSV)

## Ripple map (action)

| Item | Action |
|------|--------|
| SyncRun, FilterValueMeta, OLAP `analyticsTable` | Safe — `datasetId` preserved |
| DashboardDatasource | Safe — guard on delete only |
| WebhookRoute.connectionId | Keep → Connection |
| Connector interface | Prefer pass Connection + scope overlay (or hydrated view) — avoid rewriting all connectors |
| Wizard DTO name `DataSourceEntity` | Rename to `ImportableEntity` (or similar) to avoid collision |
| Legacy CSV `CsvFile` / upload | Unchanged; CSV Data Source path special-cased |
| Admin datasource-type-meta | Unchanged |

## Reuse
- `credentials-encryption.util.ts`, OAuth controllers, side-drawer (change-057), setup wizard shell, entity-select / schema-review / schedule steps, connector registry, pagination/table patterns on data pages, migrate script pattern from `dataset-available-columns.migrate.ts`

## Risk
- **Complexity:** High
- **Cross-module:** Yes (Data + Connectors/OAuth + Pipelines + Dashboards delete guard)
- **Migration:** Yes (required script; user removes after run)
- **Highest risks:** per-type credential/scope split; API route rename; UI terminology; webhook `connectionId` stability during migrate (preserve Connection `_id` where possible)

## Recommendation
- **Create:** DataSource entity + `/data/sources` APIs + Connections table page + choose-connection step + migration script
- **Complete:** test-before-save, delete guards, OAuth re-auth, rate limits
- **Modify:** evolve DataConnection → Connection (auth-only); Dataset → `dataSourceId`; list/detail/wizard/services; setup-flow; SQL/Mongo/OAuth credential resolution
- **Preserve:** Connection `_id` values in migration so webhooks and OAuth resume keep working; create new DataSource docs 1:1 from old conflated records
`}