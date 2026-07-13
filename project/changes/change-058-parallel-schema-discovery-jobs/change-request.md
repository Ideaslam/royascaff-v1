# Change Request

## Metadata
- **date**: 2026-07-13
- **change-type**: modify-feature
- **target-app**: customer-portal
- **affected-repos**: backend+frontend
- **priority**: high

## Scope
- Module(s): Data; Pipelines (schema-discovery as background work shared by all consumers); Background Jobs
- Feature(s): Select What to Import (Entity Selection); Schema Discovery + AI Column Selection + Mapping; Manage Datasets (Add column / re-discover); Setup wizard + Source detail add-tables
- Endpoint(s): Modify EP-DATA-44 (`from-entities`) to enqueue jobs; add poll/retry discovery status endpoints; make EP-DATA-22 (re-discover) and EP-DATA-49 (refresh available columns / Add column) enqueue background jobs
- Page(s)/View(s): customer-portal: dataset setup wizard (`select-entities` → discovery status list → `schema-review`); source-detail add-tables flow
- Service(s): DatasetService (`createFromEntities`, `discoverSchemaWithAiProposal`); new schema-discovery BullMQ worker; ColumnIdentifyService (unchanged AI); frontend DataService + wizard/status UI

## Description

### Problem
When the user selects many tables/collections in data-source setup (or when adding tables later from source detail), `createFromEntities` runs `discoverSchemaWithAiProposal` (including `identify-columns` AI) **sequentially in the same HTTP request**. The client feels poor UX (long blocked wait, little per-table visibility). AI usage logs show one call completing while others stay `pending`.

### Desired behavior
For **any** path that runs schema discovery + column-identify (wizard multi-select, add-tables, re-discover, Add column), processing runs as **parallel BullMQ background jobs** (one job per dataset), not a long synchronous loop.

After entity selection:
1. Create datasets quickly and return (with a shared optional `schemaDiscoveryBatchId`).
2. Enqueue one `schema-discovery` job per dataset; jobs run in parallel (concurrency > 1).
3. UI shows a **row per table**: name | status badge (`queued` / `running` / `success` / `failed`) | error | **Retry** on failed.
4. Frontend polls every **5 seconds** until all selected jobs are terminal.
5. **Continue/Next** to schema-review is allowed when **≥1 success** and **none still queued/running**; failed tables are **skipped** but remain with Retry (no auto-delete).
6. Retry re-enqueues only that failed dataset’s discovery job.

AI prompts/models and “AI fail → select none” behavior are unchanged. Admin panel is out of scope. No data migration required (new Dataset fields with safe defaults).

### Who is affected
Customer Portal editors/admins during data-source setup and when adding tables from source detail.

### Out of scope
- Changing identify-columns AI prompt/model behavior
- Parallelizing ingest/sync pipeline itself
- Admin panel / AI usage UI redesign
- WebSockets (poll every 5s for v1)
- New audit events (reuse existing discovery logging)

### Constraints
Must not break: CSV single-file flow, existing schema-review/mapping confirm, idempotent `from-entities`, AI fail → select none, subscription limits, workspace ownership JWT auth. Poll responses must not expose raw rows or credentials.

### User story (happy path)
Editor connects a multi-table source → selects N tables → sees N status rows updating in parallel → when all terminal and at least one succeeded → Continues to schema-review for successful tables → can Retry any failed row without blocking others.

### Edge / permissions
- Empty entity list → 400; retry only for `failed` (and allowed stale `queued` if needed)
- Missing dataset/connection → 404; deleted mid-run → job no-ops safely
- Leave wizard and return → resume polling by batch/connection
- Same JWT + workspace ownership as today’s data endpoints; no new sensitive data in status APIs

## Acceptance Criteria
1. Selecting multiple entities via setup wizard or source-detail add-tables creates datasets and enqueues **one schema-discovery background job per dataset**; HTTP returns without waiting for all AI calls.
2. Schema-discovery jobs for a multi-select batch run **in parallel** (BullMQ concurrency > 1), not one-after-another in a single request loop.
3. Each Dataset exposes discovery status fields (`schemaDiscoveryStatus`, optional error, timestamps, optional `schemaDiscoveryBatchId`) with defaults safe for existing records (no migration).
4. Customer Portal shows a per-table status list (name, badge, error, Retry) matching existing progress UI patterns; polls every **5 seconds** until all jobs in the batch are terminal.
5. **Continue/Next** to schema-review is enabled only when ≥1 dataset is `success` and none remain `queued`/`running`; failed datasets are skipped with a visible **Retry** that re-enqueues that job only.
6. Re-discover (EP-DATA-22) and Add-column refresh (EP-DATA-49) also enqueue background schema-discovery jobs (same status model), not long synchronous AI in the request.
7. CSV single-table flow, schema-review/mapping confirm, idempotent `from-entities`, AI-fail→select-none, subscription limits, and JWT/workspace ownership continue to work.
8. Status/retry APIs use the same JWT auth and ownership checks; responses do not include raw rows or credentials; no new audit events required.
9. EN + AR i18n strings exist for statuses and Retry/Continue actions; RTL layout remains correct.

## Notes (optional)
- Prefer extending **Dataset** + BullMQ queue over a new collection.
- Treat schema discovery as shared pipeline/background work so every feature that triggers it benefits.
- Priority: **high** — multi-table setup UX is currently blocking and feels poor.
