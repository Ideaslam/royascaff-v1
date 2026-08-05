# Pages — Proposals · change-20260805-130757

### Proposals List `PG-PROPOSALS-01`
- Route: `/proposals`
- Status: planned
- Components: table as today; **AI observability column** (rename from hardcoded `AIJob`):
  - Button **Open** (link icon) navigates to `/ai-requests` with query:
    - `projectId` when row has `projectId`
    - `proposalId` = row `id` when present
  - Enabled when `projectId` is set; disabled otherwise (legacy job-only rows without project)
  - Do **not** navigate to `/ai-jobs/:jobId`
- Service: AppDataService list unchanged
- Guard: MainLayout `authGuard`
- Notes:
  - i18n key for column (e.g. `proposals.columns.aiRequests` / “AI Requests”) — en + ar
  - Pending poll behavior unchanged (v2 proposal poll + legacy `jobId` subscribe)

## Delta

- Replace `openAiJobDetails(jobId)` with navigate to AI Requests query filters.
- Column label no longer “AIJob”.
- Technical / Financial / status / sort-by-date unchanged.
