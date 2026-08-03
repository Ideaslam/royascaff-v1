---
name: initial-build
description: >-
  Activates Phases 0–4 (Initial Build) of the AI-Control Engine — product
  description through planned blueprint, then implementation via ordered REQ-INIT
  work packs (not a monolith build). Use when the user types /initial-build or
  starts a brand-new project from scratch.
---

# Initial Build — Phases 0–4

## First Action

1. Read `.cursor/royascaff/engine/project-layout.md` (bootstrap gate).
2. If resuming implementation: read `project/changes/change-log.md` + `project/changes/build-program.md` first.
3. Read `.cursor/royascaff/engine/flows/initial-build.md` in full.

## Phase Summary

| Phase | Goal | Key Output |
|-------|------|------------|
| **Bootstrap** | Create blueprint root | `project/` directories |
| **0 — Understand** | Spec + profile | `description.md`, `profile.md` |
| **1 — Plan** | Modules, rules, data model | `plan/`, `rules.md` |
| **2 — Actions** | Full specs on main as `planned` | `actions/<app>/…` |
| **3.0 — Build program** | Slice into REQ-INIT packs | `build-program.md` + pack folders |
| **3.x — One pack** | Implement → verify → merge (Change Mode 5.4–5.6) | Code + main status updates |
| **4 — Verify** | System checks when program complete (or mid-stream audit) | `verify/verification-report.md` |

## Mandatory Rules

- Follow phases in order for design (0–2).
- **Never** implement the whole app in one Phase 3 session — use work packs.
- ⛔ Gate before creating the build program.
- Hard stop after each pack merge; resume via change-log / build-program.
- System-specific data only in `project/`.
- Traceability: Data Model → Services → Endpoints → Pages/Views.

## Key Templates

| Output | Template |
|--------|----------|
| Profile / description / plan / actions | matching `.cursor/royascaff/engine/templates/*` |
| Build program | `.cursor/royascaff/engine/templates/build-program-template.md` |
| Packs | change-request, change-status, change-blueprint-index, change-log |

## Done

REQ-INIT packs merged (or user paused with Next Up clear) and Phase 4 PASS when run.
Further work: `/change-mode`. Unfinished init packs: resume from `build-program.md`.
