# Impact Analysis — Data Source Engine: Tables, Selection, Progress, Mapping

## Code Reconnaissance

### Backend (`roya-ai-dynamo-api`)

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema — DataConnection | complete | `src/modules/data/schemas/data-connection.schema.ts` | none — already owns datasets via `connectionId` |
| Schema — Dataset | complete | `src/modules/data/schemas/dataset.schema.ts` | none — `connectionId`, `sourceRef`, `semanticFlag`, `columnMapping`, `schema`, `analyticsTable` all present |
| Schema — SyncRun | partial | `src/modules/data/schemas/sync-run.schema.ts` | **no `progress` / `phase`** fields; rows only set at completion |
| Connector interface | partial | `src/integrations/connectors/connector.interface.ts` | no `listEntities()`; Mongo/SQL have ad-hoc `listCollections`/`listTables` off-interface |
| Connectors (7) | complete | `src/integrations/connectors/**` | e-commerce entities hardcoded in dataset services; Google Sheets has no list-tabs |
| E-commerce provisioning | complete | `src/integrations/connectors/{zid,salla,shopify}/*-dataset.service.ts` | auto-creates 3 datasets in OAuth callback — must move to selection step |
| Setup flow / EP-DATA-41 | partial | `src/modules/data/controllers/datasets.controller.ts`, `src/modules/pipelines/pipeline-type.registry.ts` | only `connect/schema-review/schedule` kinds; no `select-entities` |
| discoverSchemaWithAiProposal | complete | `src/modules/data/services/dataset.service.ts` | proposal doesn't guarantee required canonical fields prefilled |
| confirm-mapping validation | complete | `src/modules/data/services/dataset.service.ts`, `src/modules/data/config/canonical-fields.config.ts` | hard `400`; no structured `{ missing }` payload |
| Pipeline steps | complete | `src/modules/pipelines/steps/*.ts` | no `SyncRun.progress` writes; `ExtractStep` loads all rows in memory |
| Data controllers | complete | `src/modules/data/controllers/*.ts` | no list-datasets-by-connection; no generic entities endpoint; no single sync-run status |

### Frontend (`roya-ai-dynamo-frontend`)

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Routes | complete | `src/app/app.routes.ts` | no data-source-detail route |
| Data list page | partial | `src/app/pages/data/data-sources/data-sources.page.*` | renders one card **per dataset**; `listConnections()` unused; no grouping |
| Data source detail | none | — | does not exist |
| Setup wizard shell | partial | `src/app/pages/data/setup/dataset-setup-wizard.page.*` | 3 step kinds only; no select-entities; message-only loader |
| Source connect registry | complete | `src/app/pages/data/setup/source-connect.registry.ts`, `source-connect.contract.ts` | fine — reused |
| Connect components | partial | `src/app/pages/data/setup/connect/*` | Mongo/SQL have in-component selection; e-commerce none; Sheets single-tab text |
| Schema review + mapping | partial | `src/app/shared/components/schema-review-step/*` | mapping UI gated to csv/google_sheets via `showSemanticMapping` |
| Schedule step | complete | `src/app/shared/components/schedule-step/*` | reused |
| Loaders | partial | `src/app/shared/components/page-loader/*` | message-only; no `%`; no progress component |
| Data models | complete | `src/app/core/models/data.models.ts` | `WizardStepKind` lacks `select-entities`; add `Entity` + `SyncRunProgress` types |
| Data service | partial | `src/app/core/services/data.service.ts` | add: listDatasetsByConnection, listEntities, sync-run status; reuse existing |

**Feature state: partial** (grouping/model exist; selection/progress/mapping-UI/editability missing).

## Affected Modules
- **Data (module 4)** — grouping, selection, mapping fix, progress, editability; new endpoints + SyncRun fields.
- **Connectors (S10)** — `listEntities()` on interface + all 7 connectors + registry.
- **Pipelines (S11)** — `select-entities` in setup flow; steps write `SyncRun.progress/phase`.
- **Customer Portal Shell (S1)** — data list regroup, new detail page, wizard step + progress loader, mapping UI.
- **Ripple — OAuth controllers/dataset services (zid/salla/shopify)** — provisioning moves from OAuth callback to selection step (callback keeps connection + webhook route).

## Plan Docs to Update
- [x] `project/plan/modules.md` — Data feature entries (grouping, selection, progress, editable mapping); Connectors (listEntities); Pipelines (progress + select-entities).
- [x] `project/plan/data-model.md` — `SyncRun.progress`, `SyncRun.phase` fields.
- [x] `project/actions/backend/endpoints/data.md` (+ `_index.md`) — new endpoints; EP-DATA-41 select-entities; confirm-mapping response; e-commerce OAuth provisioning note.
- [x] `project/actions/backend/services/connectors.md` + `_index.md` — `listEntities()` contract; provisioning-from-selection.
- [x] `project/actions/backend/services/data.md` (if present) / pipelines.md — progress writes, setup flow.
- [x] `project/actions/customer-portal/pages/data.md` (+ `_index.md`) — regrouped list, new detail page, wizard select-entities step, progress loader, mapping-for-all.
- [ ] `project/rules.md` — add only if a new durable convention emerges (progress phases / selection contract). Assess during 5.3.
- [ ] `project/description.md` — extend Data section briefly (grouping + selection engine).

## Risk
complexity **High** · cross-module **Yes** (Data + Connectors + Pipelines + CP) · migration **No** (additive `SyncRun` fields; `connectionId` already present)

## Recommendation
- **Create**:
  - BE: `ConnectorInterface.listEntities()`; `GET /data/connections/:id/entities`; `GET /data/connections/:id/datasets`; `GET /data/datasets/:id/sync-runs/:runId`; `SyncRun.progress`/`phase`; name-match prefill helper.
  - FE: `data-source-detail.page`; shared `SelectEntitiesStepComponent`; shared `ProgressLoaderComponent`; `select-entities` handling in wizard shell.
- **Complete (extend in place)**:
  - BE: each connector's `listEntities` (Mongo/SQL wrap existing list methods; e-commerce return entity list; Sheets add list-tabs; csv none); `PipelineTypeRegistry.getSetupFlow` add select-entities; pipeline steps write progress; `discoverSchemaWithAiProposal` prefill required fields; `confirmMapping` structured response.
  - FE: `data-sources.page` regroup by connection; `dataset-setup-wizard` add step + progress polling; `schema-review-step` show mapping for all semantic sources + required-field validation; `data.service` new methods; `data.models` new types + `WizardStepKind`.
- **Modify (ripple)**:
  - BE: `zid/salla/shopify` OAuth controllers + `*-dataset.service.ts` — connection + webhook route on callback; datasets created at selection; `provisionFromOAuth` refactored to `provisionSelectedEntities(connectionId, entities)` (or equivalent) reused by the selection endpoint.
