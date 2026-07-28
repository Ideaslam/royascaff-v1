# Endpoints — Safqa API · Proposal Pipeline (Phase 4)

> Auth: `WorkspaceAuthGuard` + PermissionGuard. Prefix: `/api`.
> All mutations require `pipelineV3Enabled`.

## Delta

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-PROP-PIPE-05 | POST | /api/data/proposals/:id/regenerate | `projects.edit` or `proposal.create` | `{ useLatestDna?: boolean }` | `202` { proposalId, runId } | ProposalRegenerateService | done | from step 2; archives revisions |
| EP-PROP-PIPE-06 | POST | /api/data/proposals/:id/translate | same | `{ lang: "en"\|"ar" }` | `202` { proposalId, runId, lang } | TranslateOrchestrator | done | then assemble/export |
| EP-PROP-PIPE-07 | POST | /api/data/proposals/:id/rerender | same | optional `{ lang? }` | `202` { proposalId, runId } | regenerate.rerender | done | steps 4→5 only |
| EP-PROJECTS-10 | POST | /api/data/projects/:id/proposals | `projects.create` | `{ templateKey, language, themeOverrides?, fromStep?, sourceProposalId? }` | proposal | createProposalFromProject | done | sibling = new doc; map-only if DNA |

## Existing (unchanged this pack)

- EP-PROP-PIPE-01 status, EP-PROP-PIPE-03 sections/retry, EP-PROP-PIPE-04 rendered
- EP-PROJECTS-09 regenerate-dna

## Deferred

| Route | Pack |
|-------|------|
| FE controls | change-20260726-000009 |
| export-pdf re-render alias | optional fold into rerender |
| Content carry-over on template switch | v3.1 |
