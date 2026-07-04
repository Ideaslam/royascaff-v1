# AI-Control Engine — Flow Router

## How to Use

Read this file first on every task. It tells you which flow file to load based on the current phase.

## Phase Routing

| Phase | Purpose | Flow File |
|-------|---------|-----------|
| 0–4 | Initial Build (used once) | `engine/flows/initial-build.md` |
| 5 | Change Mode (the daily workflow) | `engine/flows/change-mode.md` |
| 6 | Bug Fix | `engine/flows/bug-fix.md` |
| R | Reverse-Engineer existing codebase | `engine/flows/reverse-engineer.md` |

## Global Conventions

See `engine/conventions.md` for all defaults (route prefix, auth model, envelope, pagination, UI states).

## Two Zones

- **`engine/`** — this router, flows, generic templates (`engine/templates/`), and generic
  backend/frontend rules (`engine/rules/`). Reusable across any product.
- **`project/`** — the living blueprint and single source of truth for the current system:
  `profile.md`, `description.md`, `plan/`, `actions/`, `rules.md`, `verify/`, `changes/`.

## Project Files Quick Reference

- **System identity**: `project/profile.md`, `project/description.md`
- **Planning**:
  - `project/plan/modules.md` (includes features)
  - `project/plan/data-model.md`
  - `project/plan/roles-and-authorization.md`
- **Business rules**: `project/rules.md`
- **Backend specs**:
  - `project/actions/backend/endpoints/` (per-module files + `_index.md` registry)
  - `project/actions/backend/services/` (per-module files + `_index.md` registry)
- **Frontend specs**:
  - `project/actions/customer-portal/pages/` (per-module files)
  - `project/actions/admin-panel/pages/` (per-module files)
- **Engine rules**: `engine/rules/backend-rule.md`, `engine/rules/frontend-rule.md`
- **Templates**: `engine/templates/`

## Traceability Chain

```
Data Model → Services → Endpoints → Pages/Views
```

- **Generation order**: services first, then endpoints, then client specs.
- **Dependency direction**: Pages → Endpoints → Services → Repositories/Providers
