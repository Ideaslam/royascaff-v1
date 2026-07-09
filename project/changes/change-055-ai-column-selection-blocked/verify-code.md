# Verification — AI Column Selection + Blocked Columns (change-055)

## Plan Consistency (pre-build)
- [x] EP-DATA-40/48/49 in `endpoints/data.md`
- [x] SVC-DATA-DS methods + IdentifyColumnsStep in services docs
- [x] `Dataset.availableColumns` + selection/blocked fields in `data-model.md`
- [x] schema-review + dataset-detail UX in `pages/data.md`
- [x] RULE-DATA-005 in `rules.md`
- [x] Auth: JWT on new endpoints

## Code Verification (post-build)
- [x] `DiscoveredColumn`: `isSelected`, `selectionOrder`, `blocked`; `Dataset.availableColumns`
- [x] `column-identify.md` v2 + `ColumnIdentifyService` shared helper
- [x] `discoverSchemaWithAiProposal` writes availableColumns + identify AI (option A)
- [x] EP-DATA-48 `POST …/confirm-schema-selection` (prune, mapping strip, audit, syncing guard)
- [x] EP-DATA-49 `POST …/refresh-available-columns` (Add column; AI for new cols only)
- [x] EP-DATA-40 extended for selection flags (no prune)
- [x] IdentifyColumnsStep merges into `availableColumns`; AI fail → select none
- [x] Row projection in `row-transform.util` + `apply-mapping` (buffered + streaming path)
- [x] Schema drift appends to `availableColumns`
- [x] AuditAction `dataset.schema_selection`
- [x] Migration script `npm run migrate:available-columns`
- [x] Frontend models/service; schema-review selection UI (checkbox/order/PK/blocked, drag + up/down)
- [x] Wizard: confirm selection then confirm mapping
- [x] Dataset detail: Edit Schema / Add Column / Save Selection
- [x] EN/AR i18n strings
- [x] API `tsc --noEmit` clean
- [x] Layering: controller → service → repo; no FE direct external URLs

## Acceptance Criteria
1. [x] One column-identify call returns descriptions, PK, isSelected/order, blocked (~25 + FKs); AI fail → select none
2. [x] blocked forces unselected; UI disabled + alert; API rejects select blocked
3. [x] Schema-review + dataset-detail table columns + reorder; i18n
4. [x] Confirm ≥1; missing PK allowed with message; mandatory map deselect → 422; PK deselect requires new PK; syncing → 409
5. [x] After confirm, live schema = selected; mapping stripped; sync projects selected only
6. [x] availableColumns + Add column refresh + AI new cols; manual sync for OLAP data
7. [x] Migration backfill script
8. [x] Audit on confirm; failed confirm leaves schema unchanged (no partial write on throw before update)
9. [x] Shared pipeline for all sources

## Result: **PASS**

## Overall: PASS
