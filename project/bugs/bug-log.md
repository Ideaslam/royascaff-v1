# Bug Log

This file tracks all bugs reported and fixed in the project. Each bug gets its own file in this folder: `bug-<NNN>-<slug>.md`.

## Log Table

| # | Date | Severity | Area | Summary | Status | File |
|---|------|----------|------|---------|--------|------|
| 001 | 2026-06-23 | low | backend/repositories | Mongoose `new` option deprecated warning | DONE | [bug-001-mongoose-new-option-deprecated.md](./bug-001-mongoose-new-option-deprecated.md) |
| 002 | 2026-06-23 | high | backend/subscriptions, customer-portal | PayUp called before invoice payment step | DONE | [bug-002-invoice-before-payup.md](./bug-002-invoice-before-payup.md) |

---

## Column Definitions

- **#** — Bug number (001, 002, 003, ...)
- **Date** — Date bug was reported (YYYY-MM-DD)
- **Severity** — critical / high / medium / low
- **Area** — Affected app/module/file (e.g. `backend/auth`, `frontend/dashboard`)
- **Summary** — One-line description of the bug
- **Status** — PENDING / DONE / ESCALATED (escalated means converted to change request)
- **File** — Link to `bug-<NNN>-<slug>.md` or `change-<NNN>-bug-fix-<slug>/` if escalated

---

## Usage

**For direct fixes** (Path B): append a row when the bug is marked DONE in Step 6.4.

**For escalated bugs** (Path A): append a row with Status = ESCALATED and File pointing to the change folder in `project/changes/`.

---

## Next Bug Number

**Next**: 003
