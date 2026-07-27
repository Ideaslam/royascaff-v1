# Data Model — proposals dual docs (pack delta)

## Delta
After-state for Pipeline v3 project proposals so list/send/public can open **technical** and **financial** per language like legacy creative. No new collection.

## proposals (after-state fields used by this pack)

| Field | Type | After-state behavior |
|-------|------|----------------------|
| `type` | String | Always `'creative'` for proposals created via `createProposalFromProject` |
| `language` | `'ar'\|'en'` | Primary / current generation language |
| `pipelineVersion` / `generation.pipelineVersion` | `"3"` | unchanged |
| `renderedByLang` | Object | Per-lang pitch deck: `{ [lang]: { htmlUrl, pdfUrl, htmlKey, pdfKey, … } }` — technical deck |
| `technicalUrlByLang` | `{ ar?, en? }` | Set on export: technical HTML URL for that lang (= `renderedByLang[lang].htmlUrl`) |
| `technicalHtmlUrl` | String | Latest technical HTML (mirror primary/export lang) |
| `technicalHtmlUrlByLang` | `{ ar?, en? }` | Optional mirror of `technicalUrlByLang` for FE helpers |
| `financialUrlByLang` | `{ ar?, en? }` | Set on export: separate financial HTML URL for that lang |
| `financialHtmlUrl` | String | Latest financial HTML |
| `financialHtmlUrlByLang` | `{ ar?, en? }` | Optional mirror for FE `getFinancialUrl` |
| `services` / `total` / `tax` / `grandTotal` | existing | Source for financial HTML builder |
| `revisions[]` | Array | Regen/translate archive (unchanged shape); may snapshot prior URL maps |

### Language merge rules
- **Export for lang L:** upsert `renderedByLang[L]` + upsert technical/financial URL keys for `L` only; keep other langs.
- **Translate → export target T:** add/update `T` keys; keep source lang keys.
- **Regenerate:** clear map/sections; clear **only** keys for the language being regenerated (default `proposal.language` / `generation.language`); do **not** set entire `renderedByLang` / URL maps to null.

### Unchanged
- `project.type` remains project category on the **project** document.
- Sibling proposals (`sourceProposalId`) stay separate proposal ids (template switch), not tech/fin split.
