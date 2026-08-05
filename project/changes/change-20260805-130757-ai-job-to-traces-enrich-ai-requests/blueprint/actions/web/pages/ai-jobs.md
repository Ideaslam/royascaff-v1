# Pages — AI Jobs · change-20260805-130757

> After-state: **removed** from Safqa Web. Creative/pipeline observability → `/ai-requests`.

### AI Jobs List `PG-AIJOBS-01`
- Route: `/ai-jobs` — **removed**
- Status: planned (retire)
- Notes: delete/unwire component; remove from `app.routes.ts`

### AI Job Details `PG-AIJOBS-02`
- Route: `/ai-jobs/:id` — **removed**
- Status: planned (retire)
- Notes: delete/unwire component

## Nav

- Sidebar: remove `layout.sidebar.aiJobs` link to `/ai-jobs`
- Keep AI Requests nav when `pipeline-traces.read`

## FE cleanup

- Remove `AppDataService.listAiJobsAdmin` / `getAiJobByIdAdmin` (admin-only consumers)
- Keep `AiService` `/api/ai-jobs` create/get/stream for chat / residual callers
- i18n: sidebar key may remain unused or be deleted

## Delta

- No FE AI Jobs pages or nav.
- No calls to `/api/admin/ai-jobs*`.
