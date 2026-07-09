# Change Request

## Metadata
- **date**: 2026-07-09
- **change-type**: new-feature
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: high

## Scope
- Module(s): Data (SyncRun), Pipelines (LoadStep / Extract), Customer Portal dataset detail
- Feature(s): Durable streaming sync with per-batch checkpoints, resume, batch history UI
- Endpoint(s):
  - `GET /data/datasets/:id/sync-runs/:runId/batches` (list batch log)
  - `POST /data/datasets/:id/sync-runs/:runId/continue` (resume from last completed batch)
  - existing sync-run list/detail enriched with checkpoint summary
- Page(s)/View(s): customer-portal dataset detail — sync history row expand + Continue Sync
- Service(s): SyncService, SyncRunRepository, LoadStep, SqlServerConnector (+ MongoDB Atlas), DataSyncProcessor

## Description

### Problem
Streaming sync (change-053) keeps memory low but is not durable: if the connection drops mid-sync, work is lost and Retry starts a brand-new FULL sync. Users cannot see per-batch progress or resume from the last successful page.

### Desired behavior
1. After each extract→load batch completes, persist a **batch checkpoint** on the SyncRun (page index, rows in batch, cumulative rows loaded, status, timestamps, optional error).
2. Clicking a sync-run row shows the **batch list** (page #, rows inserted, status, time).
3. If a sync **fails or stops**, a **Continue Sync** button resumes from the **next page after the last successful batch** (no truncate; append remaining pages). Does not re-insert already-loaded batches.
4. Batch log is stored in MongoDB (workspace-scoped), not only in process memory.

### Who
Merchants syncing large SQL Server / MongoDB tables.

### Out of scope
- Changing CSV / Sheets / e-commerce extract model (they stay buffered unless later extended).
- Cross-batch exact-row dedupe across the whole table.
- Pausing a running sync via UI (cancel already exists separately if present).

## Acceptance Criteria
1. During streaming load for `sql_server` / `mongodb_atlas`, each completed batch is written to `SyncRun.batches[]` (or embedded subdocs) with `{ page, rowsIn, rowsLoadedCumulative, status, startedAt, finishedAt, errorMessage? }`.
2. `GET …/sync-runs/:runId/batches` returns the batch list for that run.
3. Dataset detail: expanding/clicking a sync run shows batches + inserted rows per batch and cumulative total.
4. Failed/stopped runs show **Continue Sync**; calling continue re-queues the **same** SyncRun with `resumeFromPage = lastSuccessfulPage + 1`, skips FULL truncate, and loads remaining pages only.
5. After continue completes, status is DONE and `rowsLoaded` matches sum of successful batch row counts.
6. Fresh FULL sync still truncates once at start; resume never truncates.
7. Existing Retry (new FULL run) remains available for failed runs that the user wants to restart from scratch.

## Technical approach (proposed)

### Data model (`ws_{slug}_sync_runs`)
Add fields:
```ts
batches: [{
  page: number;           // 1-based OFFSET page
  rowsIn: number;
  rowsLoaded: number;     // same as rowsIn after insert (or less if filtered)
  status: 'done' | 'failed';
  startedAt: Date;
  finishedAt: Date;
  errorMessage?: string;
}]
lastCompletedPage: number | null;  // checkpoint for resume
resumeFromPage: number | null;     // set when continuing
canResume: boolean;                // derived / stored when failed mid-stream
```

### Load / extract
- Pass `startPage` via `ExtractOptions` (or metadata) into SQL Server / Mongo extract (`OFFSET` page / skip).
- LoadStep: for each batch → insert → **await syncRunRepo.appendBatch(...)** → update `rowsLoaded` + `lastCompletedPage`.
- On failure: mark last in-flight batch failed; set `canResume=true` if `lastCompletedPage >= 1`.

### Continue vs Retry
| Action | Behavior |
|--------|----------|
| **Continue Sync** | Same SyncRun; resume from `lastCompletedPage+1`; no truncate; append |
| **Retry** | New SyncRun; FULL from page 1; truncate (existing) |

### Frontend
- Sync history: expandable row or side panel with batch table.
- Buttons: **Continue Sync** (failed + canResume), keep **Retry**.

## Confirmed decisions (2026-07-09)
- **Batch size**: configurable via `SQL_SERVER_PAGE_SIZE` in `.env` (default 2000), read through `config.ts`.
- **Continue Sync**: available for both `failed` and `cancelled` runs (when `canResume` / `lastCompletedPage >= 1`).
- **UI**: detail panel (not inline expand) for batch list when clicking a sync-run row.

## Notes
- Builds on change-053 streaming load.
- Debug instrumentation from 053 can stay until this is verified, then removed.
- Next change number: **054**.
