# Services — Projects FE wiring (pack delta)

## Delta
No new backend endpoints. Document FE service methods that call existing API.

### SVC-PROJECTS FE · ProjectsService (web)
- Status: planned
- Methods to add:
  - `patch(id, body)` → `PATCH /api/data/projects/:id` — body may include `name`, `type`, `clientId`, `info`, `services` (server recomputes financial)
  - `delete(id)` / `archive(id)` → `DELETE /api/data/projects/:id` (soft archive)
  - `getDna(id)` → `GET /api/data/projects/:id/dna`
- Rules: permissions enforced server-side (`projects.edit` / `projects.delete` / `projects.view`); FE gates buttons with `*appHasPermission`
- Notes: BE `update` already merges `info` and normalizes competitors (change-012)
