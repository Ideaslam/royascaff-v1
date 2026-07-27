# Pages — Safqa Web · Global Cards

> Shared PrimeNG `p-card` chrome (global CSS in `src/styles.css`). Reference look: Create Project form cards.

### Shared card chrome `PG-UI-CARD-01`
- Route: — (global; all pages using `p-card`)
- Status: done
- Components: PrimeNG `p-card` default appearance
- Notes:
  - Hairline border `1px solid var(--form-card-border)` (`#e3e5e8` light / `#3f3f46` dark)
  - Background `var(--app-bg)`; border-radius `12px`; **box-shadow: none**
  - Default spacing: `margin-bottom: 1.25rem` between stacked cards; zeroed inside gap parents (`.form-stack`, `.stats-grid`, `.charts-grid`, `.charts-row`, `.summary-grid`)
  - Body / caption / header padding-inline `1.25rem`; body padding-block `1.25rem`; caption padding-top `1.25rem`, padding-bottom `0`
  - Title: `1rem` / weight `600` / `var(--roya-blue-deep)` (dark: `--auth-text`)
  - Subtitle: `0.8125rem` / muted (`--p-text-muted-color`)
  - `styleClass="form-card"` may remain as a harmless alias; do not reintroduce local card chrome
  - Exceptions: `proposal-view-card` (zero content padding); non-`p-card` tiles (`.template-card`, `.option-card`)
