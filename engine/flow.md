# AI-Control Engine — Flow Router

## How to Use

Read this file first on every task. It tells you which flow file to load based on the current phase.

**Resuming work? Read `project/status.md` first.** It is the bird's-eye build state — what is `done`, what is `partial` (in progress), what is `planned` (next up), and what is `deferred` (postponed, with reasons). Per-artifact status also lives in every spec file and is rolled up in each `_index.md`. See `engine/conventions.md` → **Build Status** for the vocabulary and rules.

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
  `profile.md`, `description.md`, `plan/`, `actions/`, `rules.md`, `verify/`, `changes/`, `status.md`.

## Project Files Quick Reference

- **Build state / roadmap**: `project/status.md` (read first when resuming)
- **System identity**: `project/profile.md`, `project/description.md`
- **Planning**:
  - `project/plan/modules.md` (includes features)
  - `project/plan/data-model.md`
  - `project/plan/roles-and-authorization.md`
- **Business rules**: `project/rules.md`
- **Backend specs** (per API app from `profile.md`):
  - `project/actions/<api-app>/endpoints/` (per-module files + `_index.md` registry)
  - `project/actions/<api-app>/services/` (per-module files + `_index.md` registry)
- **Client specs** (per web/mobile app from `profile.md`):
  - `project/actions/<web-app>/pages/` or `project/actions/<mobile-app>/views/` (per-module files)
- **Engine rules**: `engine/rules/backend-rule.md`, `engine/rules/frontend-rule.md`
- **Templates**: `engine/templates/`

## Traceability Chain

```
Data Model → Services → Endpoints → Pages/Views
```

- **Generation order**: services first, then endpoints, then client specs.
- **Dependency direction**: Pages → Endpoints → Services → Repositories/Providers
