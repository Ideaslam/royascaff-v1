---
name: initial-build
description: >-
  Activates Phases 0–4 (Initial Build) of the AI-Control Engine — used once to
  go from a product description to a fully built, verified application. Use when
  the user types /initial-build, is starting a brand-new project, or needs to
  generate the full project blueprint and codebase from scratch.
---

# Initial Build — Phases 0–4

## First Action

1. Read `engine/project-layout.md` (bootstrap gate — create `project/` dirs if missing; no placeholder READMEs).
2. Read `engine/flows/initial-build.md` in full before doing anything else.

## Phase Summary

| Phase | Goal | Key Output |
|-------|------|------------|
| **Bootstrap** | Create blueprint root | `project/` directories only |
| **0 — Understand** | Complete product spec + system profile | `project/description.md`, `project/profile.md` |
| **1 — Plan** | Modules, rules, data model | `project/plan/modules.md`, `project/rules.md`, `project/plan/data-model.md` |
| **2 — Actions** | Services, endpoints, client specs | `project/actions/<api>/services/`, `endpoints/`, `project/actions/<app>/pages/` |
| **3 — Build** | Generate all code | Backend + frontend repos |
| **4 — Verify** | Cross-document consistency checks | `project/verify/verification-report.md` |

## Mandatory Rules

- Follow phases **in order** — never jump ahead.
- **⛔ Pre-Build Confirmation Gate** (Phase 3): present every file to be created and wait for explicit approval before writing any code.
- Never put system-specific data in `engine/` — all concrete facts belong in `project/`.
- Creation order: Services → Endpoints → Pages/Views.
- Traceability chain: Data Model → Services → Endpoints → Pages/Views.
- After Phase 4, use **Phase 5** (`/change-mode`) for all future changes.

## Key Templates

| Output | Template |
|--------|----------|
| `project/profile.md` | `engine/templates/profile-template.md` |
| `project/description.md` | `engine/templates/description-template.md` |
| `project/plan/modules.md` | `engine/templates/modules-template.md` |
| `project/rules.md` | `engine/templates/custom-feature-rules-template.md` |
| `project/plan/data-model.md` | `engine/templates/data-model-template.md` |
| Services | `engine/templates/services-template.md` |
| Endpoints | `engine/templates/endpoints-template.md` |
| Pages (web) | `engine/templates/pages-template.md` |
| Views (mobile) | `engine/templates/views-template.md` |

## Done

Phases 0–4 complete when `project/verify/verification-report.md` shows **Status: PASS**.
Switch to `/change-mode` for all work after this point.
