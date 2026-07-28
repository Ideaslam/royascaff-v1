# Services — Proposals document parity · change-031

Status: **planned**

### SVC-PROP-DOC-01 · Document URL resolve [domain, Proposals]

- After-state behavior for `proposalHtmlUrlForLang(proposal, type, lang)` (ops controller helper or shared util):
  1. `*UrlByLang[lang]` → `*HtmlUrlByLang[lang]` → flat `*HtmlUrl`
  2. If `type === 'technical'` and still empty → `renderedByLang[lang].htmlUrl` (v3 deck)
  3. Else empty → caller may use inline DB HTML
- Financial has **no** deck fallback (standalone financial URL maps only).

### SVC-PROP-DOC-02 · patchProposalDocument [domain, ProposalsDataService]

- Existing: upload S3 `{type}-{lang}.html`; merge inline `*Ar`/`*En`; merge URL maps + flat mirrors.
- **Add:** when `type === 'technical'` and proposal has `renderedByLang` (or `pipelineVersion === '3'`):
  - merge `renderedByLang[lang] = { ...(prev[lang]||{}), htmlUrl: url }` (preserve `pdfUrl` if present)
- Financial patch: URL maps only (no `renderedByLang` write).
- Do not clear other languages.

### SVC-PROP-DOC-03 · List projection [infrastructure, MongoProposalsRepository]

- `SUMMARY_PROJECTION` includes `pipelineVersion`, `projectId`, `language` (see pack data-model).

## Delta

- Technical URL resolve + patch sync `renderedByLang`
- List projection shell fields
- No new services/modules; complete-in-place
