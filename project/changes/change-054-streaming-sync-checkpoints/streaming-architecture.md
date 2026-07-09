# Streaming sync architecture (all sources)

## Interfaces (`integrations/connectors/streaming/`)

| Type | Role |
|------|------|
| `StreamingSyncCapability` | Declared on each connector — enabled, pageSizeKey, resumeStrategy, deferFullExtractToLoad |
| `StreamingExtractRequest` | startPage + pageSize contract for `extract()` |
| `StreamingBatchResult` | Persisted checkpoint shape |
| `StreamingLoadContext` / `StreamingLoadResult` | Coordinator I/O |
| `StreamingSyncCoordinator` | Shared load loop: extract page → transform → insert → appendBatch |

## Connector opt-in

```ts
readonly streamingSync: StreamingSyncCapability = {
  enabled: true,
  pageSizeKey: 'zid',           // → sync.pageSizes.zid / SYNC_PAGE_SIZE_ZID
  defaultPageSize: 100,
  maxPageSize: 100,             // API hard limit
  resumeStrategy: 'page',       // or 'skip-pages' (Shopify cursor)
  deferFullExtractToLoad: true,
};
```

| Source | resumeStrategy | Env |
|--------|----------------|-----|
| sql_server | page | `SYNC_PAGE_SIZE_SQL_SERVER` |
| mongodb_atlas | page | `SYNC_PAGE_SIZE_MONGODB_ATLAS` |
| zid | page | `SYNC_PAGE_SIZE_ZID` (max 100) |
| salla | page | `SYNC_PAGE_SIZE_SALLA` (max 60) |
| shopify | skip-pages | `SYNC_PAGE_SIZE_SHOPIFY` (max 250) |
| google_sheets | page | `SYNC_PAGE_SIZE_GOOGLE_SHEETS` |
| csv | page | `SYNC_PAGE_SIZE_CSV` |

## Pipeline flow

1. **ExtractStep** — if `streamingSync.deferFullExtractToLoad`: keep ≤50 sample rows; set `metadata.streamLoad`.
2. **LoadStep** — if capability enabled: `StreamingSyncCoordinator.loadStream(...)`.
3. On failure with `lastCompletedPage >= 1` → `canResume`; **Continue Sync** sets `resumeFromPage`.

## Adding a new source

1. Implement `extract(..., { startPage, pageSize })`.
2. Set `readonly streamingSync: StreamingSyncCapability`.
3. Add `SYNC_PAGE_SIZE_<SOURCE>` to `.env` + `config.sync.pageSizes`.
4. No changes to Extract/Load steps required.
