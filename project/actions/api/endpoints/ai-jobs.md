# Endpoints — Safqa API · AI Jobs

> Auth default: `WorkspaceAuthGuard` (JWT Bearer + workspace). Only deviations noted.
> Prefix: `/api` (not `/api/v1`).

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-AIJOBS-01 | POST | /api/ai-jobs/stream | authenticated | creative/chat payload | stream/SSE-ish | AiJobsService | done | legacy one-shot |
| EP-AIJOBS-02 | POST | /api/ai-jobs | authenticated | creative input | job | AiJobsService | done | creative pipeline v2 |
| EP-AIJOBS-03 | POST | /api/ai-jobs/test-process | authenticated | — | debug | AiJobsService | done | |
| EP-AIJOBS-04 | GET | /api/ai-jobs/html/:id | authenticated | param | html | AiJobsService | done | |
| EP-AIJOBS-05 | GET | /api/ai-jobs/:id | authenticated | param | job | AiJobsService | done | |
