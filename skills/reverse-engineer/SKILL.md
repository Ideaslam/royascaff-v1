---
name: reverse-engineer
description: >-
  Activates Phase R (Reverse-Engineer Flow) of the AI-Control Engine — reads an
  existing codebase and auto-generates the full project/ blueprint. Use when the
  user types /reverse-engineer, is onboarding a legacy codebase, inherits a
  project with no blueprint, or needs to generate project/ documentation from
  existing code.
---

# Reverse-Engineer — Phase R

## First Action

1. Read `engine/project-layout.md` (bootstrap gate — create `project/` dirs if missing; no placeholder READMEs).
2. Read `engine/flows/reverse-engineer.md` in full before doing anything else.

## When to Use

- Existing codebase has no `project/` blueprint yet (`project/` is never shipped empty)
- Legacy system being onboarded into the AI-Control framework
- Team inherits a codebase and needs documentation before making changes

## Phase Summary

| Phase | Goal | Key Output |
|-------|------|------------|
| **Bootstrap** | Create blueprint root | `project/` directories only |
| **R.0** | Workspace scan + system profile | `project/profile.md` |
| **R.1** | Reverse-engineer description + modules + data model | `project/description.md`, `project/plan/modules.md`, `project/plan/data-model.md` |
| **R.2** | Reverse-engineer services, endpoints, pages, rules | `project/actions/`, `project/rules.md`, `project/plan/roles-and-authorization.md` |
| **R.3** | Drift analysis — blueprint vs actual code | `project/verify/drift-report.md` |

## Key References (load on every spec-generating step)

- `engine/conventions.md` — global defaults; only document deviations
- `engine/rules/backend-rule.md` — architectural layering standard
- `engine/rules/frontend-rule.md` — frontend isolation standard

## Mandatory Rules

- Follow phases **in order**.
- Never put system-specific data in `engine/` — all concrete facts belong in `project/`.
- Specs inherit `engine/conventions.md` defaults — only document values that deviate.
- This flow does **not** generate new code — it generates documentation from existing code.
- After Phase R completes, use **Phase 5** (`/change-mode`) or **Phase 6** (`/bug-fix`) for all future work. Do not re-run this flow.

## Output Artifacts

```
project/
  profile.md
  description.md
  rules.md
  plan/
    modules.md
    data-model.md
    roles-and-authorization.md
  actions/
    <api-app>/services/   (_index.md + per-module files)
    <api-app>/endpoints/  (_index.md + per-module files)
    <web-app>/pages/      (per-module files)
  verify/
    drift-report.md       ← Phase R.3 output
```

## Done

Phase R is complete when `project/verify/drift-report.md` is generated and all `project/` documents are populated. Switch to `/change-mode` or `/bug-fix` for all future work.
