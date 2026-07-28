# Endpoints — Safqa API · Proposals

> Auth default: `WorkspaceAuthGuard` (JWT Bearer + workspace). Only deviations noted.
> Prefix: `/api` (not `/api/v1`).

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-PROPOSALS-01 | GET | /api/data/proposals | authenticated | list query | paginated | ProposalsDataService | done | summary includes `pipelineVersion`, `projectId`, `language` |
| EP-PROPOSALS-02 | GET | /api/data/proposals/search | authenticated | search query | paginated | ProposalsDataService | done | |
| EP-PROPOSALS-03 | GET | /api/data/proposals/lite | authenticated | list query | lite[] | ProposalsDataService | done | |
| EP-PROPOSALS-04 | GET | /api/data/proposals/dashboard | authenticated | ?period | dashboard dto | ProposalsDataService | done | |
| EP-PROPOSALS-05 | GET | /api/data/proposals/:id | authenticated | param | proposal | ProposalsDataService | done | |
| EP-PROP-PIPE-01 | GET | /api/data/proposals/:id/status | authenticated | param | generation snapshot + `stuck`/`canResume`/`hasQueueWork` | ProjectsDataService | done | through ready/partially_failed |
| EP-PROP-PIPE-03 | POST | /api/data/proposals/:id/sections/retry | permission:`projects.edit` | `{ instanceIds? }` | `202` enqueued | SectionOrchestrator | done | failed sections only |
| EP-PROP-PIPE-04 | GET | /api/data/proposals/:id/rendered | authenticated | ?lang= | `{ htmlUrl, pdfUrl }` | ProjectsDataService | done | when exported |
| EP-PROP-PIPE-05 | POST | /api/data/proposals/:id/regenerate | permission:`projects.edit` | `{ useLatestDna? }` | `{ proposalId, runId }` | ProposalRegenerateService | done | flag gated |
| EP-PROP-PIPE-06 | POST | /api/data/proposals/:id/translate | permission:`projects.edit` | `{ lang }` | `{ proposalId, runId, lang }` | TranslateOrchestrator | done | flag gated |
| EP-PROP-PIPE-07 | POST | /api/data/proposals/:id/rerender | permission:`projects.edit` | `{ lang? }` | `{ proposalId, runId }` | ProposalRegenerateService | done | flag gated |
| EP-PROP-PIPE-08 | POST | /api/data/proposals/:id/resume | permission:`projects.edit` | — | `202` `{ proposalId, runId, status, enqueued }` | PipelineResumeService | done | durable resume; flag gated |
| EP-PROPOSALS-06 | POST | /api/data/proposals | authenticated | body | created | ProposalsDataService | done | |
| EP-PROPOSALS-07 | PATCH | /api/data/proposals/:id | authenticated | body | updated | ProposalsDataService | done | |
| EP-PROPOSALS-08 | DELETE | /api/data/proposals/:id | authenticated | param | ok | ProposalsDataService | done | |
| EP-PROPOSALS-09 | PATCH | /api/proposals/:id/info | authenticated | body | updated | ProposalsService | done | basic fields |
| EP-PROPOSALS-10 | PUT | /api/proposals/:id/technical | authenticated | body HTML/lang | updated | ProposalsService | done | syncs `renderedByLang[lang].htmlUrl` for v3 |
| EP-PROPOSALS-11 | PUT | /api/proposals/:id/financial | authenticated | body HTML/lang | updated | ProposalsService | done | URL maps only |
| EP-PROPOSALS-12 | GET | /api/proposals/document-html | authenticated | query | html | ProposalsService | done | technical falls back to `renderedByLang` |
| EP-PROPOSALS-13 | POST | /api/proposals/store-s3 | authenticated | body html | {htmlUrl} | ProposalsService | done | |
| EP-PROPOSALS-14 | POST | /api/proposals/send-email | authenticated | body | ok | ProposalSendingService | done | |
