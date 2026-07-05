# Change Log

Append-only index of every change completed through Phase 5. The AI appends **one row** per change in
Step 5.6. Full detail for each change — the filled `change-request.md` and both verification reports
(`verify-plan.md`, `verify-code.md`) — lives in its change folder.

## Completed (001–013)

| # | Date | Type | Target app | Scope | Outcome | Folder |
|---|------|------|-----------|-------|---------|--------|
| 001 | 2026-06-22 | new-feature | customer-portal | Subscriptions — self-service subscribe + cancel | PASS | [change-001-subscription-self-service](change-001-subscription-self-service/) |
| 002 | 2026-06-22 | modify-page | admin-panel | Admin Subscriptions Page — plan-vs-code sync (no code change) | PASS | [change-002-admin-subscriptions-plan-sync](change-002-admin-subscriptions-plan-sync/) |
| 003 | 2026-06-23 | new-feature | customer-portal (+ admin-panel) | PayUp payment provider — backend integration, payment log, event-driven activation | PASS | [change-003-payup-payment-provider](change-003-payup-payment-provider/) |
| 004 | 2026-06-23 | general | all-apps | Subscription status, usage limits, free plan — account/subscription enforcement | PASS | [change-004-subscription-status-usage-free-plan](change-004-subscription-status-usage-free-plan/) |
| 005 | 2026-06-23 | general | all-apps | Subscription billing upgrade/downgrade, admin paid flag, pending invoices | PASS | [change-005-subscription-billing-upgrade-downgrade](change-005-subscription-billing-upgrade-downgrade/) |
| 006 | 2026-06-23 | general | all-apps | Workspace multi-tenancy + Onboarding wizard | PASS | [change-006-workspace-onboarding](change-006-workspace-onboarding/) |
| 007 | 2026-06-24 | modify-feature | customer-portal | Resend button for pending workspace invitations | PASS | [change-007-resend-workspace-invitation](change-007-resend-workspace-invitation/) |
| 008 | 2026-06-24 | new-feature | all-apps | Workspace switcher, default workspace preference, workspace settings | PASS | [change-008-workspace-management-and-switching](change-008-workspace-management-and-switching/) |
| 009 | 2026-06-24 | general | all-apps | Subscription Plan Limit Per User | PASS | [change-009-subscription-per-user-limit](change-009-subscription-per-user-limit/) |
| 010 | 2026-06-24 | general | admin-panel | Admin Panel Complete Modules | PASS | [change-010-admin-panel-complete-modules](change-010-admin-panel-complete-modules/) |
| 011 | 2026-06-24 | general | all-apps | Split subscriptions and plans pages, MongoDB index fix | PASS | [change-011-split-subscriptions-and-plans](change-011-split-subscriptions-and-plans/) |
| 012 | 2026-06-24 | general | all-apps | Usage tracking metrics, dashboard stats cards | PASS | [change-012-usage-tracking-and-stats](change-012-usage-tracking-and-stats/) |
| 013 | 2026-06-24 | modify-data-model | all-apps | Workspace-scoped projects collection (`ws_{slug}_projects`) | PASS | [change-013-workspace-scoped-projects](change-013-workspace-scoped-projects/) |

## Planned — Multi-Source Data Platform (014–029)

| # | Date | Type | Target app | Scope | Outcome | Folder |
|---|------|------|-----------|-------|---------|--------|
| 014 | 2026-07-02 | new-module | backend+admin | OLAP strategy (ClickHouse \| BigQuery), neutral query spec, canonical views, cache tiers, admin benchmark | ✅ PASS | [change-014-olap-foundation](change-014-olap-foundation/) |
| 015 | 2026-07-02 | modify-data-model | backend | DataConnection / Dataset / SyncRun + dashboard M:N + filter-values | ✅ PASS | [change-015-data-source-model](change-015-data-source-model/) |
| 016 | 2026-07-02 | refactor | backend | Pluggable AI-provider interface | ✅ PASS | [change-016-ai-provider-interface](change-016-ai-provider-interface/) |
| 017 | 2026-07-02 | new-feature | backend | File-based editable prompt templates + dialect partials | ✅ PASS | [change-017-prompt-templates](change-017-prompt-templates/) |
| 018 | 2026-07-02 | new-module | backend | Connector interface + generic sync queue | ✅ PASS | [change-018-connector-and-sync-queue](change-018-connector-and-sync-queue/) |
| 019 | 2026-07-02 | new-feature | backend | Generic pipeline engine + step/type registry | ✅ PASS | [change-019-pipeline-engine](change-019-pipeline-engine/) |
| 020 | 2026-07-02 | modify-feature | backend | Dashboard operations as pipelines + multi-datasource | Implemented | [change-020-dashboard-pipelines](change-020-dashboard-pipelines/) |
| 021 | 2026-07-02 | new-feature | backend | Query-backed filter-values store | Implemented | [change-021-filter-values-store](change-021-filter-values-store/) |
| 022 | 2026-07-02 | modify-feature | backend+frontend | CSV source on new foundation | ✅ PASS | [change-022-source-csv](change-022-source-csv/) |
| 023 | 2026-07-02 | new-feature | backend+frontend | Google Sheets source | ✅ PASS | [change-023-source-google-sheets](change-023-source-google-sheets/) |
| 024 | 2026-07-02 | new-feature | backend+frontend | Shopify source | ✅ PASS | [change-024-source-shopify](change-024-source-shopify/) |
| 025 | 2026-07-02 | new-feature | backend+frontend | Salla source | ✅ PASS | [change-025-source-salla](change-025-source-salla/) |
| 026 | 2026-07-02 | new-feature | backend+frontend | Zid source | ✅ PASS | [change-026-source-zid](change-026-source-zid/) |
| 027 | 2026-07-02 | new-feature | backend+frontend | SQL Server source | ✅ PASS | [change-027-source-sql-server](change-027-source-sql-server/) |
| 028 | 2026-07-02 | new-feature | backend+frontend | MongoDB Atlas source | ✅ PASS | [change-028-source-mongodb-atlas](change-028-source-mongodb-atlas/) |
| 029 | 2026-07-03 | new-feature | all-apps | Cross-cutting sync ops (drift, incremental, observability, limits) | ✅ PASS | [change-029-cross-cutting-sync-ops](change-029-cross-cutting-sync-ops/) |
| 030 | 2026-07-03 | new-feature + refactor | backend | MongoDB OLAP engine (MONGODB_OLAP_URI) + type-coercion encapsulated in each engine | ✅ PASS | [change-030-mongodb-olap-engine](change-030-mongodb-olap-engine/) |
| 031 | 2026-07-05 | modify-page | customer-portal | Dashboard description, delete action, project breadcrumb on viewer | ✅ PASS | [change-031-dashboard-description-delete-breadcrumb](change-031-dashboard-description-delete-breadcrumb/) |
| 032 | 2026-07-05 | modify-feature | customer-portal + backend | Dashboard widget add/edit/delete (AI pipelines + viewer UI) | ✅ PASS | [change-032-dashboard-widget-crud](change-032-dashboard-widget-crud/) |
| 033 | 2026-07-05 | modify-page | customer-portal | AI loader popup for widget add/edit + dashboard refresh | ✅ PASS | [change-033-ai-widget-loader-popup](change-033-ai-widget-loader-popup/) |
| 034 | 2026-07-05 | modify-page | customer-portal | Dashboard toolbar icon/button redesign | ✅ PASS | [change-034-dashboard-toolbar-icons](change-034-dashboard-toolbar-icons/) |
| 035 | 2026-07-05 | refactor | customer-portal | Global shared action button styles in styles.css | ✅ PASS | [change-035-global-action-buttons](change-035-global-action-buttons/) |
| 036 | 2026-07-05 | modify-feature | customer-portal | ngx-translate i18n (en/ar) for UI strings | ✅ PASS | [change-036-i18n-ngx-translate](change-036-i18n-ngx-translate/) |
| 037 | 2026-07-05 | modify-data-model | all-apps | Bilingual DB fields (`*Ar` companions) + frontend localized display | ✅ PASS | [change-037-localized-db-fields](change-037-localized-db-fields/) |
|| 038 | 2026-07-05 | new-feature + modify-feature | backend+frontend | AI column-identify pipeline step, isPrimaryKey flag, FULL sync truncate, dual manual sync buttons, smart auto-sync mode | ✅ PASS | [change-038-sync-pipeline-primary-key-full-truncate](change-038-sync-pipeline-primary-key-full-truncate/) |
