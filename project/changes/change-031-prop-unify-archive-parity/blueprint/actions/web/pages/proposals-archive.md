# Pages — Proposal archive parity · change-031

Status: **planned**

### PG-PROPOSALS-01 · List `/proposals`

- Open Technical / Financial per language via `getTechnicalUrl` / `getFinancialUrl`.
- Technical already may fall back to `renderedByLang`; keep.
- When financial URL missing but user chose Financial → navigate `view?tab=financial` (existing fallback); v3 view must honor tab (below).
- List item model accepts `pipelineVersion`, `projectId`, `language` from API.
- Do not break v2 rows.

### PG-PROPOSALS-02 · View `/proposals/:id/view`

- Still branch v3 vs legacy.
- **v3:** honor query `tab=technical|financial` (default technical).
  - `technical` → existing pitch iframe from `rendered` / `renderedByLang` (status poll)
  - `financial` → show financial document: prefer `getFinancialUrl(proposal, activeLang)` iframe or open; if missing show clear empty state (not pitch)
- Optional: tab switcher on v3 view for Technical / Financial without leaving the page.
- Legacy v2 path unchanged (inline HTML by tab).

### PG-PROPOSALS-03 · Edit `/proposals/:id/edit`

#### HTML load

- Do **not** seed empty `{ ar, en }` bundles that block fetch.
- On init (and language change): resolve active lang HTML via:
  1. inline `*Ar`/`*En` / legacy if non-empty
  2. else URL maps / `document-html` (technical may use `renderedByLang` via API fallback)
- `ensureLangBundleLoaded`: treat empty strings as not loaded; fetch when technical+financial both empty for that lang.

#### HTML save

- Keep PUT technical/financial per lang (existing).
- After save, v3 view must show updated technical (server syncs `renderedByLang`).

#### Info / services

- `normalizeServicesSelection`: also accept object `id` (and keep string / value / label / name).
- Info form shows client, title, projectName, totals, selected services for v3 without requiring `creativeOptions`.
- Creative-options subform may stay empty for v3 (engine-specific); do not require it for save info.

#### Regenerate

- Out of scope to rewire archive regenerate to v3 API this pack (Part 2). Do not break existing v2 regenerate when flag off.

## Delta

- Edit load/save v3-aware
- View financial tab for v3
- Services `{ id }` normalize
- List model shell fields
