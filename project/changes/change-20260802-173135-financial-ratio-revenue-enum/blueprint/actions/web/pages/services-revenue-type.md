# Pages / constants — Web RevenueType enum + financial display parity

### PG-REV-TYPE-01 · RevenueType enum + options [web, shared]
- Status: planned
- Location: prefer `src/app/core/constants/revenue-type.ts` (new) **or** extend `creative-form-options.ts`
- After-state:
  - `enum RevenueType` with same wire values as API (`project`, `recurring`, `retainer`, `one-time`, `hourly`, `ratio`)
  - `REVENUE_TYPE_OPTIONS` option `value`s use `RevenueType.*` (empty placeholder option may remain `''`)
  - `getRevenueTypeLabel` / `revenueTypeToUnit` keep working; labels unchanged
  - Export `isRatioRevenueType` (or equivalent) for callers

### PG-REV-TYPE-02 · Call sites using ratio / options [web]
- Status: planned
- Touch (use enum / helper instead of `'ratio'` literals where this pack already opens the file):
  - `creative-form-options.ts` (or new enum module) — source of truth for options
  - Project create/edit price display + total reducers
  - Services list ratio display (price as `%`; drop “of campaign value” copy if still present for parity with `N%` only — or keep i18n suffix only if product still wants it; **pack default: show `N%` only** to match acceptance)
  - Creative / proposal / output helpers that branch on ratio
  - `financial-template.service.ts` `formatPriceCell` (or equivalent) → `${price}%` only

## Delta
- Before: static option values + scattered `'ratio'` string checks; FE financial template uses “% of campaign value”.
- After: shared FE `RevenueType` enum drives option values and ratio checks; financial template ratio cell is `N%`.
