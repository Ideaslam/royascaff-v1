# Verification — change-20260728-000031-prop-unify-archive-parity

## Plan Consistency
- [x] Pack data-model shared shell documented
- [x] Document service/endpoint behavior specs present
- [x] Archive page specs present
- [x] No main blueprint edits (isolation held)

## Code Verification

| Check | Result |
|-------|--------|
| List projection includes `pipelineVersion`, `projectId`, `language` | PASS — `SUMMARY_PROJECTION` |
| Technical `document-html` falls back to `renderedByLang` | PASS — `proposalHtmlUrlForLang` |
| Technical patch syncs `renderedByLang[lang].htmlUrl` for v3 | PASS — `patchProposalDocument` |
| Edit does not seed empty bundles; fetches document-html | PASS — `buildInitialHtmlBundle` + `ensureLangBundleLoaded` |
| Edit services accept `{ id }` line items | PASS — `normalizeServicesSelection` + label merge |
| v3 view honors Technical/Financial tab + `?tab=financial` | PASS — `docTabOptions` + `applyRendered` |
| FE list model includes shell fields | PASS — `ProposalListItem` |
| Layering / no new collections / no v2 engine rewire | PASS |
| Auth unchanged | PASS |

## Acceptance Criteria

1. v3 archive info/shell fields — PASS (detail GET already full; services `{ id }` shown; list now exposes version/projectId)
2. v3 edit load/save tech+fin — PASS (load via document-html; save via existing PUT + renderedByLang sync)
3. Save coherent with v3 view — PASS (`renderedByLang.htmlUrl` updated on technical patch)
4. Financial visible for completed v3 export — PASS (view tab + list URL maps; empty state if missing). Pre–change-20260726-000013 rows may still lack financial until re-export (known; Part 2 backfill).
5. v2 still works — PASS (inline HTML path preserved; empty-seed fix only when no inline)
6. List projection shell fields — PASS
7. Shared shell documented in pack — PASS
8. No v2 engine behavior change — PASS

## Result: **PASS**

## Manual smoke (recommended)
- [ ] Open completed v3 proposal from `/proposals` → Edit → technical + financial load
- [ ] Save technical → reopen view technical shows update
- [ ] View `?tab=financial` shows financial HTML
- [ ] Open a legacy v2 creative proposal → edit/view still work
