# Endpoints — Safqa API · AI Jobs

> Auth default: `WorkspaceAuthGuard` (JWT Bearer + workspace). Only deviations noted.
> Prefix: `/api` (not `/api/v1`).
> Soft cutover: new **creative** creates blocked when `pipelineV3Enabled` (403); chat / GET / poller unchanged.

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-AIJOBS-01 | POST | /api/ai-jobs/stream | authenticated | creative/chat payload | stream/SSE-ish | AiJobsService | done | creative blocked when v3 on |
| EP-AIJOBS-02 | POST | /api/ai-jobs | authenticated | creative input | job | AiJobsService | done | creative blocked when v3 on; escape hatch = flag false |
| EP-AIJOBS-03 | POST | /api/ai-jobs/test-process | authenticated | — | debug | AiJobsService | done | |
| EP-AIJOBS-04 | GET | /api/ai-jobs/html/:id | authenticated | param | html | AiJobsService | done | |
| EP-AIJOBS-05 | GET | /api/ai-jobs/:id | authenticated | param | job | AiJobsService | done | |
