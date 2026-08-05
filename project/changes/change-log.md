# Change Log

_Last updated: 2026-08-05_


## Summary

| pack-status | Count |
|-------------|------:|
| drafted | 1 |
| in-progress | 0 |
| verified | 0 |
| merged | 50 |
| cancelled | 0 |
| blocked | 0 |

## In flight (not merged)

| ID | Date | Type | Request | Depends on | Pack status | Artifacts done | Scope | Folder |
|----|------|------|---------|------------|-------------|----------------|-------|--------|
| 20260805-171001 | 2026-08-05 | modify-feature | REQ-CONTRACT-TEMPLATE | — | drafted | 0/5 | Contract Amiri font (workspace setting) + branded cover page + name/page watermark + restyled article layout | `change-20260805-171001-contract-template-cover-watermark-font/` |

## Completed

| ID | Date | Type | Request | Pack status | Scope | Folder | Merged |
|----|------|------|---------|-------------|-------|--------|--------|
| 20260730-134031 | 2026-07-30 | modify-feature | REQ-PROP-V3 | merged | Generic catalog-driven section repeat (any key, not just timeline/action_plan/services); enabled `social_audit` | `change-20260730-134031-generic-section-repeat/` | 2026-08-05 |
| 20260729-122650 | 2026-07-29 | modify-feature | REQ-PROP-V3 | merged | PDF list section split (map N + financial_part/full) | `change-20260729-122650-pdf-list-section-split/` | 2026-08-05 |
| 20260728-000034 | 2026-07-28 | polish | — | merged | Proposal View action toolbar redesign | `change-20260728-000034-polish-proposal-view-actions/` | 2026-08-05 |
| 20260728-000029 | 2026-07-28 | polish | — | merged | Status tag colors + AI Requests `retrying`→`inprogress` label | `change-20260728-000029-polish-status-tag-colors/` | 2026-08-05 |
| 20260728-000028 | 2026-07-28 | modify-feature | REQ-MODEL-ROUTE | merged | Pipeline v3 model routing via DB config + seed | `change-20260728-000028-pipeline-model-routing-config/` | 2026-08-05 |
| 20260805-165124 | 2026-08-05 | modify-feature | REQ-SETTINGS-PALETTE | merged | Workspace Theme settings: `app-color-palette` (max 5) + persist `colorRoles` | `change-20260805-165124-workspace-settings-color-palette/` | 2026-08-05 |
| 20260805-144725 | 2026-08-05 | new-feature | REQ-CONTRACT-TEMPLATE | merged | Contract template catalog (admin, global) + real server PDF export (logo/header/footer/page numbers) + notes-at-top + Roya contract as seeded default | `change-20260805-144725-contract-template-pdf-system/` | 2026-08-05 |
| 20260805-130421 | 2026-08-05 | modify-feature | REQ-PROP-V2-TRACE | merged | Creative v2 full AI/phase traces (both batches + fail closes) | `change-20260805-130421-creative-v2-full-traces/` | 2026-08-05 |
| 20260805-140002 | 2026-08-05 | polish | — | merged | AI Requests trace detail dialog redesign (meta + JSON space) | `change-20260805-140002-polish-ai-trace-detail-dialog/` | 2026-08-05 |
| 20260805-134354 | 2026-08-05 | polish | — | merged | Sidebar nav reorder + rename (IA polish) | `change-20260805-134354-polish-sidebar-nav-ia/` | 2026-08-05 |
| 20260805-130757 | 2026-08-05 | modify-feature | REQ-AI-OBS | merged | Proposals→AI Requests; remove AI Jobs UI+admin APIs; enrich projects overview + sort by createdAt desc | `change-20260805-130757-ai-job-to-traces-enrich-ai-requests/` | 2026-08-05 |
| 20260805-132532 | 2026-08-05 | polish | — | merged | Roles matrix visual style (Yes/No cells; permissions×roles) | `change-20260805-132532-polish-roles-role-first/` | 2026-08-05 |
| 20260805-132124 | 2026-08-05 | modify-feature | — | merged | Roles UI: permission catalog read-only; users manage roles+assignments only | `change-20260805-132124-roles-readonly-permission-catalog/` | 2026-08-05 |
| 20260805-130032 | 2026-08-05 | polish | — | merged | Roles matrix clarity + module labels + default page size 15 | `change-20260805-130032-polish-roles-permissions/` | 2026-08-05 |
| 20260802-173135 | 2026-08-02 | modify-feature | REQ-PROP-V3 | merged | Financial ratio → `%` + RevenueType enum; DNA/assemble totals exclude ratio | `change-20260802-173135-financial-ratio-revenue-enum/` | 2026-08-02 |
| 20260729-125821 | 2026-07-29 | bug-fix | REQ-PROP-V3 | merged | Workspace Settings brand (not Roya) in templates + emails + about AI | `change-20260729-125821-bug-fix-workspace-branding/` | 2026-07-29 |
| 20260729-113947 | 2026-07-29 | new-feature | REQ-TEMPLATE | merged | Template-local banner / full-bleed / images_gallery on all templates | `change-20260729-113947-banner-gallery-sections/` | 2026-07-29 |
| 20260728-000036 | 2026-07-28 | modify-feature | REQ-PROP-V3 | merged | Client-first pitch branding + workspace intro (bug-20260728-000014) | `change-20260728-000036-client-first-pitch-branding/` | 2026-07-28 |
| 20260728-000037 | 2026-07-28 | new-feature | REQ-TEMPLATE | merged | `roya-presentation` HAIA-from-scratch + locked palette + team/risks | `change-20260728-000037-roya-presentation-template/` | 2026-07-28 |
| 20260728-000035 | 2026-07-28 | modify-feature | REQ-FIN-UNIFY | merged | Unify v3 standalone financial HTML with v2 commercial design | `change-20260728-000035-unify-financial-v2-design/` | 2026-07-28 |
| 20260726-000002 | 2026-07-26 | bug-fix | REQ-R | merged | API PermissionGuard parity w/ seed+FE | `change-20260726-000002-r-api-permission-parity/` | 2026-07-28 |
| 20260726-000001 | 2026-07-26 | bug-fix | REQ-R | merged | Enable MainLayout authGuard | `change-20260726-000001-r-enable-web-auth-guard/` | 2026-07-28 |
| 20260726-000003 | 2026-07-26 | general | REQ-R | merged | API .env.example | `change-20260726-000003-r-env-example/` | 2026-07-28 |
| 20260728-000033 | 2026-07-28 | modify-feature | REQ-PROP-UNIFY | merged | Contracts + services line-item parity (object IDs / SOW) | `change-20260728-000033-prop-unify-contracts-services/` | 2026-07-28 |
| 20260728-000032 | 2026-07-28 | modify-feature | REQ-PROP-UNIFY | merged | v2→project+DNA+proposal+traces; stop creative aiJobs; backfill | `change-20260728-000032-prop-unify-v2-project-traces/` | 2026-07-28 |
| 20260728-000031 | 2026-07-28 | modify-feature | REQ-PROP-UNIFY | merged | Archive parity: shared proposal shell + v3 edit/financial/view | `change-20260728-000031-prop-unify-archive-parity/` | 2026-07-28 |
| 20260728-000030 | 2026-07-28 | modify-feature | REQ-PROP-V3 | merged | Per-template section length schemas (pitch ≠ website) | `change-20260728-000030-per-template-section-length-schemas/` | 2026-07-28 |
| 20260727-000024 | 2026-07-27 | modify-feature | REQ-PROP-V3 | merged | Aim 90% + soft 10% + clamp-to-max length validation | `change-20260727-000024-section-length-validation-tolerance/` | 2026-07-28 |
| 20260728-000027 | 2026-07-28 | modify-feature | REQ-PROP-V3 | merged | AI Requests stats + call-type/step filters + fast pagination | `change-20260728-000027-ai-requests-stats-filters-perf/` | 2026-07-28 |
| 20260727-000026 | 2026-07-27 | new-feature | REQ-DNA-VER | merged | DNA versions collection + list/edit/generate/delete + proposal picker | `change-20260727-000026-dna-versions/` | 2026-07-28 |
| 20260727-000025 | 2026-07-27 | modify-feature | REQ-PALETTE | merged | DNA color roles + pitch-landscape primary-led theme | `change-20260727-000025-pitch-branding-color-roles/` | 2026-07-27 |
| 20260727-000023 | 2026-07-27 | new-feature | REQ-TEMPLATE | merged | `website-template` landing + shared `testimonial` | `change-20260727-000023-website-template/` | 2026-07-27 |
| 20260727-000022 | 2026-07-27 | new-feature | REQ-PALETTE | merged | Project color palette + DNA branding + pitch CSS | `change-20260727-000022-project-color-palette/` | 2026-07-27 |
| 20260727-000021 | 2026-07-27 | modify-feature | REQ-PROP-V3 | merged | Project image purpose + pitch workspace/client branding | `change-20260727-000021-project-image-purpose-pitch-branding/` | 2026-07-27 |
| 20260726-000014 | 2026-07-26 | modify-feature | REQ-PROP-V3 | merged | Project edit/delete + DNA page + breadcrumbs | `change-20260726-000014-project-control-dna-breadcrumbs/` | 2026-07-27 |
| 20260727-000020 | 2026-07-27 | new-feature | REQ-SETTINGS-LOGO | merged | Workspace logo upload (Settings + sidebar) | `change-20260727-000020-workspace-logo-upload/` | 2026-07-27 |
| 20260727-000019 | 2026-07-27 | modify-feature | REQ-PROP-V3 | merged | Revenue type = unit; project overrides; services persist fix | `change-20260727-000019-revenue-type-as-unit/` | 2026-07-27 |
| 20260727-000018 | 2026-07-27 | modify-feature | REQ-PROP-V3 | merged | Full research types → pipeline + pitch-landscape sections | `change-20260727-000018-full-research-types/` | 2026-07-27 |
| 20260727-000017 | 2026-07-27 | polish | — | merged | Global p-card style = Create Project form cards | `change-20260727-000017-polish-global-card-style/` | 2026-07-27 |
| 20260727-000016 | 2026-07-27 | bug-fix | REQ-PROP-V3 | merged | Resume/Continue after assemble-export fail | `change-20260727-000016-bug-fix-resume-after-assemble-fail/` | 2026-07-27 |
| 20260727-000015 | 2026-07-27 | bug-fix | REQ-PROP-V3 | merged | Durable pipeline resume after app/Redis stop | `change-20260727-000015-pipeline-durable-resume/` | 2026-07-27 |
| 20260726-000013 | 2026-07-26 | modify-feature | REQ-PROP-V3 | merged | v3 creative dual docs (tech+financial) per language | `change-20260726-000013-prop-v3-creative-dual-docs/` | 2026-07-26 |
| 20260726-000012 | 2026-07-26 | modify-feature | REQ-PROP-V3 | merged | Create Project form parity w/ Creative + DNA | `change-20260726-000012-project-create-form-parity/` | 2026-07-26 |
| 20260726-000011 | 2026-07-26 | new-feature | REQ-PROP-V3 | merged | Pipeline v3 Phase 6 cutover / soft-retire v2 | `change-20260726-000011-prop-v3-cutover/` | 2026-07-26 |
| 20260726-000010 | 2026-07-26 | new-feature | REQ-PROP-V3 | merged | Pipeline v3 AI Requests / cost dashboard UI | `change-20260726-000010-prop-v3-ai-requests-ui/` | 2026-07-26 |
| 20260726-000009 | 2026-07-26 | new-feature | REQ-PROP-V3 | merged | Pipeline v3 Phase 5 FE create / gallery / stepper / PDF | `change-20260726-000009-prop-v3-fe-create-stepper/` | 2026-07-26 |
| 20260726-000008 | 2026-07-26 | new-feature | REQ-PROP-V3 | merged | Pipeline v3 Phase 4 regen / translate / template-switch | `change-20260726-000008-prop-v3-regen-translate/` | 2026-07-26 |
| 20260726-000007 | 2026-07-26 | new-feature | REQ-PROP-V3 | merged | Pipeline v3 Phase 3 Steps 3–5 + engine | `change-20260726-000007-prop-v3-sections-engine/` | 2026-07-26 |
| 20260726-000006 | 2026-07-26 | new-feature | REQ-PROP-V3 | merged | Pipeline v3 Phase 2 Analyze + Map (research subset) | `change-20260726-000006-prop-v3-analyze-map/` | 2026-07-26 |
| 20260726-000005 | 2026-07-26 | new-feature | REQ-PROP-V3 | merged | Pipeline v3 Phase 1 Template system (`pitch-landscape`) | `change-20260726-000005-prop-v3-template-system/` | 2026-07-26 |
| 20260726-000004 | 2026-07-26 | new-feature | REQ-PROP-V3 | merged | Pipeline v3 Phase 0 Foundations (BullMQ, schemas, traces, PDF shell) | `change-20260726-000004-prop-v3-foundations/` | 2026-07-26 |

## Cancelled / blocked

| ID | Pack status | Reason | Folder |
|----|-------------|--------|--------|
| — | — | — | — |
