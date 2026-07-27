# Services / assets — pitch-landscape branding roles (pack after-state)

## TemplateRender / layout (contract unchanged)
- `layout.hbs` already injects `--color-primary|secondary|accent|surface|text` from `theme.*`
- No new CSS vars required unless useful: optional `--color-primary-soft` via `color-mix(in srgb, var(--color-primary) 12%, white)` in theme.css

## `templates/pitch-landscape/v1/theme.css` — role assignment

| Element | Before | After |
|---------|--------|-------|
| h1, h2, brand-mark | `--color-secondary` | `--color-primary` |
| h3, page-num | `--color-accent` / secondary | `--color-accent` (keep); muted labels → text/muted |
| accent-bar gradient | primary → secondary | primary → accent |
| brand-dot, step `.n`, timeline border | primary | primary (keep) |
| card / step / persona bg | hard `#f4f9fc` | `color-mix(… primary 8–12%, white)` or `var(--color-surface)` + soft primary border |
| card border-inline | primary | primary (keep) |
| stat bg | hard sky gradient | soft primary tint → white |
| stat `.value`, tag text, swot strong, totals | secondary | **primary** |
| table th | secondary + white text | **primary** + white text |
| table borders / even rows | hard blue-gray | neutral `#e8e8e8` / surface tint |
| `.cover` background | hard navy gradient | primary-led dark gradient (`color-mix` with black / secondary) |
| `.cover` accent-bar | hard `#47b5e6` | primary → accent / white |
| `.footer-page` | hard navy | primary → darker primary/black |
| body page chrome gaps | sky `#e8eef3` | soft neutral or light primary tint |

## `partials/insights_divider.hbs`
- Remove inline `#114261` / `#47b5e6`; use classes from theme.css (e.g. `.page--brand-band`) driven by CSS vars

## Status
- pitch-landscape v1 theme rearrange: **planned** → **done** after implement

## Delta

- **Modify** theme.css role usage + replace hard-coded Roya blue fills/gradients
- **Modify** insights_divider.hbs to CSS-var classes
