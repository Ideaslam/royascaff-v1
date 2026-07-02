# Change Log

Registry of changes. Rows are appended when a change is verified/archived
(see `engine/flows/change-mode.md`, Step 5.6). The table below is the **planned
roadmap** for the Multi-Source Data Platform update (see root `Phases.md`), listed
in execution order. Outcome flips from `Planned` to `Done` on archive.

## Planned — Multi-Source Data Platform

| # | Date | Type | Target app | Scope | Outcome | Folder |
|---|------|------|-----------|-------|---------|--------|
| 001 | 2026-07-02 | new-module | backend+admin | OLAP strategy (ClickHouse \| BigQuery), neutral query spec, canonical views, cache tiers, admin benchmark | Planned | [change-001-olap-foundation](change-001-olap-foundation/) |
| 002 | 2026-07-02 | modify-data-model | backend | DataConnection / Dataset / SyncRun + dashboard M:N + filter-values | Planned | [change-002-data-source-model](change-002-data-source-model/) |
| 003 | 2026-07-02 | refactor | backend | Pluggable AI-provider interface | Planned | [change-003-ai-provider-interface](change-003-ai-provider-interface/) |
| 004 | 2026-07-02 | new-feature | backend | File-based editable prompt templates | Planned | [change-004-prompt-templates](change-004-prompt-templates/) |
| 005 | 2026-07-02 | new-module | backend | Connector interface + generic sync queue | Planned | [change-005-connector-and-sync-queue](change-005-connector-and-sync-queue/) |
| 006 | 2026-07-02 | new-feature | backend | Generic pipeline engine + step/type registry | Planned | [change-006-pipeline-engine](change-006-pipeline-engine/) |
| 007 | 2026-07-02 | modify-feature | backend | Dashboard operations as pipelines + multi-datasource | Planned | [change-007-dashboard-pipelines](change-007-dashboard-pipelines/) |
| 008 | 2026-07-02 | new-feature | backend | Query-backed filter-values store | Planned | [change-008-filter-values-store](change-008-filter-values-store/) |
| 009 | 2026-07-02 | modify-feature | backend+frontend | CSV source on new foundation | Planned | [change-009-source-csv](change-009-source-csv/) |
| 010 | 2026-07-02 | new-feature | backend+frontend | Google Sheets source | Planned | [change-010-source-google-sheets](change-010-source-google-sheets/) |
| 011 | 2026-07-02 | new-feature | backend+frontend | Shopify source | Planned | [change-011-source-shopify](change-011-source-shopify/) |
| 012 | 2026-07-02 | new-feature | backend+frontend | Salla source | Planned | [change-012-source-salla](change-012-source-salla/) |
| 013 | 2026-07-02 | new-feature | backend+frontend | Zid source | Planned | [change-013-source-zid](change-013-source-zid/) |
| 014 | 2026-07-02 | new-feature | backend+frontend | SQL Server source | Planned | [change-014-source-sql-server](change-014-source-sql-server/) |
| 015 | 2026-07-02 | new-feature | backend+frontend | MongoDB Atlas source | Planned | [change-015-source-mongodb-atlas](change-015-source-mongodb-atlas/) |
| 016 | 2026-07-02 | new-feature | all-apps | Cross-cutting sync ops (drift, incremental, observability, limits) | Planned | [change-016-cross-cutting-sync-ops](change-016-cross-cutting-sync-ops/) |

## Completed

| # | Date | Type | Target app | Scope | Outcome | Folder |
|---|------|------|-----------|-------|---------|--------|
