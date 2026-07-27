# Services — Proposal regenerate / translate language retention (pack delta)

## Delta
Regenerate must not wipe all language artifacts. Translate must leave source language dual docs intact.

### SVC-PROP-REGEN — ProposalRegenerateService.regenerate
- Status: done
- Behavior:
  - Archive revision as today (`reason: "regenerate"`). Prefer revision snapshot includes prior `renderedByLang` + URL maps.
  - Let `L = proposal.language` (or `generation.language`).
  - Clear `sectionMap` / `sections` for rebuild.
  - **Do not** set `renderedByLang: null` for the whole object.
  - Instead: remove or null only `renderedByLang[L]` (and optionally leave others).
  - For URL maps: delete keys for `L` only on `technicalUrlByLang`, `financialUrlByLang`, `technicalHtmlUrlByLang`, `financialHtmlUrlByLang`; keep other langs.
  - Flat `technicalHtmlUrl` / `financialHtmlUrl`: set to remaining preferred lang URL if any, else null until next export.
  - Re-enqueue map as today; after export, `L` dual docs are rewritten.
- Rules: other language technical/financial remain openable from list during/after regen of `L`.

### SVC-PROP-TRANSLATE — TranslateOrchestrator (+ export)
- Status: done
- Behavior:
  - Continue filling `contentByLang` for target; assemble/export for `targetLang`.
  - Export dual-doc upsert for `targetLang` only; source lang maps untouched.
  - Do not clear `renderedByLang` or URL maps globally on translate start.

### Unchanged
- Sibling / new-template (`sourceProposalId` + `fromStep: map`) still creates a **new** proposal id.
