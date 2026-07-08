# project/plan/

## Purpose

This folder contains the **planning documents** that define the system's modules, features, services, and data model. They are part of `project/` — the single source of truth for the current system.

## Files

Generated in Phase 1 of the framework:

- **`modules.md`** — Module map with features inlined (merged from old `modules.md` + `features.md`)
- **`data-model.md`** — Database schema and entity definitions (field-table format)
- **`roles-and-authorization.md`** — Two-layer role model (System `UserRole` vs Workspace `WorkspaceRole`)

(Service and endpoint specs live per-module in `project/actions/backend/services/` and `project/actions/backend/endpoints/`. See their `_index.md` registries for routing.)

## Usage

These files are generated from:
- `project/description.md` (product specification)
- `project/profile.md` (system profile)
- `engine/templates/` (structured templates)
- Prior planning documents in the sequence

Follow the orchestration steps in `engine/flow.md` to keep these documents consistent. In Change Mode (Phase 5) they are updated in place so the plan always equals the latest state of the code.
