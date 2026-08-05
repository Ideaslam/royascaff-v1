# Change Request

## Metadata
- **date**: 2026-07-29
- **change-type**: modify-feature
- **target-app**: api
- **affected-repos**: backend
- **priority**: high
- **request-id**: REQ-PROP-V3
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Pipeline Map, Pipeline Sections, Templates (presentation catalogs), Assemble
- Feature(s): PDF-safe list section splitting — Map plans N instances; Section AI fills chunks; financial uses `financial_part` / `financial_full` keys (no `showTotals` flag)
- Endpoint(s): none new
- Page(s)/View(s): none
- Service(s): MapOrchestrator + map prompt; presentation catalogs; AssembleService financial inject; section prompts (light)

## Description

### Problem
Fixed 16:9 PDF slides clip long list content (e.g. phased action plan / timeline). Competitors already work as **N× same key**; list-heavy sections today are single-instance and overflow.

### Outcome
For **PDF/presentation** templates only, Map may emit **multiple consecutive instances** of list keys when capacity would overflow. Section AI fills each chunk. Titles like `Timeline (1/2)` are allowed.

**Pricing contract (refined):** two presentation-local keys instead of multi-`financial` + `showTotals`:
- Fits one slide → single `financial` (rows + totals)
- Needs overflow → `financial_part`×(N−1) then one `financial_full` (totals only on full)
- Assemble still injects real money rows; AI never invents prices

### Stage split (locked)

| Stage | Responsibility |
|-------|----------------|
| **Map** | Decide **whether** and **how many** instances; for pricing choose single `financial` vs part/full path |
| **Section AI** | Fill only that chunk within contentSchema / capacity |
| **Assemble** | Partition `rows` across financial-family instances; inject totals only for `financial` / `financial_full` |

Website / landing: **no** split; single `financial` only (no part/full keys in catalog).

### Template gate (future-proof)
Drive behavior from template shape (`isPresentationTemplateKey` / landing detection), **not** a hard-coded template-key allowlist.

### Split-capable keys (v1)
| Key | Notes |
|-----|--------|
| `timeline` | Phase lists — multi same key |
| `action_plan` | Phased SOW — multi same key |
| `services` | Service card grids — multi same key |
| `financial_part` | Pricing continuation — rows only |
| `financial_full` | Pricing closer — rows + totals |
| `financial` | Single-slide pricing (no multi) |

### Dynamic N (not static 2)
- Map AI chooses N from capacity hints.
- Soft preference: keep N small (often 1; 2–3 when needed).
- Catalog ceiling: `pages.max` = **4** for timeline/action_plan/services; `financial_part` max **3**; `financial_full` max **1**.
- Do **not** force split when content fits one slide.

### Catalog (presentation only)
- pitch / formal / roya: list keys repeatable max 4; insert `financial_part` + `financial_full` after `financial`
- website: reset list keys to non-repeatable; omit financial split keys

### Map prompt / payload
- Presentation: `listSplit` + `financialSplit` rule object
- Require `financial` **or** `financial_full`; reject mixed single+split paths; reject part without full

### Assemble financial
- Collect ordered financial-family sections; `partitionRows`; totals by key (`financialSectionShowsTotals`)
- Partials: `financial_part.hbs` (no totals), `financial` / `financial_full.hbs` (totals)

### Out of scope
- CSS-only shrink / post-render auto-split
- FE section editor for parts
- Website landing split
- Expanding split to other keys in this pack

## Acceptance Criteria

1. Presentation catalogs mark `timeline`, `action_plan`, `services` repeatable max 4; expose `financial_part` / `financial_full`; website keeps list keys single and omits financial split keys.
2. Map for presentation may emit dynamic N for list keys; pricing uses single `financial` or part*+full.
3. Map for website/landing does **not** instruct multi-instance splits; uses single `financial`.
4. Template gate uses presentation vs landing detection.
5. Section writers for split instances fill only their chunk.
6. Assemble chunks rows across financial-family keys; totals only on `financial` / `financial_full` (no `showTotals` flag).
7. Pricing required via `financial` or `financial_full`; pages.max clamped.
8. No FE changes.

## Notes
- Priority high — PDF readability.
- Financial money remains code-owned; AI still must not invent prices/totals.
- Refined from earlier `showTotals` approach before main-blueprint merge.
