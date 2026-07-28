# Impact Analysis — change-031-prop-unify-archive-parity

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Data model | partial | `proposals` shared; dual URL maps + `renderedByLang` (v3); inline HTML (v2) | Shared shell fields not enforced; list omits `pipelineVersion` / `projectId`; `services` object vs `string[]` |
| Service(s) | partial | `proposals.data.service.ts` `patchProposalDocument`; `export.service.ts` dual docs; `document-html` helpers | Patch updates URL maps + inline only — **not** `renderedByLang`; `proposalHtmlUrlForLang` ignores `renderedByLang` |
| Endpoint(s) | complete | `GET /api/proposals/document-html`; `PUT …/technical|financial`; `GET /api/data/proposals/:id` | Behavior gaps only; no new routes required for Part 1 |
| Page(s) — edit | partial | `proposal-edit.component.ts` | `buildInitialHtmlBundleFromProposal` seeds empty `{ar,en}` → `ensureLangBundleLoaded` early-returns → never fetches S3; services normalize misses `id` on objects |
| Page(s) — view | partial | `proposal-view.component.ts` | Reads `?tab=` but v3 branch ignores financial; only pitch iframe via `renderedByLang` |
| Page(s) — list | partial | `proposals.component.ts` + `proposal-html-urls.ts` | Financial open needs `financialUrlByLang` (no deck fallback); list rows lack `pipelineVersion`/`projectId` |
| List projection | partial | `mongodb-proposals.repository.ts` `SUMMARY_PROJECTION` | Missing `pipelineVersion`, `projectId`, `language` (optional `renderedByLang` if needed for tech fallback) |

Feature state: **partial**

## Affected Modules
- **Proposals (API)** — document URL resolution + patch sync for v3; list projection shell fields
- **Proposals (Web archive)** — list open helpers; edit load/save; view financial tab for v3
- **Pipeline v3** — no engine change; ensure post-export URL maps already present (change-013); optional verify-only
- **Creative Pipeline v2** — no engine change this pack (read/edit parity only)

## Pack blueprint files to create
- [ ] `blueprint/plan/data-model.md` — shared proposal shell vs engine-specific fields
- [ ] `blueprint/actions/api/services/proposals-document.md` — document-html resolution + `patchProposalDocument` sync `renderedByLang`
- [ ] `blueprint/actions/api/endpoints/proposals-document.md` — behavior notes (existing routes)
- [ ] `blueprint/actions/web/pages/proposals-archive.md` — list / view / edit acceptance
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Risk
- **Complexity:** M (FE load bug is clear; save↔view sync needs care)
- **Cross-module:** Y (archive FE ↔ proposals ops ↔ v3 `renderedByLang`)
- **Migration:** N (Part 2 backfill script)

## Recommendation
- **Complete in place**: editor HTML load (do not seed empty bundles; fetch via `document-html` / URLs including `renderedByLang` for technical)
- **Modify**: `patchProposalDocument` — when type=technical and proposal has `renderedByLang`/`pipelineVersion===3`, also set `renderedByLang[lang].htmlUrl`
- **Modify**: `proposalHtmlUrlForLang` (+ FE `getTechnicalUrl` already has deck fallback) — technical falls back to `renderedByLang[lang].htmlUrl`
- **Modify**: v3 `proposal-view` — honor `tab=financial` (iframe/open financial URL); keep pitch for technical
- **Modify**: `SUMMARY_PROJECTION` (+ FE list model) — include `pipelineVersion`, `projectId`, `language`
- **Modify**: edit info services normalize — accept `{ id }` line items so v3 services show in info tab
- **Modify**: list financial open — ensure completed v3 rows with `financialUrlByLang` work; navigate to view financial tab when URL missing but status ready (defensive)
- **Defer**: v2→project/DNA/traces, aiJobs stop-write, backfill script → Part 2; contracts → Part 3

## Status target (per artifact after implement)
- shared proposal shell (data-model) → done
- SVC/EP document load+save parity → done
- PG archive list/view/edit → done

## Code files likely touched

| Area | Files |
|------|--------|
| BE list | `mongodb-proposals.repository.ts` (`SUMMARY_PROJECTION`) |
| BE document | `proposals.data.service.ts` (`patchProposalDocument`), `proposals-operations.controller.ts` (`proposalHtmlUrlForLang`) |
| FE helpers | `proposal-html-urls.ts` |
| FE list | `proposals.component.ts`, `app.models.ts` (`ProposalListItem`) |
| FE edit | `proposal-edit.component.ts` (bundle load + services normalize) |
| FE view | `proposal-view.component.ts` (+ template if tab UI) |
| Specs (optional) | small unit tests for URL helper / patch sync if present |

## Dependencies
- depends-on: — (change-013 dual-doc export assumed for new v3 rows; pre-013 rows may still lack financial until re-export / Part 2)
- blocks: change-032 (Part 2 — v2 identity + traces)
