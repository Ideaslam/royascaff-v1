# Endpoints — Safqa API · Projects (Phase 2)

> Auth: `WorkspaceAuthGuard` + `PermissionGuard` as noted. Prefix: `/api`.

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-PROJECTS-01 | POST | /api/data/projects | permission:`projects.create` | body: create dto (info, services, clientId, …) | `201` project | ProjectsDataService.create | planned | competitors ≤3 |
| EP-PROJECTS-02 | GET | /api/data/projects | permission:`projects.view` | list query | `200` page | list | planned | |
| EP-PROJECTS-03 | GET | /api/data/projects/:id | permission:`projects.view` | param | `200` project | get | planned | |
| EP-PROJECTS-04 | PATCH | /api/data/projects/:id | permission:`projects.edit` | body patch | `200` project | update | planned | |
| EP-PROJECTS-05 | DELETE | /api/data/projects/:id | permission:`projects.delete` | param | `200` ok | archive | planned | soft archive preferred |
| EP-PROJECTS-06 | POST | /api/data/projects/:id/rfp | permission:`projects.edit` | multipart file | `200` rfp meta | ProjectRfpService | planned | async parse ok if status returned |
| EP-PROJECTS-07 | POST | /api/data/projects/:id/images | permission:`projects.edit` | multipart files | `200` images[] | ProjectImagesService | planned | |
| EP-PROJECTS-08 | GET | /api/data/projects/:id/dna | permission:`projects.view` | param | `200` dna \| 404 | ProjectDnaService.getDna | planned | |
| EP-PROJECTS-09 | POST | /api/data/projects/:id/regenerate-dna | permission:`projects.edit` | optional body | `202` { projectId, runId? } | enqueueRegenerateDna | planned | |
| EP-PROJECTS-10 | POST | /api/data/projects/:id/proposals | permission:`projects.create` or `proposal.create` | `{ templateKey, language, themeOverrides? }` | `201/202` proposal + generation | ProposalPipelineService.createProposalFromProject | planned | starts analyze→map |
