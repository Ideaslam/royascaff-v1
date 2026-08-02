# Services — Pipeline v3 Export · Standalone financial (ratio + enum)

### SVC-PIPE-FIN-TOTALS · financialTotalsFromProposal [domain, internal]
- Status: planned
- Rules (after-state):
  - When deriving subtotal from services (no stored subtotal), **exclude** lines where `isRatioRevenueType(revenueType)`.
  - Tax / grandTotal continue from stored fields or derived non-ratio subtotal (15% tax rule unchanged when deriving).
  - Use `RevenueType` helpers instead of `"ratio"` string literals.

### SVC-PIPE-FIN-MAP · mapServices / buildFinancialProposalHtml [domain, internal]
- Status: planned
- Rules:
  - Keep mapping `revenueType` onto document service items.
  - For ratio: price used for display is the ratio percent value; do not expand `price * qty` into a money total for ratio (same intent as today for ratio line price).
  - Use enum for ratio branching.

### SVC-PIPE-FIN-DOC · formatPriceCell (financial-document.renderer) [domain, internal]
- Status: planned
- Rules:
  - When ratio: return `formatRatioPercent(s.price)` only — e.g. `10%` (not `10 SAR`, not “of campaign value” / “من قيمة الحملة”).
  - Non-ratio: unchanged SAR / ر.س formatting.
  - Category totals / bar chart: continue excluding ratio from money aggregates (use enum).

## Delta
- Before: ratio cell = `% of campaign value`; totals derivation may include ratio × qty as money.
- After: ratio cell = `N%`; derived money totals ignore ratio; branching via `RevenueType`.
