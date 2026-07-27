# Endpoints — Safqa API · Projects (pack delta)

### EP-PROJECTS-01 · Create Project
- `POST /api/data/projects`
- Status: planned
- Auth: JWT + workspace; `projects.create`
- Body delta: optional `colorPalette?: string[]` (1–5 `#RRGGBB` when set)
- Errors: **400** invalid hex / length >5 / length rules violated
- Response: project includes `colorPalette` when set

### EP-PROJECTS-04 · Patch Project
- `PATCH /api/data/projects/:id`
- Status: planned
- Auth: JWT + workspace; `projects.edit`
- Body delta: optional `colorPalette?: string[]` (same validation)
- Errors: same 400 rules
- Response: updated project

### EP-PROJECTS-09 · Regenerate DNA (existing)
- `POST /api/data/projects/:id/regenerate-dna`
- Status: done — **no contract change** for badge (FE-only cue)

## Delta

- **Extend** create + patch request DTOs with `colorPalette`
- **No** new routes
