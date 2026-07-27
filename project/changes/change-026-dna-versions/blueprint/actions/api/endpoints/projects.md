# Endpoints — Projects · DNA versions (pack after-state)

> Auth: `WorkspaceAuthGuard` + `PermissionGuard`. Prefix: `/api`.

## Modified

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-PROJECTS-01 | POST | /api/data/projects | `projects.create` | shell + first DNA inputs (`title?`, info, services, colorPalette, …) | `{ project, dnaVersion }` | create | planned | creates shell + first version |
| EP-PROJECTS-04 | PATCH | /api/data/projects/:id | `projects.edit` | `{ name?, clientId?, type? }` only | project | updateShell | planned | reject/ignore input fields that moved to DNA |
| EP-PROJECTS-10 | POST | /api/data/projects/:id/proposals | `projects.create` | `{ templateKey, language, dnaVersionId?, themeOverrides?, fromStep?, sourceProposalId? }` | proposal + generation | createProposalFromProject | planned | default latest ready; pins id + dnaSnapshot |

## New — DNA versions

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-PROJECTS-12 | GET | /api/data/projects/:id/dna-versions | `projects.view` | — | `{ items: light[] }` | list | planned | title, status, dates |
| EP-PROJECTS-13 | POST | /api/data/projects/:id/dna-versions | `projects.edit` | `{ title?, copyFromVersionId?, …inputs? }` | dnaVersion | create | planned | blank or copy |
| EP-PROJECTS-14 | GET | /api/data/projects/:id/dna-versions/:vid | `projects.view` | — | full version | get | planned | |
| EP-PROJECTS-15 | PATCH | /api/data/projects/:id/dna-versions/:vid | `projects.edit` | inputs patch (info/services/palette/…) | version | updateInputs | planned | |
| EP-PROJECTS-16 | PATCH | /api/data/projects/:id/dna-versions/:vid/rename | `projects.edit` | `{ title }` required | version | rename | planned | duplicates OK |
| EP-PROJECTS-17 | DELETE | /api/data/projects/:id/dna-versions/:vid | `projects.delete` | — | ok | delete | planned | hard delete; 409 if generating |
| EP-PROJECTS-18 | POST | /api/data/projects/:id/dna-versions/:vid/generate | `projects.edit` | `{ confirmOverwrite?: boolean }` | `{ projectId, dnaVersionId, runId }` | enqueueGenerate | planned | 409 regenerating; confirm if ready |
| EP-PROJECTS-19 | PUT | /api/data/projects/:id/dna-versions/:vid/content | `projects.edit` | `{ data: DnaV2 }` | version | putContent | planned | AJV dna.v2 |
| EP-PROJECTS-20 | POST | /api/data/projects/:id/dna-versions/:vid/rfp | `projects.edit` | multipart file | rfp meta | uploadRfp | planned | version-scoped |
| EP-PROJECTS-21 | POST | /api/data/projects/:id/dna-versions/:vid/images | `projects.edit` | multipart + purposes/notes | images[] | uploadImages | planned | |
| EP-PROJECTS-22 | PATCH | /api/data/projects/:id/dna-versions/:vid/images | `projects.edit` | `{ images: […] }` | images[] | patchImages | planned | |

## Retired / shim (after cutover)

| ID | Route | Action |
|----|-------|--------|
| EP-PROJECTS-06/07/11 | project-level rfp/images | Prefer version-scoped 20–22; optional shim writing to latest version during transition |
| EP-PROJECTS-08 | GET `/:id/dna` | Shim → latest ready version dna or 404 |
| EP-PROJECTS-09 | POST `/:id/regenerate-dna` | Shim → generate on latest / 410 |

## Delta

- **Add** EP-PROJECTS-12..22
- **Narrow** EP-PROJECTS-04 shell-only
- **Extend** EP-PROJECTS-01 / 10 for first DNA + dnaVersionId
- **Retire/shim** project-level DNA get/regen and media uploads
