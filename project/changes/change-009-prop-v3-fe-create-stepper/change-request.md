# Change Request

## Metadata
- **date**: 2026-07-26
- **change-type**: new-feature
- **target-app**: web
- **affected-repos**: frontend (+ thin backend if templates list missing)
- **priority**: high
- **request-id**: REQ-PROP-V3
- **part**: 6/8
- **depends-on**: change-008
- **blocks**: change-010 (planned — AI Requests / cost dashboard UI)
- **pack-status**: merged

## Scope
- Module(s): Projects (new FE), Templates (gallery), Proposals (v3 view/actions), Creative (dual-path: keep v2 when flag off)
- Feature(s): Phase 5 Frontend — project create, template gallery, pipeline stepper, server PDF download, project workspace
- Endpoint(s): consume existing projects/proposals pipeline APIs; optional thin `GET /api/data/templates` if not present
- Page(s)/View(s): web — `/projects` (list/create), `/projects/:id` (workspace), create→template→generate flow, proposal view enhancements for v3
- Service(s): FE ProjectsService / PipelineStatusService; thin Templates list API if needed

## Description

Implement **Phase 5 — Frontend** per `docs/refactor-proposal-generator.md` §14 items 1–4 and §15 Phase 5.

**Depends on** merged `change-008` (regen / translate / sibling APIs).

**This pack delivers:**

1. **Create Project flow** — form adapted from creative create (info, competitors ≤3, services/financials, research subset) **without** design-style / page-count; multipart **RFP** + **images** uploads to project APIs.
2. **Template gallery step** — pick active template (`pitch-landscape`, `pitch-landscape-formal`); then `POST …/projects/:id/proposals` (gated by workspace `pipelineV3Enabled`).
3. **Pipeline stepper** — poll `GET …/proposals/:id/status` every 3–5s; steps Analyzing → Mapping → Writing N/M → Assembling → Exporting → Ready / Ready with gaps / Failed; real `failed` + `partially_failed` states (not masked as completed).
4. **Proposal v3 view** — HTML preview (iframe from `renderedByLang.htmlUrl`); **Download PDF** from server artifact; language tabs when both langs exist; actions: Retry failed sections, Translate, New template (sibling), Regenerate (optional in UI if timeboxed).
5. **Project workspace page** — list proposals (and contracts if already linked) for one project; entry to create another proposal / template switch.
6. **Dual path** — when `pipelineV3Enabled` is false (or user lacks projects perms), keep existing `/creative` + `/ai-jobs` path unchanged; nav entry for Projects only when appropriate.

**Out of scope:**
- AI Requests / cost dashboard UI — change-010
- Cutover / retire v2 — change-011
- Structured per-section editor / slot forms
- Full designed formal template assets (catalog already seeded)
- Admin template editor, Bull Board
- Restoring `authGuard` on MainLayout (REQ-R change-001)

**Locked decisions (carry forward):**
- PrimeNG 18 + RoyaPreset; Arabic-first RTL via ngx-translate
- Feature flag `settings.pipelineV3Enabled` gates v3 create/mutations UX
- Competitors max 3; research launch subset market/competitor/audience
- Ready with gaps = `partially_failed` + per-section retry
- Leave legacy creative path when flag off
- No structured section editor in v1

## Acceptance Criteria

1. User can create a Project (with RFP/images multipart), pick a template, and start a v3 proposal generation without using `/ai-jobs` creative path.
2. Pipeline stepper reflects live status from `GET …/status` (3–5s poll) including failed / partially_failed / ready, with section progress when generating sections.
3. On ready/partially_failed, user can preview HTML and download server PDF for the active language; language tabs work when both langs rendered.
4. From proposal/project UI: Retry failed sections, Translate (other lang), and New template (sibling) call the change-008 APIs and show progress again.
5. Project workspace lists that project's proposals; original proposal unchanged when sibling created.
6. When `pipelineV3Enabled` is false, v3 create entry is hidden/disabled and `/creative` still works.
7. `ng build` (or project equivalent) succeeds; no cutover of v2.

## Notes

- Source: `docs/refactor-proposal-generator.md` §14, §15 Phase 5.
- Thin BE: if `GET /api/data/templates` (list active) is missing, add it in this pack for gallery cards (fixture-render alone is insufficient).
- Permissions: reuse `projects.*` + existing proposal view/edit; nav uses `*appHasPermission`.
- Part numbering: 6/8 within REQ-PROP-V3 (API parts 1–5 = change-004…008).
