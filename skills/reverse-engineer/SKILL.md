---
name: reverse-engineer
description: >-
  Activates Phase R (Reverse-Engineer Flow) — reads an existing codebase and
  generates the project/ blueprint, then creates REQ-R work packs for gaps and
  drift fixes. Use when the user types /reverse-engineer or onboards legacy code.
---

# Reverse-Engineer — Phase R

## First Action

1. Read `.cursor/royascaff/engine/project-layout.md` (bootstrap gate).
2. Read `.cursor/royascaff/engine/flows/reverse-engineer.md` in full.

## When to Use

- Existing codebase has no `project/` blueprint
- Legacy onboarding / inherited codebase needing documentation before changes

## Phase Summary

| Phase | Goal | Key Output |
|-------|------|------------|
| **Bootstrap** | Blueprint root | `project/` dirs |
| **R.0** | Workspace scan + profile | `profile.md` |
| **R.1–R.2** | Extract + synthesize blueprint on main | `plan/`, `actions/`, `rules.md` |
| **R.3** | Drift analysis | `verify/reverse-engineer-report.md` |
| **R.Done.1** | Status dashboard | `status.md` |
| **R.Done.2** | REQ-R build program + packs for gaps/drift | `changes/build-program.md`, pack folders |

## Mandatory Rules

- Follow phases in order.
- Phase R **documents** existing code on main — it does **not** implement all fixes in one loop.
- Incomplete / drift-fix items → REQ-R packs; implement via `/change-mode` (Step 5.4+).
- Never put system-specific data in `.cursor/royascaff/engine/`.

## Done

Blueprint populated + status dashboard + REQ-R program created (or empty if clean).
Switch to `/change-mode` for packs, `/bug-fix` for bugs, `/polish` for UI-only.
