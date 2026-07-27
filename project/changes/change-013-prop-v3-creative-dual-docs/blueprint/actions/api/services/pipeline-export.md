# Services — Pipeline v3 Export · dual docs (pack delta)

## Delta
After assemble staging is ready, export must publish **technical** (pitch) + **financial** (standalone HTML) for the export language and fill legacy URL maps.

### SVC-PIPE-EXPORT — ExportService.runExport (+ financial builder)
- Status: done
- Behavior:
  1. Keep existing: read `generation.staging` → merge into `renderedByLang[language]` (pitch html/pdf).
  2. **Technical URL maps** for `language`:
     - `technicalUrlByLang[language] = staging.htmlUrl`
     - `technicalHtmlUrl = staging.htmlUrl`
     - `technicalHtmlUrlByLang[language] = staging.htmlUrl` (for FE helper parity)
  3. **Financial HTML** for `language`:
     - Build HTML from proposal `services` + totals + client/project labels + `documentLang = language` (adapt FE `FinancialTemplateService` patterns or Handlebars template under API).
     - Upload via `S3Service.uploadHtml` e.g. `proposals/{id}/v3/{lang}/financial.html` or `financial-{lang}.html`.
     - Set `financialUrlByLang[language]`, `financialHtmlUrl`, `financialHtmlUrlByLang[language]`.
  4. Merge updates with existing maps (spread prior keys; upsert current lang only).
  5. Generation status / traces unchanged aside from meta noting financial upload.
- Failure: if financial build/upload fails, fail export (or mark partially_failed with message) — financial is required for creative parity / send readiness.
- Deps: ProposalsRepository, S3Service, ClientsRepository optional for client CR/phone if available on proposal/project.
- Rules: never invent service prices; use proposal/project facts only.

### Notes
- Pitch section `financial` inside the deck remains; standalone financial doc is the creative-compatible artifact for list/send.
- Translate path ends in assemble→export for `targetLang` — same export dual-doc logic applies.
