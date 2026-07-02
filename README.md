# AI-Control

A control tool that drives AI from a product description through planning, action specs, code
generation, and verification — and keeps the plan in sync with the code on every change.

It is split into two zones with a strict boundary.

## `engine/` — the control tool (generic, reusable)

How to build, never what this system is. Product-agnostic; reusable across any product with zero edits.

- `engine/flow.md` — the flow router. **Start here.** Routes to the correct phase flow.
- `engine/conventions.md` — global defaults (route prefix, auth model, envelope, pagination, UI states).
- `engine/flows/` — phase-specific workflows:
  - `initial-build.md` — Phases 0–4 (used once)
  - `change-mode.md` — Phase 5 (daily workflow, with fast-track path)
  - `bug-fix.md` — Phase 6
- `engine/templates/` — generic document templates. Verbose guidance lives in `templates/references/`.
- `engine/rules/` — generic backend and frontend conventions.

**The engine must never contain system-specific data** (repo names, brand colors, product-specific
stack or paths). Those live only in `project/`.

## `project/` — this system's blueprint (single source of truth)

What this system is and its current state. Copying `project/` alone must be enough for someone to
understand and rebuild the current app — this is the **rebuild test**.

- `project/profile.md` — apps, repos, tech stack, brand tokens, environments, integrations.
- `project/description.md` — the product specification.
- `project/plan/` — modules (with features), data model, roles & authorization.
- `project/actions/` — action specs organized **per app** (from `profile.md`), split into **per-module files**:
  - `<api-app>/endpoints/` — per-module endpoint tables with `EP-` IDs + `_index.md` registry
  - `<api-app>/services/` — per-module service specs with `SVC-` IDs + `_index.md` registry
  - `<web-app>/pages/` or `<mobile-app>/views/` — per-module client specs + `_index.md` registry
- `project/rules.md` — system-specific feature rules with `RULE-` IDs.
- `project/verify/` — full-system verification reports (Phase 4).
- `project/changes/` — `change-log.md` (append-only index) plus one folder per change
  (`change-<NNN>-<slug>/`) holding its `change-request.md`, `impact.md`, and `verify-code.md`.
- `project/bugs/` — bug reports and fix log.

## The sync guarantee

In Change Mode (Phase 5) the `project/` docs are updated **in place** so the plan always equals the
latest state of the code. `project/changes/` keeps the history. The plan never drifts from the code, so
it stays a portable, self-contained blueprint.

## How to use

- **New build**: open `engine/flow.md` and follow Phase 0 → Phase 4.
- **Onboard an existing / legacy codebase**: open `engine/flows/reverse-engineer.md` and follow Phase R.0 → R.Done. This reads the code and populates `project/` automatically, then hands off to Phase 5/6 of `flow.md`.
- **Change an existing app**: create `project/changes/change-<NNN>-<slug>/` from `engine/templates/change-request-template.md`, fill it, then run Phase 5.
- **Fix a bug**: open `engine/flow.md`, route to Phase 6.
