# Bugs Folder

This folder contains the bug log and individual bug report files for the project.

## Structure

```
project/bugs/
  bug-log.md              # Master log — table of all bugs
  bug-001-<slug>.md       # Individual bug report (direct fix)
  bug-002-<slug>.md       # Individual bug report (direct fix)
  ...
```

## Workflow

When a bug is reported, the AI runs **Phase 6 — Bug Fix Flow** (see `engine/flow.md`).

### Two Paths

**Path A — Escalate to Change Request** (architectural impact)
- Bug requires plan changes, touches multiple modules, or needs data migration
- Becomes a full change request under `project/changes/change-<NNN>-bug-fix-<slug>/`
- Logged in `bug-log.md` with Status = ESCALATED

**Path B — Direct Fix** (isolated code correction)
- Bug is a pure code fix with no architectural impact
- Gets its own `bug-<NNN>-<slug>.md` file in this folder
- Workflow: PENDING → fix implemented → user confirms → DONE
- Logged in `bug-log.md` with Status = DONE

## Bug Numbering

Bug numbers are sequential across both paths: 001, 002, 003, ...

The next available number is tracked at the bottom of `bug-log.md`.

## Bug Report Format

Each `bug-<NNN>-<slug>.md` file follows `engine/templates/bug-report-template.md` and includes:
- Status (PENDING / DONE / ESCALATED)
- Description and expected behavior
- Root cause (filled after investigation)
- Fix applied (filled after implementation)
- Verification checklist
- Related files

## Confirmation Gate

**Path B bugs** (direct fixes) require user confirmation before Status changes from PENDING to DONE.

The AI presents:
1. Bug summary
2. Root cause
3. Fix applied
4. Files modified
5. Verification checklist

And asks: **"Can you confirm this resolves the issue so I can mark it as DONE?"**

Only after explicit confirmation does the bug get marked DONE and logged in `bug-log.md`.