---
name: polish
description: >-
  Activates Phase P (Polish Flow) of the AI-Control Engine — visual/style/copy/
  spacing/layout tweaks with no API, data, or business-rule changes. Use when
  the user types /polish, asks for UI polish, style tweaks, button look, spacing,
  or copy-only changes.
---

# Polish — Phase P

## First Action

1. Check `project/profile.md` exists. If missing, stop — route to `/initial-build` or `/reverse-engineer`.
2. Read `project/changes/change-log.md` if it exists (resume / index).
3. Read `.cursor/royascaff/engine/flows/polish.md` in full before doing anything else.

## When to Use

- Spacing, colors, typography, copy, button appearance, layout alignment
- No new fields, endpoints, services, or business rules

## Redirect Away

| If… | Use |
|-----|-----|
| Behavior is wrong vs expected | `/bug-fix` |
| New/changed product capability or API/data | `/change-mode` |

## Phase Summary

| Step | Goal | Key output |
|------|------|------------|
| P.0 | Triage (confirm polish) | Decision |
| P.1 | Pack + change-log row | `change-<ID>-polish-<slug>/`, `drafted` |
| P.2 | Minimal page/view blueprint | `blueprint/actions/.../pages\|views/` |
| P.3 | Implement styles/markup | `in-progress` |
| P.4 | Verify | `verified` |
| P.5 | Merge notes into main | `merged` |

## Mandatory Rules

- Same isolation as Phase 5: **no main plan/actions edits until merge**.
- Sync `pack-status` into `change-log.md` on every transition.
- If scope grows → convert pack to Phase 5 (`change-mode.md`); keep folder/`request-id`.
- Forbidden: data-model, new EP/SVC, auth, business rules.

## Done

Pack `merged` (or left `verified` if user deferred merge). Index row under Completed.
