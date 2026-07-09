# Impact Analysis — AI Column Selection + Blocked Columns

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | complete | `roya-ai-dynamo-api/src/modules/data/schemas/dataset.schema.ts` | No `isSelected` / `selectionOrder` / `blocked` on `DiscoveredColumn`; no `availableColumns` |
| AI prompt | complete | `…/integrations/ai/prompts/column-identify.md` (+ separate `column-analysis.md` at discovery) | No selection/blocked fields; two AI description paths |
| Pipeline step | complete | `…/pipelines/steps/identify-columns.step.ts` | Merges descriptions + PK only; skips when all have descriptions; no selection semantics |
| Service | complete | `…/data/services/dataset.service.ts` (`updateSchemaColumns`, `discoverSchemaWithAiProposal`) | No confirm-selection prune; no blocked enforcement; no audit; discovery overwrites full `schema` |
| Endpoint(s) | complete | `…/data/controllers/datasets.controller.ts` EP-DATA-40 / EP-DATA-22 | EP-DATA-40 patches desc/PK only; no refresh-available / confirm-selection |
| Row projection | partial | `…/pipelines/steps/row-transform.util.ts`, `apply-mapping.step.ts`, `load.step.ts`, streaming coordinator | OLAP DDL follows `schema`; row payloads unfiltered; `connector.normalize()` unused |
| Schema drift | complete | `…/processors/data-sync.processor.ts` (+ schema-drift service) | Appends new cols to live `schema` — must target `availableColumns` after split |
| Audit | none | `…/audit/schemas/audit-log.schema.ts`, `AuditLogService` | No dataset schema audit actions today |
| Migration | none | — | No dataset migration scripts; need per-workspace `ws_*_datasets` backfill |
| Page — schema-review | complete | `…/shared/components/schema-review-step/*` | No checkbox/order/blocked; confirms mapping + PK only |
| Page — dataset-detail | complete | `…/pages/data/dataset-detail/*` | Desc/PK save only; no Edit Schema / Add column |
| Frontend models | complete | `…/core/models/data.models.ts`, `data.service.ts` | Missing new fields + client methods |

Feature state: **complete** (modify existing identify-columns + schema UI + sync path)

## Affected Modules
- **Data** — model split (`availableColumns` vs live `schema`), confirm selection, Add column refresh, audit, migration
- **Pipelines** — extend `identify-columns` + project rows to selected columns (buffered + streaming)
- **Audit** — new `AuditAction` for schema selection
- **Customer portal** — schema-review + dataset-detail selection UX (EN/AR)

## Plan Docs to Update
- [x] `project/plan/modules.md` — Schema Discovery / Manage Datasets / ingest identify-columns behavior
- [x] `project/plan/data-model.md` — `DiscoveredColumn` + `Dataset.availableColumns`
- [x] `project/actions/backend/services/data.md` — confirm selection, refresh available, audit
- [x] `project/actions/backend/services/pipelines.md` — IdentifyColumnsStep + row projection
- [x] `project/actions/backend/endpoints/data.md` — extend EP-DATA-40; add confirm-selection + refresh-available (or document overload)
- [x] `project/actions/customer-portal/pages/data.md` — schema-review + dataset-detail UX
- [x] `project/rules.md` — selection prune before sync; blocked columns; audit on selection (if security/async rules apply)
- [ ] `project/description.md` — only if product narrative needs a short note (optional)

## Plan-vs-code drift
- Plan mentions “Refresh Schema” on dataset-detail; UI button not implemented — this change adds **Edit Schema / Add column** (source re-fetch) instead of/in addition to refresh.
- Two AI paths (`column-analysis` at discover vs `column-identify` at sync) — plan should state: discovery populates `availableColumns`; selection AI is `column-identify` (setup may need an early identify or wizard waits for first sync — **decision below**).

## Architecture decision (from recon)
Wizard confirm happens **before** first ingest sync today. Selection prune must run at **user confirm** (schema-review / Save Schema), not only inside `identify-columns` during sync.

Recommended flow:
1. **Discover** → write full list to `availableColumns` (+ provisional `schema` = all or AI-selected draft).
2. **Selection AI (confirmed option A):** After discover, call identify-columns logic (service method shared with pipeline step) before schema-review.
3. **User confirm** → prune live `schema` to selected; strip mapping; audit.
4. **Sync extract/load** → project to live `schema` columns only.

## Ripple / impact map

| Item | Action | Classification |
|------|--------|----------------|
| `DiscoveredColumn` + `Dataset.availableColumns` | Add fields | **Modify** |
| `column-identify.md` + IdentifyColumnsStep | Extend AI I/O + merge rules; AI fail → select none | **Modify** |
| `discoverSchemaWithAiProposal` | Write `availableColumns`; do not blindly overwrite pruned `schema` | **Modify** |
| Shared `confirmSchemaSelection` / extend `updateSchemaColumns` | Prune, validate, audit, syncing guard | **Complete in place** / new EP if needed |
| New EP: refresh available from source (Add column) | Re-discover + AI for new cols only | **Create new** |
| `row-transform.util` / apply-mapping / load / streaming | Project to selected schema cols | **Modify** |
| Schema drift processor | Append to `availableColumns` | **Modify** |
| `AuditAction` + DatasetService audit | Log selection changes | **Create new** (action) + **Modify** service |
| Migration script (per workspace datasets) | Backfill selected + availableColumns | **Create new** |
| schema-review-step UI | Selection table + validations | **Modify** |
| dataset-detail UI | Edit Schema / Add column | **Modify** |
| Canonical mapping dropdowns | Source options = selected (or available for mapping before confirm) | **Modify** (ripple) |
| Incremental sync / PK UI | PK must be among selected; messaging when missing | **Modify** (ripple) |
| Dashboard widgets referencing dropped cols | Out of scope | **Safe / skip** |

## Reuse opportunities
- Existing EP-DATA-40 pattern for schema patches; extend rather than duplicate.
- `AuditLogService.log()` from dashboards module.
- `row-transform.util` / unused `connector.normalize()` as projection helper.
- Shared identify logic extracted from `IdentifyColumnsStep` for setup + Add column (new cols only).

## Risk
- **Complexity:** High
- **Cross-module:** Yes (Data + Pipelines + Audit + Portal)
- **Migration:** Yes (per-workspace datasets)
- **Notable risks:** Wizard timing vs identify-columns; dual AI prompts; drift appending to wrong array; mapping mandatory-field reject on deselect; streaming + buffered paths both need projection

## Recommendation
- **Create:** refresh-available-columns endpoint (or method on EP-DATA-22 with merge mode); audit action; migration script; shared identify/selection service helper
- **Complete:** schema-review + dataset-detail selection UX; confirm-selection prune on EP-DATA-40 or sibling EP
- **Modify:** Dataset model, identify-columns + prompt, discoverSchema, row transforms/load/streaming, schema drift, planning docs listed above

## Code files (implementation shortlist)

**Backend**
- `roya-ai-dynamo-api/src/modules/data/schemas/dataset.schema.ts`
- `roya-ai-dynamo-api/src/modules/data/dto/dataset.dto.ts`
- `roya-ai-dynamo-api/src/modules/data/services/dataset.service.ts`
- `roya-ai-dynamo-api/src/modules/data/controllers/datasets.controller.ts`
- `roya-ai-dynamo-api/src/modules/pipelines/steps/identify-columns.step.ts`
- `roya-ai-dynamo-api/src/integrations/ai/prompts/column-identify.md`
- `roya-ai-dynamo-api/src/modules/pipelines/steps/row-transform.util.ts`
- `roya-ai-dynamo-api/src/modules/pipelines/steps/apply-mapping.step.ts`
- `roya-ai-dynamo-api/src/modules/pipelines/steps/load.step.ts`
- `roya-ai-dynamo-api/src/integrations/connectors/streaming/streaming-sync.coordinator.ts` (if transformBatch needs hook)
- `roya-ai-dynamo-api/src/modules/data/processors/data-sync.processor.ts`
- `roya-ai-dynamo-api/src/modules/audit/schemas/audit-log.schema.ts`
- New: migration/seed script for availableColumns backfill

**Frontend**
- `roya-ai-dynamo-frontend/src/app/core/models/data.models.ts`
- `roya-ai-dynamo-frontend/src/app/core/services/data.service.ts`
- `roya-ai-dynamo-frontend/src/app/shared/components/schema-review-step/*`
- `roya-ai-dynamo-frontend/src/app/pages/data/dataset-detail/*`
- `roya-ai-dynamo-frontend/src/app/pages/data/setup/dataset-setup-wizard.page.ts` (confirm wiring)
- i18n EN/AR files for new strings
