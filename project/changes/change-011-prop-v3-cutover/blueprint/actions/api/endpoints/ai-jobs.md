# Endpoints — Safqa API · AI Jobs (cutover)

## Delta

- **Modify** EP-AIJOBS-01 / EP-AIJOBS-02 — soft-block **new** creative creates when `pipelineV3Enabled`
- GET / list / poller / in-flight processing unchanged

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-AIJOBS-01 | POST | /api/ai-jobs/stream | authenticated | creative/chat | stream | AiJobsService | done | reject `type=creative` (or default creative) when v3 on |
| EP-AIJOBS-02 | POST | /api/ai-jobs | authenticated | creative input | job | AiJobsService | done | same gate; chat type OK |

## Gate behavior (after-state)

When `isPipelineV3Enabled(workspaceId)`:
- New creative create → `403` or `409` with message: use Projects / pipeline v3; set `pipelineV3Enabled` false only for emergency legacy
- `type=chat` (if used) not blocked
- Existing jobs: GET + poller continue
