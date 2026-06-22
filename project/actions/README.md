# project/actions/

## Purpose

This folder contains the **action specifications** that define backend endpoints and frontend pages. They are part of `project/` — the single source of truth for the current system.

## Files

Generated in Phase 2 of the framework:

- **`services.md`** — Backend service map (internal domain services and external integration providers); heads the call chain `pages → endpoints → services → repositories`
- **`endpoints.md`** — Complete backend API specification with routes, methods, DTOs, and constraints
- **`pages.md`** — Complete frontend page specification with routes, components, services, and states
- **`pages-<app-slug>.md`** — Additional pages spec per extra app (created in Phase 5 for a `new-app`)

**Order matters:** create `services.md` first, then `endpoints.md`, then `pages.md`.

## Usage

These files are generated from:
- All planning documents in `project/plan/`
- `project/rules.md` (system-specific rules) and `engine/rules/` (generic rules)
- `engine/templates/` (structured templates)

Follow the orchestration steps in `engine/flow.md` to keep these documents consistent. In Change Mode (Phase 5) they are updated in place so the plan always equals the latest state of the code.
