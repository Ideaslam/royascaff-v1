# Change Request

## Metadata
- **date**: 2026-07-28
- **change-type**: modify-feature
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: high
- **request-id**: REQ-PROP-UNIFY
- **part**: 1/3
- **depends-on**: —
- **blocks**: change-032 (planned)
- **pack-status**: merged

## Scope
- Module(s): Proposals (archive / view / edit / document HTML), Pipeline v3 export/read paths, Creative Pipeline v2 read paths (parity only — no engine rewire in this pack)
- Feature(s): Unified shared proposal document shell; archive works for v2 and v3 without breaking either engine
- Endpoint(s): `GET/PUT` proposal document HTML; `GET /data/proposals/:id`; list/summary projection; patch info; status/rendered helpers as needed
- Page(s)/View(s): web `/proposals` archive, `/proposals/:id/view`, `/proposals/:id/edit`
- Service(s): `ProposalsDataService`, proposal ops (document-html / patch technical|financial), FE proposal URL helpers + edit/view components

## Description

Two generation engines remain (different flows and useful results):

- **Pipeline v2** — creative section engine → final creative + financial HTML
- **Pipeline v3** — project → DNA → template sections → assembled deck + financial

Both must share the **same Mongo collections** (`projects`, `project_dna_versions`, `proposals`, `clients`, `services`, `contracts`, `pipelineTraces`). No parallel proposal/project stores. Proposal **modules/fields used by archive, editor, and contracts consumers** must be **identical** across versions (union / fill missing fields); engines differ only in how content is produced and which engine-specific fields they fill.

**This pack (1/3)** is the critical path: make Proposal Archive (info, view, edit, financial) work for v3 today, and close field gaps so v2 and v3 proposal documents look the same to shared consumers — without rewiring the v2 engine onto project/DNA/traces yet (that is Part 2).

Known gaps to close:

1. Opening a v3 proposal from archive shows incomplete info
2. Visual editor does not load/save v3 technical/financial (assumes inline v2 HTML; never fetches S3 / `document-html`; save does not stay coherent with `renderedByLang`)
3. Financial missing or not openable for v3 in list/view (`?tab=financial` ignored; weak URL fallbacks)
4. Shared list/detail fields incomplete for branching (`pipelineVersion`, URL maps, services shape)

**Out of scope (this pack):**
- Rewire v2 create onto project + DNA + `pipelineTraces` / stop `aiJobs` writes → **Part 2**
- Contracts `services` object-ID normalization → **Part 3**
- Hard-delete `aiJobs` collection
- Full SOLID module extraction / visual-editor redesign for multi-page pitch CSS

**Follow-up packs (same request-id):**
- **032 · 2/3** — v2 engine keeps section→HTML flow but creates project + DNA + proposal (`pipelineVersion: "2"`), uses `generation` + `pipelineTraces` instead of `aiJobs`; one-time backfill script for legacy rows without `projectId`
- **033 · 3/3** — Contracts + services line-item parity

## Acceptance Criteria

1. From Proposal Archive, open a completed **v3** proposal → detail/info shows the same shared identity fields as v2 where data exists (`client*`, project/title, services/totals, language, status, URL maps, `pipelineVersion`, `projectId`).
2. From Archive → Edit on a completed **v3** proposal → technical and financial tabs load HTML (via existing document-html / S3 URL path, not empty inline seeds) and save updates persist and reopen correctly.
3. Saving technical HTML for a v3 proposal keeps archive/view coherent (URL maps and, where view uses it, `renderedByLang` for that language stay in sync or view reads the same source as the editor).
4. After a successful v3 export, archive list exposes **Financial** (open URL or in-app financial tab); v3 view honors `?tab=financial` (or equivalent UI) without hiding the financial document.
5. Completed **v2** proposals still open, view, and edit technical/financial without regression.
6. List/summary API (or FE load path) includes fields needed to branch UX safely: at least `pipelineVersion`, `projectId`, and technical/financial URL maps (no new collections).
7. Shared proposal shell documented in pack blueprint: required shared fields vs engine-specific nullable fields; no requirement that v2 fill `sectionMap`/`templateKey` or that v3 fill `creativeOptions`.
8. No change to v2 section-generation engine behavior in this pack (parity/read/write consumers only).

## Notes (optional)

- Engines stay separate; archive/editor/contracts consumers see one proposal shape.
- `pipelineTraces` / remove creative `aiJobs` writes = Part 2.
- Legacy backfill without `projectId` = one-time script in Part 2.
- Prefer complete-in-place fixes over new modules in Part 1.
