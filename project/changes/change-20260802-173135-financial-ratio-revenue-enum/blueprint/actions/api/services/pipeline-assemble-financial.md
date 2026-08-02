# Services — Pipeline v3 Assemble · Financial row assignment

### SVC-PIPE-ASM-FIN · AssembleService.buildFinancial [domain, internal, PipelineV3]
- Status: planned
- Methods:
  - `buildFinancial(proposal, project, language)` — assign financial context rows + totals for proposal template render (pitch / formal / roya / website)
- Rules (after-state):
  1. Each row includes `revenueType` from the service (string enum value when present).
  2. When `isRatioRevenueType(revenueType)`:
     - Display amounts for `unitPrice` and `lineTotal` are the string `formatRatioPercent(price)` (e.g. `10%`), **not** a SAR money number.
     - `qty` may remain as stored (typically 1); do not multiply ratio into a money line total.
  3. When not ratio: keep today’s behavior — numeric `unitPrice` / `lineTotal = price * qty`.
  4. **Totals:** Always sum **non-ratio** rows for money subtotal. If **any** ratio line exists, **ignore** stored `fin.subtotal` / `fin.tax` / `fin.grandTotal` (they may incorrectly include the percent) and set `tax = round(subtotal * taxRate)` (default 0.15), `grandTotal = subtotal + tax`. Without ratio, prefer stored totals then derived.
  5. Do **not** edit `.hbs` financial partials.
- Deps: `RevenueType` helpers; existing catalog enrich
- Side effects: none (pure assign for assemble context)

### SVC-PIPE-MONEY-HELPER · TemplateRenderService `money` helper [domain, internal]
- Status: planned
- Rules:
  - If value is a string that already represents a percentage (e.g. ends with `%`) → return it unchanged (so `{{money this.unitPrice}}` works without template edits).
  - Otherwise keep existing Intl currency formatting (default SAR).
- Types: widen `FinancialRenderContext.rows` so `unitPrice` / `lineTotal` may be `number | string`.

## Delta
- Before: all rows are numeric money; `money` always formats as currency; derived totals sum every line.
- After: ratio rows carry `N%` display strings; `money` passes them through; derived money totals skip ratio.
