# AI-Control Engine — Bug Fix Flow (Phase 6)

**Goal**: Lightweight, fast-track process for bug fixes that automatically determines whether the fix requires a full change request (architectural impact) or a simplified direct-fix path (isolated code correction).

---

## Entry Point

Bug fixes can be reported via:
1. **Plain language** — user describes the bug
2. **Bug report file** — `project/bugs/bug-<NNN>-<slug>.md` following `engine/templates/bug-report-template.md`

When a bug is reported, start **Step 6.0**.

---

## Step 6.0 — Bug Triage

- **Input**: Bug description (plain language or bug report file)
- **Actions**:
  1. If plain language only, gather: what is broken, where (page/endpoint/module), expected behavior, reproduction steps, severity (critical/high/medium/low).
  2. Identify affected app(s), module(s), file(s).
  3. Run the decision tree below.

### Decision Tree: Change Request vs. Direct Fix

**Q1. Does the fix require plan changes?**
New entity fields, new endpoints, new pages, new services, new integrations, modified business logic affecting other features → **YES → Path A**. Otherwise → Q2.

**Q2. Does the fix affect multiple modules or apps?**
Touches > 1 module or app → **YES → Path A**. Otherwise → Q3.

**Q3. Does the fix require a data migration?**
Schema changes, data transformations, backfill → **YES → Path A**. Otherwise → **Path B**.

---

## Path A — Escalate to Change Request

When any question answers YES:

1. Create `project/changes/change-<NNN>-bug-fix-<slug>/` (next number from `change-log.md`)
2. Set `change-type: bug-fix` in `change-request.md`
3. Proceed to **Phase 5 Step 5.0** (`engine/flows/change-mode.md`) with bug details as the change description
4. Follow full change request flow
5. Bug is resolved when Phase 5 completes (Step 5.6 archives)

- **Done when**: Change logged in `change-log.md` with type `bug-fix`, folder contains full change artifacts.

---

## Path B — Direct Fix

When all questions answer NO (no architectural impact). Follow these steps:

### Step 6.1 — Create Bug Log Entry

- **Input**: Bug description + affected area from Step 6.0
- **Output**: `project/bugs/bug-<NNN>-<slug>.md`
- **Actions**: Create bug report file (next number from `project/bugs/bug-log.md`), set **Status: PENDING**:

```markdown
# Bug #<NNN> — <Short Title>

## Status
**PENDING** — Fix in progress, awaiting confirmation

## Reported
- **Date**: <YYYY-MM-DD>
- **Severity**: critical | high | medium | low
- **Affected area**: <app/module/file>

## Description
<What is broken>

## Expected Behavior
<What should happen>

## Steps to Reproduce (if applicable)
1. ...

## Root Cause
<Filled after investigation>

## Fix Applied
<Filled after implementation>

## Verification
- [ ] Fix implemented in code
- [ ] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- <list of modified files>
```

- **Done when**: Bug log file exists with PENDING status.

### Step 6.2 — Investigate & Document Root Cause

- **Input**: `project/bugs/bug-<NNN>-<slug>.md` + affected code
- **Actions**:
  1. Read affected files, trace the code path, identify exact cause.
  2. Document root cause in bug log ("Root Cause" section).
  3. Propose fix: exact code change, every file to modify. Keep it **minimal and isolated**.
  4. Pre-fill "Fix Applied" and "Related Files" sections as proposal.
- **Done when**: Root cause documented, proposed fix described, **no code changed yet**.

### Step 6.3 — ⛔ Pre-Fix Confirmation Gate (MANDATORY)

Present to user:
1. **Bug summary** — what is broken
2. **Root cause** — exact line(s)/logic causing the issue
3. **Proposed fix** — what code changes and why
4. **Files to be modified** — full list

Ask: **"This is the root cause and proposed fix. Can I proceed with applying the changes?"**

- Wait for explicit confirmation.
- If user disagrees: update bug log, go back to Step 6.2, re-present.
- **Do not interpret silence, ambiguous replies, or follow-up questions as confirmation.**

### Step 6.4 — Implement Fix

- **Input**: Confirmed fix from Step 6.3
- **Actions**:
  1. Implement exactly the confirmed fix. Follow `engine/rules/backend-rule.md` / `engine/rules/frontend-rule.md` + `project/rules.md`. Keep fix **minimal and isolated**.
  2. Finalize "Fix Applied" and "Related Files" in bug log.
  3. Verify: code compiles, no linter errors in modified files, fix logically addresses root cause.
- **Done when**: Code fixed, bug log updated, basic verification passes.

### Step 6.5 — ⛔ Post-Fix Confirmation Gate (MANDATORY)

Present to user:
1. **Bug summary** — what was broken
2. **Root cause** — what caused it
3. **Fix applied** — what code changes were made
4. **Files modified** — list
5. **Verification checklist** — from bug log

Ask: **"The fix is applied. Can you confirm this resolves the issue so I can mark it as DONE?"**

- Wait for explicit confirmation.
- If bug is not fixed or regression introduced: update bug log, go back to Step 6.2.
- **Do not interpret silence, ambiguous replies, or follow-up questions as confirmation.**

### Step 6.6 — Mark as Done

1. Update bug log: Status → `DONE`, add `**Confirmed**: <YYYY-MM-DD>`, check all verification boxes.
2. Append row to `project/bugs/bug-log.md`: `# | Date | Severity | Area | Summary | Status | File` (File links to `bug-<NNN>-<slug>.md`).

- **Done when**: Bug status DONE, checklist complete, `bug-log.md` has new row.

---

## Summary

| Decision | Path | Steps | Outputs |
|----------|------|-------|---------|
| Needs plan change, multi-module, or data migration | **Path A — Change Request** | Phase 5 full flow | `project/changes/change-<NNN>-bug-fix-<slug>/` |
| Isolated code fix, no architectural impact | **Path B — Direct Fix** | 6.0→6.1→6.2→6.3⛔→6.4→6.5⛔→6.6 | `project/bugs/bug-<NNN>-<slug>.md` |

**Key principle**: Bugs that touch the plan become change requests. Bugs that are pure code corrections follow the direct-fix path.
