# Services — RevenueType enum (API)

### SVC-REV-TYPE-01 · RevenueType shared enum [domain, internal]
- Status: planned
- Location: `roya-sales-ai-api-v2/src/common/types/revenue-type.ts` (new)
- Exports:
  - `enum RevenueType` with string values:
    - `Project = "project"`
    - `Recurring = "recurring"`
    - `Retainer = "retainer"`
    - `OneTime = "one-time"`
    - `Hourly = "hourly"`
    - `Ratio = "ratio"`
  - `isRatioRevenueType(value: unknown): boolean` — true iff value equals `RevenueType.Ratio`
  - `formatRatioPercent(price: number): string` — returns `"${n}%"` (finite number; coerce safely)
- Rules:
  - Canonical wire values stay the existing lowercase strings (no DB migration)
  - Prefer enum members over bare `"ratio"` / `"project"` literals in code this pack touches
  - Labels/i18n remain outside the enum (FE options / Arabic unit labels unchanged)

## Delta
- Before: revenue type compared as ad-hoc string literals; no shared enum on API.
- After: API has `RevenueType` + helpers; assign/export/financial paths use them for ratio detection and `%` formatting.
