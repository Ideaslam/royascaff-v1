# Endpoints — Safqa API · Projects

> Auth: `WorkspaceAuthGuard` + `PermissionGuard` as noted. Prefix: `/api`.

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-PROJECTS-01 | POST | /api/data/projects | permission:`projects.create` | UpsertProjectDto (+ optional `dnaTitle`) | project + `dnaVersion` | create | done | creates project + first DNA version |
| EP-PROJECTS-02 | GET | /api/data/projects | permission:`projects.view` | list query | page | list | done | |
| EP-PROJECTS-03 | GET | /api/data/projects/:id | permission:`projects.view` | param | project | get | done | |
| EP-PROJECTS-04 | PATCH | /api/data/projects/:id | permission:`projects.edit` | PatchProjectDto | project | update | done | full patch still accepted; shell-only preferred; DNA form uses version patch |
| EP-PROJECTS-05 | DELETE | /api/data/projects/:id | permission:`projects.delete` | param | ok | archive | done | soft archive |
| EP-PROJECTS-06 | POST | /api/data/projects/:id/rfp | permission:`projects.edit` | multipart `file` | rfp meta | uploadRfp | done | legacy; prefer EP-PROJECTS-20 |
| EP-PROJECTS-07 | POST | /api/data/projects/:id/images | permission:`projects.edit` | multipart + purposes/notes | images[] | uploadImages | done | legacy; prefer EP-PROJECTS-21 |
| EP-PROJECTS-08 | GET | /api/data/projects/:id/dna | permission:`projects.view` | param | dna \| 404 | getDna | done | shim → latest ready version dna |
| EP-PROJECTS-09 | POST | /api/data/projects/:id/regenerate-dna | permission:`projects.edit` | — | `{ projectId, runId, dnaVersionId }` | enqueueRegenerateDna | done | shim → generate on latest/first version |
| EP-PROJECTS-10 | POST | /api/data/projects/:id/proposals | permission:`projects.create` | `{ templateKey, language, dnaVersionId?, themeOverrides?, fromStep?, sourceProposalId? }` | proposal + generation | createProposalFromProject | done | default latest ready; pins `dnaVersionId` + `dnaSnapshot` |
| EP-PROJECTS-11 | PATCH | /api/data/projects/:id/images | permission:`projects.edit` | `{ images: […] }` | images[] | patchImages | done | legacy; prefer EP-PROJECTS-22 |
| EP-PROJECTS-12 | GET | /api/data/projects/:id/dna-versions | permission:`projects.view` | — | `{ items }` | listDnaVersions | done | light rows |
| EP-PROJECTS-13 | POST | /api/data/projects/:id/dna-versions | permission:`projects.edit` | `{ title?, copyFromVersionId?, …inputs? }` | dnaVersion | createDnaVersion | done | blank or copy |
| EP-PROJECTS-14 | GET | /api/data/projects/:id/dna-versions/:vid | permission:`projects.view` | — | full version | getDnaVersion | done | |
| EP-PROJECTS-15 | PATCH | /api/data/projects/:id/dna-versions/:vid | permission:`projects.edit` | inputs patch | version | updateDnaVersionInputs | done | mirrors to project |
| EP-PROJECTS-16 | PATCH | /api/data/projects/:id/dna-versions/:vid/rename | permission:`projects.edit` | `{ title }` | version | renameDnaVersion | done | duplicates OK |
| EP-PROJECTS-17 | DELETE | /api/data/projects/:id/dna-versions/:vid | permission:`projects.delete` | — | ok | deleteDnaVersion | done | hard delete; 409 if generating |
| EP-PROJECTS-18 | POST | /api/data/projects/:id/dna-versions/:vid/generate | permission:`projects.edit` | `{ confirmOverwrite? }` | `{ projectId, dnaVersionId, runId }` | enqueueGenerateDnaVersion | done | 409 regenerating; 400 if ready without confirm |
| EP-PROJECTS-19 | PUT | /api/data/projects/:id/dna-versions/:vid/content | permission:`projects.edit` | `{ data: DnaV2 }` | version | putDnaVersionContent | done | AJV dna.v2 |
| EP-PROJECTS-20 | POST | /api/data/projects/:id/dna-versions/:vid/rfp | permission:`projects.edit` | multipart | rfp | uploadRfpForDnaVersion | done | |
| EP-PROJECTS-21 | POST | /api/data/projects/:id/dna-versions/:vid/images | permission:`projects.edit` | multipart + meta | images[] | uploadImagesForDnaVersion | done | |
| EP-PROJECTS-22 | PATCH | /api/data/projects/:id/dna-versions/:vid/images | permission:`projects.edit` | `{ images: […] }` | images[] | patchImagesForDnaVersion | done | |
