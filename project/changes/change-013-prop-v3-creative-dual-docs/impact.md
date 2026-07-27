# Impact Analysis — change-013-prop-v3-creative-dual-docs

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Data model | partial | `proposals` Mixed — `renderedByLang`, `technicalUrlByLang`, `financialUrlByLang`, `*HtmlUrlByLang` | v3 only fills `renderedByLang`; dual URL maps empty |
| Service(s) | partial | `projects.data.service.ts` createProposal; `export.service.ts`; `proposal-regenerate.service.ts`; FE `financial-template.service.ts` (client-only) | `type: project.type`; no financial HTML upload; regen clears all `renderedByLang` |
| Endpoint(s) | complete | create-proposal / regenerate / translate / export (existing) | Behavior change only; no new routes required |
| Page(s) | partial | `proposals.component.ts` list tech/fin + lang dialog; `proposal-view` v3 lang switcher; `proposal-html-urls.ts` | List already reads legacy maps — empty for v3; send/public same |
| List projection | partial | `mongodb-proposals.repository.ts` SUMMARY_PROJECTION | Already includes `*UrlByLang` / `*HtmlUrl*`; omits `pipelineVersion` / `renderedByLang` (OK if URL maps filled) |

Feature state: **partial**

## Affected Modules
- **Projects / Pipeline v3** — force `type: 'creative'`; export writes technical + financial URL maps; optional financial HTML builder on API
- **Proposals regen/translate** — preserve non-target language artifacts; clear/overwrite only rebuilt language keys in `renderedByLang` + `*UrlByLang`
- **Proposals FE list/send/public** — should work once URL maps filled; minor fallback if needed (`pipelineVersion === '3'` + `renderedByLang` → technical)

## Pack blueprint files to create
- [ ] `blueprint/plan/data-model.md` — proposals after-state for dual docs + creative type
- [ ] `blueprint/actions/api/services/projects.md` — createProposal `type: creative`
- [ ] `blueprint/actions/api/services/pipeline-export.md` — export dual docs + URL maps
- [ ] `blueprint/actions/api/services/proposals-regen.md` — regen/translate language retention
- [ ] `blueprint/actions/web/pages/proposals.md` — list/view/send acceptance notes
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Risk
- **Complexity:** M–H (server financial HTML + export/regen language merge)
- **Cross-module:** Y (pipeline export ↔ proposals list/send)
- **Migration:** N (optional backfill deferred)

## Recommendation
- **Modify**: `createProposalFromProject` → `type: 'creative'`
- **Create**: API financial HTML renderer (port/adapt FE `FinancialTemplateService` or Handlebars) + S3 `financial-{lang}.html`
- **Modify**: `ExportService.runExport` → also set `technicalUrlByLang[lang]`, `financialUrlByLang[lang]` (+ flat/htmlByLang mirrors used by send)
- **Modify**: regenerate — do **not** wipe all langs; archive revision; clear/rebuild current `generation.language` keys only; preserve other `renderedByLang` / `*UrlByLang` entries
- **Modify**: translate export path — ensure financial HTML generated for `targetLang` too
- **Complete**: FE list/send once maps present; small helpers only if gaps remain

## Status target (per artifact after implement)
- proposals dual-doc fields → done
- SVC createProposal creative type → done
- SVC export dual docs → done
- SVC regen language retention → done
- PG proposals list/view notes → done

## Code files likely touched
| Area | Files |
|------|--------|
| BE create | `projects.data.service.ts` |
| BE export | `export.service.ts`, new `financial-html.builder.ts` (or similar), maybe `assemble.service.ts` |
| BE regen | `proposal-regenerate.service.ts`, translate orchestrator if it clears maps |
| BE S3 | `s3-service.ts` (reuse `uploadHtml`) |
| FE | `proposal-html-urls.ts` (optional v3 fallback), `proposals.component.ts` / send only if needed |
| i18n | only if new UI copy |

## Dependencies
- depends-on: — (change-012 verified helpful for services on project, not required for dual docs)
