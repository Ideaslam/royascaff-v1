# Endpoints — Safqa API · Proposal Pipeline (Phase 3)

> Auth: `WorkspaceAuthGuard` + PermissionGuard as noted. Prefix: `/api`.
> Create-from-project remains EP-PROJECTS-10 (gated by `pipelineV3Enabled`).

## Delta

- **Extend** EP-PROP-PIPE-01 status payload (sections/assembly/export/rendered)
- **Create** EP-PROP-PIPE-03 retry; EP-PROP-PIPE-04 optional artifacts
- EP-PROP-PIPE-02 section-map still optional / folded into status

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-PROP-PIPE-01 | GET | /api/data/proposals/:id/status | `proposal.view` or `projects.view` | param | generation + section counters + sectionMapReady + rendered summary | getGenerationStatus | planned | extend existing |
| EP-PROP-PIPE-03 | POST | /api/data/proposals/:id/sections/retry | `projects.edit` or `proposal.create` | `{ instanceIds?: string[] }` (omit = all failed) | `202` { proposalId, enqueued[] } | retrySections | planned | only failed/ready-reset failed |
| EP-PROP-PIPE-04 | GET | /api/data/proposals/:id/rendered | `proposal.view` | ?lang= | `{ htmlUrl, pdfUrl }` \| 404 | read renderedByLang | planned | convenience when ready/partially_failed |

## Status payload (after-state)

```jsonc
{
  "proposalId": "…",
  "projectId": "…",
  "templateKey": "pitch-landscape",
  "language": "ar",
  "generation": { /* full generation object */ },
  "sectionMapReady": true,
  "sectionCount": 14,
  "sectionsReady": 12,
  "sectionsFailed": 2,
  "rendered": { "ar": { "htmlUrl": "…", "pdfUrl": "…" } } | null
}
```

## Deferred

| Route | Pack |
|-------|------|
| POST …/regenerate (from step 2) | change-20260726-000008 |
| POST …/translate, template-switch | change-20260726-000008 |
| FE stepper / PDF download UI | change-20260726-000009 |
