# AI-Control

A control tool that drives AI from a product description through planning, action specs, code
generation, and verification — and keeps the plan in sync with the code on every change.

It is split into two zones with a strict boundary.

## `engine/` — the control tool (generic, reusable)

How to build, never what this system is. Product-agnostic; reusable across any product with zero edits.

- `engine/flow.md` — the orchestration guide (Phases 0–5). **Start here.**
- `engine/templates/` — generic document templates.
- `engine/rules/` — generic backend and frontend conventions.

**The engine must never contain system-specific data** (repo names, brand colors, product-specific
stack or paths). Those live only in `project/`.

## `project/` — this system's blueprint (single source of truth)

What this system is and its current state. Copying `project/` alone must be enough for someone to
understand and rebuild the current app — this is the **rebuild test** (Verification check 14).

- `project/profile.md` — apps, repos, tech stack, brand tokens, environments, integrations. The engine
  refers to this for every concrete fact.
- `project/description.md` — the product specification.
- `project/plan/` — modules, features, data model.
- `project/actions/` — services, endpoints, and pages specifications (the call chain `pages → endpoints → services`).
- `project/rules.md` — system-specific feature rules (beyond the generic engine rules).
- `project/verify/` — full-system verification reports.
- `project/changes/` — `change-log.md` (append-only index, one row per change) plus one folder per change
  (`change-<NNN>-<slug>/`) holding its filled `change-request.md`, `recon.md` (existing-code review),
  `verify-plan.md`, and `verify-code.md`. The blank request form is the engine template
  `engine/templates/change-request-template.md`.

## The sync guarantee

In Change Mode (Phase 5) the `project/` docs are updated **in place** so the plan always equals the
latest state of the code. `project/changes/` keeps the history. The plan never drifts from the code, so
it stays a portable, self-contained blueprint.

## How to use

- **New build**: open `engine/flow.md` and follow Phase 0 → Phase 4.
- **Change an existing app**: create `project/changes/change-<NNN>-<slug>/` from `engine/templates/change-request-template.md`, fill it, then run Phase 5.
