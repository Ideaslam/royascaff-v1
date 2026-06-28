# Bug Log

This file tracks all bugs reported and fixed in the project. Each bug gets its own file in this folder: `bug-<NNN>-<slug>.md`.

## Log Table

| # | Date | Severity | Area | Summary | Status | File |
|---|------|----------|------|---------|--------|------|
| 001 | 2026-06-23 | low | backend/repositories | Mongoose `new` option deprecated warning | DONE | [bug-001-mongoose-new-option-deprecated.md](./bug-001-mongoose-new-option-deprecated.md) |
| 002 | 2026-06-23 | high | backend/subscriptions, customer-portal | PayUp called before invoice payment step | DONE | [bug-002-invoice-before-payup.md](./bug-002-invoice-before-payup.md) |
| 003 | 2026-06-23 | medium | customer-portal/subscriptions | Cancelled subscription still shown as current plan | DONE | [bug-003-cancelled-plan-shows-current.md](./bug-003-cancelled-plan-shows-current.md) |
| 004 | 2026-06-23 | medium | backend/workspace, customer-portal/settings | Workspace logo URL and members list display | DONE | [bug-004-workspace-logo-members-display.md](./bug-004-workspace-logo-members-display.md) |
| 005 | 2026-06-24 | high | backend/workspace | Workspace invite 403 + pending invitations not listed | DONE | [bug-005-workspace-invite-no-context.md](./bug-005-workspace-invite-no-context.md) |
| 006 | 2026-06-24 | high | backend/workspace, customer-portal | Invitation email link returns 404 | DONE | [bug-006-invitation-email-link-404.md](./bug-006-invitation-email-link-404.md) |
| 007 | 2026-06-24 | high | backend/workspace, customer-portal | Invitation link redirects to login without context | DONE | [bug-007-invitation-link-redirects-login.md](./bug-007-invitation-link-redirects-login.md) |
| 008 | 2026-06-24 | high | backend/subscriptions, backend/payments | Payment checkout resume throws User Not Found (404) | DONE | [bug-008-pay-invoice-user-not-found.md](./bug-008-pay-invoice-user-not-found.md) |
| 009 | 2026-06-25 | high | backend/payments, backend/subscriptions | Pay invoice fails — wrong PayUp checkout endpoint | DONE | [bug-009-payup-unreachable-wrong-endpoint.md](./bug-009-payup-unreachable-wrong-endpoint.md) |
| 010 | 2026-06-28 | high | customer-portal/dashboards, frontend/widgets | Production dashboard widgets show "No data available" | DONE | [bug-010-production-dashboard-widgets-empty.md](./bug-010-production-dashboard-widgets-empty.md) |

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

**For direct fixes** (Path B): append a row with Status = **PENDING** when the bug is logged (Step 6.1); update the row to **DONE** after user confirmation (Step 6.4).

**For escalated bugs** (Path A): append a row with Status = ESCALATED and File pointing to the change folder in `project/changes/`.

---

## Next Bug Number

**Next**: 011
