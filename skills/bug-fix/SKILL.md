---
name: bug-fix
description: >-
  Activates Phase 6 (Bug Fix Flow) of the AI-Control Engine. Use when the user
  types /bug-fix, reports a bug, describes broken behavior, or asks to fix an
  issue in the codebase.
---

# Bug Fix — Phase 6

## First Action

Read `.ai-control/engine/flows/bug-fix.md` in full before doing anything else.

## Flow Overview

### Step 6.0 — Triage (always first)

Gather: what is broken, where, expected behavior, reproduction steps, severity.
Then run the decision tree:

| Question | YES → | NO → |
|----------|-------|------|
| Fix requires plan changes (new entity/endpoint/page/service)? | Path A | Q2 |
| Fix touches > 1 module or app? | Path A | Q3 |
| Fix requires a data migration? | Path A | Path B |

### Path A — Escalate to Change Request

Create `project/changes/change-<NNN>-bug-fix-<slug>/`, set `change-type: bug-fix`, then follow **Phase 5** (`change-mode` flow) from Step 5.0.

### Path B — Direct Fix (isolated code only)

Steps: **6.1 → 6.2 → 6.3 ⛔ → 6.4 → 6.5 ⛔ → 6.6**

| Step | Action |
|------|--------|
| 6.1 | Create `project/bugs/bug-<NNN>-<slug>.md`, status PENDING |
| 6.2 | Investigate, document root cause — **no code changed yet** |
| 6.3 ⛔ | Present root cause + proposed fix, wait for confirmation |
| 6.4 | Implement the confirmed fix (minimal, isolated) |
| 6.5 ⛔ | Present fix summary, ask user to confirm it resolves the bug |
| 6.6 | Set status DONE, append row to `project/bugs/bug-log.md` |

## Mandatory Rules

- **NEVER skip Confirmation Gates** (⛔ 6.3 and 6.5).
- **Silence is NOT confirmation.**
- Keep fixes **minimal and isolated** — do not refactor unrelated code.
- Follow `engine/rules/backend-rule.md` / `engine/rules/frontend-rule.md` + `project/rules.md`.

## Output Artifacts

**Path B**: `project/bugs/bug-<NNN>-<slug>.md` + row in `project/bugs/bug-log.md`
**Path A**: Full Phase 5 artifacts + `change-log.md` row (type `bug-fix`)
