# Endpoints — Safqa API · Proposal Pipeline (Phases 3–4)

> Auth: `WorkspaceAuthGuard` + PermissionGuard as noted. Prefix: `/api`.
> Create-from-project remains EP-PROJECTS-10 (gated by `pipelineV3Enabled`).
> All v3 mutations require `pipelineV3Enabled`.

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-PROP-PIPE-01 | GET | /api/data/proposals/:id/status | `proposal.view` or `projects.view` | param | generation + section counters + sectionMapReady + rendered + stuck/canResume | getGenerationStatus | done | |
| EP-PROP-PIPE-03 | POST | /api/data/proposals/:id/sections/retry | `projects.edit` | `{ instanceIds?: string[] }` | `{ proposalId, enqueued[] }` | retrySections | done | |
| EP-PROP-PIPE-04 | GET | /api/data/proposals/:id/rendered | authenticated | ?lang= | `{ htmlUrl, pdfUrl }` \| 404 | getProposalRendered | done | |
| EP-PROP-PIPE-05 | POST | /api/data/proposals/:id/regenerate | `projects.edit` | `{ useLatestDna?: boolean }` | `{ proposalId, runId }` | ProposalRegenerateService | done | from step 2; archives revisions |
| EP-PROP-PIPE-06 | POST | /api/data/proposals/:id/translate | `projects.edit` | `{ lang: "en"\|"ar" }` | `{ proposalId, runId, lang, enqueued }` | TranslateOrchestrator | done | then assemble/export |
| EP-PROP-PIPE-07 | POST | /api/data/proposals/:id/rerender | `projects.edit` | optional `{ lang? }` | `{ proposalId, runId }` | regenerate.rerender | done | steps 4→5 only |
| EP-PROP-PIPE-08 | POST | /api/data/proposals/:id/resume | `projects.edit` | — | `202` `{ proposalId, runId, status, enqueued }` | PipelineResumeService | done | Mongo-checkpoint resume; reconciler shares helper |

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
  "rendered": { "ar": { "htmlUrl": "…", "pdfUrl": "…" } } | null,
  "stuck": false,
  "canResume": false,
  "hasQueueWork": true
}
```

## Deferred

| Route | Pack |
|-------|------|
| Content carry-over on template switch | v3.1 |
