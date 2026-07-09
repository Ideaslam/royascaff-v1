# Impact — change-054

## Feature state
Partial → complete for SQL Server / MongoDB Atlas streaming resume.

## Files changed

### Backend
- `config.ts` + `.env` — `SQL_SERVER_PAGE_SIZE`, `MONGO_ATLAS_PAGE_SIZE`
- `sync-run.schema.ts` — batches, lastCompletedPage, resumeFromPage, canResume
- `sync-run.repository.ts` — appendBatch, prepareContinue, canResume on fail/cancel
- `connector.interface.ts` — ExtractOptions.startPage / pageSize
- `sql-server.connector.ts` / `mongodb-atlas.connector.ts` — honour startPage + config page size
- `load.step.ts` — checkpoint after each batch; resume without truncate
- `pipeline.engine.ts` — resumeFromPage / rowsLoadedBefore metadata
- `data-sync.processor.ts` — pass resume; set canResume on failure
- `sync.service.ts` — listBatches, continueRun
- `datasets.controller.ts` — EP-DATA-47 batches, EP-DATA-48 continue

### Frontend
- `data.models.ts` — SyncBatchCheckpoint, SyncRunBatchesResponse
- `data.service.ts` — listSyncBatches, continueSyncRun
- `dataset-detail.page.*` — batch detail dialog, Continue Sync button

## Ripple
- Retry still creates a new FULL run (truncate).
- Continue reuses same SyncRun; appends from lastCompletedPage+1.
- Cancelled runs are continue-eligible when lastCompletedPage >= 1 (same as failed).
