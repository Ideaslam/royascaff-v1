---
name: change-mode
description: >-
  Activates Phase 5 (Change Mode) of the AI-Control Engine — the daily workflow
  for adding features, modifying existing ones, or adding new modules. Use when
  the user types /change-mode, describes a new feature, asks to modify a module,
  or starts any incremental change to the codebase.
---

# Change Mode — Phase 5

## First Action

Read `.ai-control/engine/flows/change-mode.md` in full before doing anything else.

## Flow Overview

Phase 5 has two tracks — evaluate against **Fast-Track Criteria** first:

**Fast-Track** (ALL must be true):
1. Touches ≤ 1 module
2. No new data model entities or fields
3. No new services or endpoints
4. Frontend-only OR backend-only (not both)
5. User provided a clear, complete description

→ If ALL true: **FT-5.0 → FT-5.1 → FT-5.2 ⛔ → FT-5.3** (4 steps, 1 gate)
→ If ANY false: **Standard Flow** (Steps 5.0–5.6, 2 gates)

## Mandatory Rules

- **NEVER skip the Confirmation Gates** (⛔) — always wait for explicit "yes" before modifying plan docs or code.
- **Silence or ambiguous replies are NOT confirmation.**
- All plan doc edits are **in-place only** — never append `change-<NNN>` sections to existing files.
- Scope rule: look up `_index.md` registries, load ONLY affected module files.
- Traceability chain: Data Model → Services → Endpoints → Pages/Views.

## Key Files to Load Per Step

| Step | Files |
|------|-------|
| 5.0 Understand | `project/profile.md`, `project/description.md`, `project/plan/modules.md` |
| 5.1 Recon | Affected `endpoints/_index.md`, `services/_index.md`, actual code |
| 5.3 Update Plan | Affected planning docs only (scoped) |
| 5.4 Code | `engine/rules/backend-rule.md` / `engine/rules/frontend-rule.md`, `project/rules.md` |
| 5.5 Verify | `engine/templates/verification-template.md` |

## Output Artifacts

```
project/changes/change-<NNN>-<slug>/
  change-request.md
  impact.md
  verify-code.md        ← must show Overall: PASS
```
`project/changes/change-log.md` — append one row on completion.

## Done

Change is complete when `verify-code.md` shows **Overall: PASS** and `change-log.md` has the new row.
