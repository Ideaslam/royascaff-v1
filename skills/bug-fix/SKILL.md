---
name: bug-fix
description: >-
  Activates Phase 6 (Bug Fix Flow) of the AI-Control Engine. Use when the user
  types /bug-fix, reports a bug, describes broken behavior, or asks to fix an
  issue in the codebase.
---

# Bug Fix — Phase 6

## First Action

1. Require blueprint: if `project/profile.md` is missing → `/initial-build` or `/reverse-engineer`.
2. If style-only and nothing broken → `/polish` instead.
3. Read `project/bugs/bug-log.md` if present.
4. Read `.cursor/royascaff/engine/flows/bug-fix.md` in full.

## Flow Overview

### Step 6.0 — Triage

| Question | YES → | NO → |
|----------|-------|------|
| Fix needs plan/action blueprint changes? | Path A | Q2 |
| Touches > 1 module or app? | Path A | Q3 |
| Needs data migration? | Path A | Path B |

### Path A — Change work pack

- bug-log → `ESCALATED` + link to `change-<ID>-bug-fix-<slug>/`
- Follow `/change-mode` isolation (blueprint in pack; merge at 5.6)
- bug-log → `DONE` when pack is `merged`

### Path B — Direct fix

| Step | Action |
|------|--------|
| 6.1 | Create `bug-<ID>-<slug>.md`, bug-log `PENDING` |
| 6.2 | Root cause (no code yet) |
| 6.3 | ⛔ Pre-fix gate |
| 6.4 | Implement minimal fix |
| 6.5 | ⛔ Post-fix confirm |
| 6.6 | bug-log `DONE` |

Path B: **no** main plan/actions edits. Plan drift → escalate to Path A.

## Done

Path A: change pack `merged` + bug-log `DONE`. Path B: bug-log `DONE`.
