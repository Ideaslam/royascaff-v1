# Change Log

_Last updated: 2026-07-27_

> Next change number: 019

## Summary

| pack-status | Count |
|-------------|------:|
| drafted | 2 |
| in-progress | 0 |
| verified | 2 |
| merged | 13 |
| cancelled | 0 |
| blocked | 1 |

## In flight (not merged)

| # | Date | Type | Request | Depends on | Pack status | Artifacts done | Scope | Folder |
|---|------|------|---------|------------|-------------|----------------|-------|--------|
| 018 | 2026-07-27 | modify-feature | REQ-PROP-V3 | — | verified | 5/5 | Full research types → pipeline + pitch-landscape sections | `change-018-full-research-types/` |
| 014 | 2026-07-26 | modify-feature | REQ-PROP-V3 | — | verified | 3/3 | Project edit/delete + DNA page + breadcrumbs | `change-014-project-control-dna-breadcrumbs/` |
| 001 | 2026-07-26 | bug-fix | REQ-R | — | drafted | 0/1 | Enable MainLayout authGuard | `change-001-r-enable-web-auth-guard/` |
| 002 | 2026-07-26 | bug-fix | REQ-R | change-001 | blocked | 0/2 | API PermissionGuard parity w/ seed+FE | `change-002-r-api-permission-parity/` |
| 003 | 2026-07-26 | general | REQ-R | — | drafted | 0/1 | API .env.example | `change-003-r-env-example/` |

## Completed

| # | Date | Type | Request | Pack status | Scope | Folder | Merged |
|---|------|------|---------|-------------|-------|--------|--------|
| 017 | 2026-07-27 | polish | — | merged | Global p-card style = Create Project form cards | `change-017-polish-global-card-style/` | 2026-07-27 |
| 016 | 2026-07-27 | bug-fix | REQ-PROP-V3 | merged | Resume/Continue after assemble-export fail | `change-016-bug-fix-resume-after-assemble-fail/` | 2026-07-27 |
| 015 | 2026-07-27 | bug-fix | REQ-PROP-V3 | merged | Durable pipeline resume after app/Redis stop | `change-015-pipeline-durable-resume/` | 2026-07-27 |
| 013 | 2026-07-26 | modify-feature | REQ-PROP-V3 | merged | v3 creative dual docs (tech+financial) per language | `change-013-prop-v3-creative-dual-docs/` | 2026-07-26 |
| 012 | 2026-07-26 | modify-feature | REQ-PROP-V3 | merged | Create Project form parity w/ Creative + DNA | `change-012-project-create-form-parity/` | 2026-07-26 |
| 011 | 2026-07-26 | new-feature | REQ-PROP-V3 | merged | Pipeline v3 Phase 6 cutover / soft-retire v2 | `change-011-prop-v3-cutover/` | 2026-07-26 |
| 010 | 2026-07-26 | new-feature | REQ-PROP-V3 | merged | Pipeline v3 AI Requests / cost dashboard UI | `change-010-prop-v3-ai-requests-ui/` | 2026-07-26 |
| 009 | 2026-07-26 | new-feature | REQ-PROP-V3 | merged | Pipeline v3 Phase 5 FE create / gallery / stepper / PDF | `change-009-prop-v3-fe-create-stepper/` | 2026-07-26 |
| 008 | 2026-07-26 | new-feature | REQ-PROP-V3 | merged | Pipeline v3 Phase 4 regen / translate / template-switch | `change-008-prop-v3-regen-translate/` | 2026-07-26 |
| 007 | 2026-07-26 | new-feature | REQ-PROP-V3 | merged | Pipeline v3 Phase 3 Steps 3–5 + engine | `change-007-prop-v3-sections-engine/` | 2026-07-26 |
| 006 | 2026-07-26 | new-feature | REQ-PROP-V3 | merged | Pipeline v3 Phase 2 Analyze + Map (research subset) | `change-006-prop-v3-analyze-map/` | 2026-07-26 |
| 005 | 2026-07-26 | new-feature | REQ-PROP-V3 | merged | Pipeline v3 Phase 1 Template system (`pitch-landscape`) | `change-005-prop-v3-template-system/` | 2026-07-26 |
| 004 | 2026-07-26 | new-feature | REQ-PROP-V3 | merged | Pipeline v3 Phase 0 Foundations (BullMQ, schemas, traces, PDF shell) | `change-004-prop-v3-foundations/` | 2026-07-26 |

## Cancelled / blocked

| # | Pack status | Reason | Folder |
|---|-------------|--------|--------|
| 002 | blocked | waits on change-001 verified/merged (optional soft dep — can parallelize if desired) | `change-002-r-api-permission-parity/` |
