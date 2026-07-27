# Endpoints — Proposal pipeline resume

> Auth: `WorkspaceAuthGuard` + PermissionGuard. Prefix: `/api`.
> Requires `pipelineV3Enabled` where other pipeline mutations do.

## Delta

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-PROP-PIPE-08 | POST | `/api/data/proposals/:id/resume` | `projects.edit` | — (empty body) | `202` `{ proposalId, runId, status, enqueued }` | SVC-PIPE-RESUME-01 | planned | Idempotent; 404 if missing; 400 if not v3 / missing runId; 409 optional if already terminal **and** fully exported (`ready` with artifacts) — allow resume when stuck non-terminal or assemble/export incomplete |

## Errors

| Case | Status |
|------|--------|
| Not found / wrong workspace | 404 |
| Not pipeline v3 | 400 |
| Missing runId/projectId | 400 |
| Pipeline v3 disabled | same as other pipeline mutations |

## Existing (unchanged)

- `POST …/sections/retry` — failed-only retry for terminal UI
- `POST …/regenerate`, translate, rerender
