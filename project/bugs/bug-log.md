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
| 024 | 2026-07-09 | low | customer-portal/auth | Login/register field & button padding too tight | DONE | [bug-024-auth-form-padding.md](./bug-024-auth-form-padding.md) |

| 025 | 2026-07-09 | high | backend/data+pipelines, customer-portal/data | SQL Server: slow schema AI, no table search, sync buffers all rows in memory | ESCALATED | [../changes/change-053-bug-fix-sql-server-perf-streaming/](../changes/change-053-bug-fix-sql-server-perf-streaming/) |

| 026 | 2026-07-12 | high | backend/data, customer-portal/data/setup | CSV setup wizard uploads via legacy path — stores rows in main DB not OLAP | DONE | [bug-026-csv-upload-main-db-instead-of-olap.md](./bug-026-csv-upload-main-db-instead-of-olap.md) |
| 028 | 2026-07-13 | medium | customer-portal/data/setup/mongodb-atlas | MongoDB connection URI masked as password field | DONE | [bug-028-mongodb-uri-password-field.md](./bug-028-mongodb-uri-password-field.md) |

| 029 | 2026-07-13 | medium | customer-portal/auth | Auth pages inconsistent alignment & spacing | DONE | [bug-029-auth-pages-alignment-spacing.md](./bug-029-auth-pages-alignment-spacing.md) |
| 030 | 2026-07-13 | high | backend/workspace, analytics-store | MongoDB OLAP engine not default — ClickHouse used instead | DONE | [bug-030-mongodb-default-olap-engine.md](./bug-030-mongodb-default-olap-engine.md) |
| 032 | 2026-07-13 | medium | customer-portal/projects, backend/data | Dashboard wizard data source picker UX + lite API + required selection | DONE | [bug-032-dashboard-datasource-selection-ux.md](./bug-032-dashboard-datasource-selection-ux.md) |

| 033 | 2026-07-13 | medium | customer-portal/data/setup | Empty datatables block datasource pipeline — should auto-skip | DONE | [bug-033-skip-empty-datatable-columns.md](./bug-033-skip-empty-datatable-columns.md) |
| 034 | 2026-07-13 | medium | customer-portal/projects/projects-list | Search input disappears when no matching projects are found | DONE | [bug-034-projects-search-disappears.md](./bug-034-projects-search-disappears.md) |
| 035 | 2026-07-13 | high | customer-portal/data/setup | Wizard re-auths when choosing an existing Connection | DONE | [bug-035-wizard-existing-connection-reauth.md](./bug-035-wizard-existing-connection-reauth.md) |

| 036 | 2026-07-14 | high | customer-portal/projects | Generate Dashboard button silently fails when purpose field empty | DONE | [bug-036-generate-dashboard-no-action.md](./bug-036-generate-dashboard-no-action.md) |
| 037 | 2026-07-15 | medium | customer-portal/data/setup | Confirm All Tables runs sequentially instead of parallel | DONE | [bug-037-confirm-all-tables-sequential.md](./bug-037-confirm-all-tables-sequential.md) |

| 039 | 2026-07-19 | high | customer-portal/settings/workspace | Workspace slug editable — breaks data sources and tables | DONE | [bug-039-workspace-slug-not-editable.md](./bug-039-workspace-slug-not-editable.md) |
| 040 | 2026-07-19 | high | backend/sql-server, pipelines/streaming | SQL Server sync stops at 2000 rows | DONE | [bug-040-sql-server-sync-stops-at-2000.md](./bug-040-sql-server-sync-stops-at-2000.md) |
| 041 | 2026-07-19 | medium | backend/pipelines, connectors, frontend/data | Sync progress not based on row counts | DONE | [bug-041-sync-progress-row-based.md](./bug-041-sync-progress-row-based.md) |

| 042 | 2026-08-26 | high | backend/cors, customer-portal/subscriptions | Pay now blocked — CORS omits `idempotency-key` | PENDING | [bug-042-invoice-pay-cors-idempotency-key.md](./bug-042-invoice-pay-cors-idempotency-key.md) |
| 044 | 2026-09-02 | high | backend/payments | PayUp Public API request contract stale vs collection | PENDING | [bug-044-payup-api-request-contract.md](./bug-044-payup-api-request-contract.md) |
| 045 | 2026-09-03 | high | backend/payments | Paid invoice never activates — BullMQ jobId contains colon | DONE | [bug-045-paid-invoice-lifecycle-jobid-colon.md](./bug-045-paid-invoice-lifecycle-jobid-colon.md) |

## Next Bug Number

**Next**: 046

| 038 | 2026-07-15 | medium | backend/integrations/connectors, data pipeline | Dotted column names (Google Ads, Mongo) misaligned with storage schema | DONE | [bug-038-flatten-dotted-column-names.md](./bug-038-flatten-dotted-column-names.md) |

| 018 | 2026-07-08 | medium | admin-portal/http | Admin panel duplicate API calls + consolidated admin routes | DONE | [bug-018-admin-double-api-calls.md](./bug-018-admin-double-api-calls.md) |

| 012 | 2026-07-05 | medium | customer-portal/data/google-sheets-setup | Google Sheets setup requires spreadsheet ID instead of URL | PENDING | [bug-012-google-sheets-url-instead-of-id.md](./bug-012-google-sheets-url-instead-of-id.md) |
| 013 | 2026-07-06 | medium | customer-portal/subscriptions | Subscription page shows plan UI before DB data is ready | DONE | [bug-013-subscription-page-initial-plan-flash.md](./bug-013-subscription-page-initial-plan-flash.md) |
| 014 | 2026-07-06 | medium | customer-portal/dashboards | Dashboard does not expand when sidebar collapsed | DONE | [bug-014-dashboard-width-sidebar-collapsed.md](./bug-014-dashboard-width-sidebar-collapsed.md) |
| 016 | 2026-07-07 | high | backend/subscriptions, admin-portal/subscriptions | Create workspace subscription returns User not found (404) | DONE | [bug-016-create-subscription-user-not-found.md](./bug-016-create-subscription-user-not-found.md) |
| 017 | 2026-07-07 | high | admin-portal/deploy | Deployed admin fails to load stale lazy chunk | DONE | [bug-017-admin-chunk-load-failed.md](./bug-017-admin-chunk-load-failed.md) |
| 020 | 2026-07-08 | high | backend/integrations/zid | Zid app activation fails after integration | PENDING | [bug-020-zid-app-activation-error.md](./bug-020-zid-app-activation-error.md) |