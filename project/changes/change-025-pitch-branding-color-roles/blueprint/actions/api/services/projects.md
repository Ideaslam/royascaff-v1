# Services — DNA branding color roles (pack after-state)

## SVC-PROJECTS — DNA branding inject / reconcile

- `resolveBrandingColors(project)` (or successor in `branding-colors.ts`):
  1. Resolve ordered `colors[]` (palette → client_logo derive → Roya defaults) — unchanged precedence
  2. Build `colorRoles` via `colorsToColorRoles(colors, source)`:
     - primary = colors[0]
     - secondary = colors[1] || darken(primary)
     - accent = colors[2] || lighten(primary) (or colors[1] if length===2 and no third)
     - surface = colors[3] || `#FFFFFF`
     - text = colors[4] || `#1A1A2E`
  3. When `source === 'roya_default'`, secondary/accent may remain Roya catalog values from the default list
  4. Return `{ colors, colorRoles, source }`
- `buildDnaSkeleton` / branding block: set `branding.colors`, `branding.colorRoles`, `branding.source`
- `reconcileDnaPassthrough`: force-merge skeleton branding so AI cannot drop `colors` / `colorRoles` / `source`

### Helper rules (`branding-colors.ts`)
- `darken` / `lighten`: simple HSL adjust (no new deps)
- Export `colorsToColorRoles` and update `colorsToThemeOverrides` to accept roles or colors[] (derive if needed)
- Unit-friendly pure functions preferred

## Delta

- **Add** `colorRoles` on DNA branding inject + reconcile
- **Add** derive helpers for missing secondary/accent/surface/text
