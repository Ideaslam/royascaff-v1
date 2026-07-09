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

|| 011 | 2026-07-03 | high | customer-portal/dashboards | Dashboard wizard shows only legacy CSV files, not Datasets | PENDING | [bug-011-dashboard-wizard-shows-csv-only.md](./bug-011-dashboard-wizard-shows-csv-only.md) |

---

| 015 | 2026-07-06 | high | backend/integrations/zid | Zid OAuth empty client_id / redirect_uri on dev | DONE | [bug-015-zid-oauth-token-exchange.md](./bug-015-zid-oauth-token-exchange.md) |

| 021 | 2026-07-09 | medium | customer-portal/frontend/widgets | Widget numbers not rounded to 2 decimals | PENDING | [bug-021-widget-numbers-two-decimals.md](./bug-021-widget-numbers-two-decimals.md) |
| 022 | 2026-07-09 | low | customer-portal/dashboards | Widget loading spinner off-center / poor design | DONE | [bug-022-widget-loader-redesign.md](./bug-022-widget-loader-redesign.md) |
| 023 | 2026-07-09 | high | customer-portal/shared-viewer + backend/dashboards | Filters stuck loading on share link | DONE | [../changes/change-051-bug-fix-share-link-filters/](../changes/change-051-bug-fix-share-link-filters/) |
| 024 | 2026-07-09 | low | customer-portal/auth | Login/register field & button padding too tight | PENDING | [bug-024-auth-form-padding.md](./bug-024-auth-form-padding.md) |

| 025 | 2026-07-09 | high | backend/data+pipelines, customer-portal/data | SQL Server: slow schema AI, no table search, sync buffers all rows in memory | ESCALATED | [../changes/change-053-bug-fix-sql-server-perf-streaming/](../changes/change-053-bug-fix-sql-server-perf-streaming/) |

## Next Bug Number

**Next**: 026

| 018 | 2026-07-08 | medium | admin-portal/http | Admin panel duplicate API calls + consolidated admin routes | DONE | [bug-018-admin-double-api-calls.md](./bug-018-admin-double-api-calls.md) |

| 012 | 2026-07-05 | medium | customer-portal/data/google-sheets-setup | Google Sheets setup requires spreadsheet ID instead of URL | PENDING | [bug-012-google-sheets-url-instead-of-id.md](./bug-012-google-sheets-url-instead-of-id.md) |
| 013 | 2026-07-06 | medium | customer-portal/subscriptions | Subscription page shows plan UI before DB data is ready | DONE | [bug-013-subscription-page-initial-plan-flash.md](./bug-013-subscription-page-initial-plan-flash.md) |
| 014 | 2026-07-06 | medium | customer-portal/dashboards | Dashboard does not expand when sidebar collapsed | DONE | [bug-014-dashboard-width-sidebar-collapsed.md](./bug-014-dashboard-width-sidebar-collapsed.md) |
| 016 | 2026-07-07 | high | backend/subscriptions, admin-portal/subscriptions | Create workspace subscription returns User not found (404) | DONE | [bug-016-create-subscription-user-not-found.md](./bug-016-create-subscription-user-not-found.md) |
| 017 | 2026-07-07 | high | admin-portal/deploy | Deployed admin fails to load stale lazy chunk | DONE | [bug-017-admin-chunk-load-failed.md](./bug-017-admin-chunk-load-failed.md) |
| 020 | 2026-07-08 | high | backend/integrations/zid | Zid app activation fails after integration | PENDING | [bug-020-zid-app-activation-error.md](./bug-020-zid-app-activation-error.md) |