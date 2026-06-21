# 3-plan/

## Purpose

This folder contains **generated planning documents** that define the system's modules, features, services, and data model.

## Generated Files

When following the `.ai-control` framework, AI will generate these files in Phase 1:

- **`modules.md`** — Module map grouping business capabilities into backend/frontend modules
- **`features.md`** — Feature specifications organized by module
- **`data-model.md`** — Database schema and entity definitions
- **`services.md`** — Backend service map (internal domain services and external integration providers)

## Usage

These files are generated from:
- `1-description.md` (product specification)
- `2-templates/` (structured templates)
- Prior planning documents in the sequence

**Order matters:** create `services.md` (Step 1.5) after the data model and before `4-actions/endpoints.md`. Endpoints call services; pages call endpoints.

Do not manually create these files. Follow the orchestration steps in `start.md` to generate them consistently.

## Status

This folder starts empty. Files appear here as you progress through Phase 1 of the framework.
