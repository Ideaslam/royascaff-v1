# Endpoints — Safqa API · Proposal Pipeline (Phase 2 subset)

> Auth: `WorkspaceAuthGuard`. Prefix: `/api`.
> Create-from-project lives at EP-PROJECTS-10; this file owns status polling (+ optional alias).

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-PROP-PIPE-01 | GET | /api/data/proposals/:id/status | permission:`proposal.view` or `projects.view` | param | `200` generation snapshot (status, steps.dna, steps.map, error, sectionMap summary?) | ProposalPipelineService.getGenerationStatus | planned | poll 3–5s while non-terminal |
| EP-PROP-PIPE-02 | GET | /api/data/proposals/:id/section-map | permission:`proposal.view` | param | `200` sectionMap \| 404 | read proposal.sectionMap | planned | optional convenience; may fold into status |

## Deferred (later packs)

| Route | Pack |
|-------|------|
| POST …/regenerate (from step 2) | change-008 |
| POST …/sections/retry | change-007/008 |
| POST …/translate, rerender, export-pdf | change-007/008 |
