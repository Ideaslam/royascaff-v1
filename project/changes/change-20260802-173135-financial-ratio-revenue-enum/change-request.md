# Change Request

## Metadata
- **date**: 2026-08-02
- **change-type**: modify-feature
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: medium
- **request-id**: REQ-PROP-V3
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: verified

## Scope
- Module(s): Pipeline v3 assemble/export financial assignment; Services revenue-type constants
- Feature(s): Ratio revenue type → `%` price display in financial outputs; exclude ratio from service money totals; shared `RevenueType` enum
- Endpoint(s): none new (existing assemble/export paths)
- Page(s)/View(s): none required (optional FE constant cleanup to use enum values)
- Service(s): `assemble.service` `buildFinancial`; `financial-html.builder` totals/map; `financial-document.renderer` price cell; FE `REVENUE_TYPE_OPTIONS` / helpers

## Description

**Problem:** Proposal financial slides format every line with the Handlebars `money` helper as SAR. Assemble `buildFinancial` assigns `unitPrice` / `lineTotal` without considering `revenueType`, so a ratio service priced `10` shows as **10 SAR** instead of **10%**. Ratio lines can also inflate service subtotals even though ratio is from other costs, not the services money total.

**Outcome (fix assigning / build code — not `.hbs` template sections):**
1. Introduce a shared **`RevenueType` enum** (canonical values: `project`, `recurring`, `retainer`, `one-time`, `hourly`, `ratio`) on API + FE; replace static string literals / option `value` strings with the enum.
2. In financial **assignment** (`assemble.buildFinancial`, standalone `financialTotalsFromProposal` / `mapServices`, and related display formatters): when `revenueType === RevenueType.Ratio`, expose price for display as **`{n}%`** (e.g. `10%`) so existing `{{money …}}` / price cells render percentage without editing template partials.
3. **Totals:** ratio lines must **not** contribute to subtotal / tax / grand total (ratio is outside services money totals). Prefer stored `fin.subtotal` / tax / grand when present; when deriving from rows, skip ratio.
4. Standalone commercial financial document: align ratio cell to **`10%` only** (drop “of campaign value” / “من قيمة الحملة”).
5. FE helpers that compare `'ratio'` or build options use the same enum values.

**Out of scope:**
- Editing Handlebars partials under `templates/**/partials/financial*.hbs` (or equivalent section templates)
- New revenue-type values beyond the existing set
- DB migration / dropping legacy `unit`
- New API endpoints

## Acceptance Criteria
1. `RevenueType` enum exists on API and FE with values matching today’s option values (`project`, `recurring`, `retainer`, `one-time`, `hourly`, `ratio`).
2. Code paths that assign financial rows for proposal templates include `revenueType` and format ratio unit/line amounts as `N%` (e.g. `10%`) without changing `.hbs` section files.
3. Ratio lines do not add to derived subtotal / tax / grand total in assemble or standalone financial totals builders.
4. Standalone financial document price cell for ratio shows `10%` (not `10 SAR`, not “of campaign value”).
5. FE `REVENUE_TYPE_OPTIONS` (and ratio display checks) use enum values instead of bare string literals for the type key.
6. Non-ratio services continue to show money amounts in SAR / ر.س as today.

## Notes (optional)
- Approach: prepare display-ready values (and/or teach the `money` helper to pass through `%` strings) in assign/render TypeScript — **not** by editing template section markup.
- Continues `REQ-PROP-V3` after merged `change-20260727-000019-revenue-type-as-unit`.
