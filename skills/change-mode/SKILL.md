---
name: change-mode
description: >-
  Activates Phase 5 (Change Mode) of the AI-Control Engine — features and
  plan-impacting work via isolated change work packs that merge into the main
  blueprint after verify. Use when the user types /change-mode, describes a new
  feature, asks to modify a module, or starts incremental product changes.
---

# Change Mode — Phase 5

## First Action

1. Require blueprint: if `project/profile.md` is missing → `/initial-build` or `/reverse-engineer`.
2. If UI polish only (no API/data/behavior) → `/polish` instead.
3. Read `project/changes/change-log.md` if present (resume / index).
4. Read `engine/flows/change-mode.md` in full.

## Isolation (critical)

- Draft specs under `change-<NNN>-<slug>/blueprint/` only.
- **Do not** edit main `project/plan` or `project/actions` until Step 5.6 Merge.
- Sync `pack-status` into `change-log.md` on every transition.

## Flow Overview

**Fast-Track** (small scope) or **Standard** (5.0 → 5.6):

| Step | Action | pack-status |
|------|--------|-------------|
| 5.0–5.2 | Request + impact + gates | `drafted` (or `blocked`) |
| 5.3 | Draft pack blueprint | `drafted` |
| 5.4 | Implement from pack | `in-progress` |
| 5.5 | Verify vs pack | `verified` |
| 5.6 | Merge into main | `merged` |

## Mandatory Rules

- Never skip ⛔ confirmation gates; silence ≠ yes.
- Multi-part features: share `request-id`; honor `depends-on`.
- Delta = after-state in pack + `## Delta`; merge in-place into main (no append sections).
- Load main modules **read-only** for context; implementer load set = request + blueprint + impact + pack status.

## Output Artifacts

```text
project/changes/change-log.md          # live index
project/changes/change-<NNN>-<slug>/
  change-request.md
  impact.md
  status.md
  blueprint/… + _index.md
  verify-code.md
  merge-report.md
```

## Done

Pack `merged` (verify PASS + merge gate). Further work = new pack.
