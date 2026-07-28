# Pages — Safqa Web · Global Cards (polish)

> Pack-only UI notes. Do not merge into main until P.5.

### Shared card chrome `PG-UI-CARD-01`
- Route: — (global; all authenticated pages using PrimeNG `p-card`)
- Status: done
- Components: PrimeNG `p-card` default appearance
- Notes (after-state):
  - Hairline border `1px solid var(--form-card-border)` (`#e3e5e8` light / zinc border dark)
  - Background `var(--app-bg)`; border-radius `12px`; **box-shadow: none**
  - Default spacing: `margin-bottom: 1.25rem` between stacked cards; zeroed inside gap parents (`.form-stack`, `.stats-grid`, `.charts-grid`, `.charts-row`, `.summary-grid`)
  - Body / caption / header padding-inline `1.25rem`; body padding-block `1.25rem`; caption padding-top `1.25rem`, padding-bottom `0`
  - Title: `1rem` / weight `600` / `var(--roya-blue-deep)`
  - Subtitle: `0.8125rem` / muted (`--p-text-muted-color`)
  - Alias: `.form-card` may remain on templates but must not redefine chrome once global

## Delta
- **Before**: Create/Edit/DNA use local `.form-card` Shopify look; most other pages keep default PrimeNG elevation/shadow.
- **After**: Every default `p-card` matches Create Project; local chrome rules removed; exceptions only for content padding (`proposal-view-card`) and non-`p-card` tiles (`.template-card`, `.option-card`).
