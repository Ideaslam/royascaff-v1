# Endpoints — Safqa API · Projects

> Auth: `WorkspaceAuthGuard` + `PermissionGuard` as noted. Prefix: `/api`.

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-PROJECTS-01 | POST | /api/data/projects | permission:`projects.create` | body: create dto | project | ProjectsDataService.create | done | competitors ≤3 |
| EP-PROJECTS-02 | GET | /api/data/projects | permission:`projects.view` | list query | page | list | done | |
| EP-PROJECTS-03 | GET | /api/data/projects/:id | permission:`projects.view` | param | project | get | done | |
| EP-PROJECTS-04 | PATCH | /api/data/projects/:id | permission:`projects.edit` | body patch | project | update | done | |
| EP-PROJECTS-05 | DELETE | /api/data/projects/:id | permission:`projects.delete` | param | ok | archive | done | soft archive |
| EP-PROJECTS-06 | POST | /api/data/projects/:id/rfp | permission:`projects.edit` | multipart `file` | rfp meta | uploadRfp | done | |
| EP-PROJECTS-07 | POST | /api/data/projects/:id/images | permission:`projects.edit` | multipart `files` | images[] | uploadImages | done | |
| EP-PROJECTS-08 | GET | /api/data/projects/:id/dna | permission:`projects.view` | param | dna \| 404 | getDna | done | |
| EP-PROJECTS-09 | POST | /api/data/projects/:id/regenerate-dna | permission:`projects.edit` | — | `{ projectId, runId }` | enqueueRegenerateDna | done | bumps dna.version; does not auto-rebuild proposals |
| EP-PROJECTS-10 | POST | /api/data/projects/:id/proposals | permission:`projects.create` | `{ templateKey, language, themeOverrides?, fromStep?, sourceProposalId? }` | proposal + generation | createProposalFromProject | done | sibling = new doc; map-only if DNA; pins dnaVersion |
