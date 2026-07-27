# Pages — Safqa Web · Proposals (pack delta)

## Delta
Ensure list / view / send treat v3 project proposals as creative dual-doc proposals once API fills URL maps. Prefer minimal FE changes.

### Proposals List `PG-PROPOSALS-01`
- Status: done
- After-state:
  - Technical / Financial buttons + language dialog open correct URLs for v3 creative rows via existing `getTechnicalUrl` / `getFinancialUrl`.
  - `canSendProposal` passes when both maps have at least one lang (same as creative).
  - Badge/type column shows creative when `type === 'creative'`.
- Optional: if a row still lacks URL maps but has `renderedByLang`, helper may fall back technical → `renderedByLang[lang].htmlUrl` (defensive only).

### Proposal View v3 `PG-PROP-V3-02`
- Status: done
- After-state:
  - Keep deck iframe + language switcher from `renderedByLang`.
  - After translate, both langs selectable; list still offers financial per lang.
  - Optional UX (nice-to-have): link/button “Open financial” for current view language using `getFinancialUrl` — not required if list covers it.

### Public / send
- No new pages; rely on populated `technicalUrlByLang` / `financialUrlByLang`.
- Touch FE/BE send helpers only if a field-name mismatch appears in verify.

### Out of scope this pack
- Project edit/delete, DNA page, breadcrumbs (follow-up pack).
