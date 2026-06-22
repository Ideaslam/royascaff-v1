# project/plan/

## Purpose

This folder contains the **planning documents** that define the system's modules, features, services, and data model. They are part of `project/` — the single source of truth for the current system.

## Files

Generated in Phase 1 of the framework:

- **`modules.md`** — Module map grouping business capabilities into backend/frontend modules
- **`features.md`** — Feature specifications organized by module
- **`data-model.md`** — Database schema and entity definitions

(The service map lives in the API app's `project/actions/<api-app>/services.md` — e.g. `backend/services.md` — it heads the action call chain.)

## Usage

These files are generated from:
- `project/description.md` (product specification)
- `project/profile.md` (system profile)
- `engine/templates/` (structured templates)
- Prior planning documents in the sequence

Follow the orchestration steps in `engine/flow.md` to keep these documents consistent. In Change Mode (Phase 5) they are updated in place so the plan always equals the latest state of the code.
