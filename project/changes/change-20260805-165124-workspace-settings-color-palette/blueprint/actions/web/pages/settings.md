# Pages — Safqa Web · Settings (pack delta)

### Settings `PG-SETTINGS-01`
- Route: `/settings`
- Status: planned
- Components (delta):
  - **Theme tab palette panel** (special control, like Company logo — not schema `color` input):
    - Label: brand / default colors (i18n)
    - `<app-color-palette [(colors)]="colorPalette" [disabled]="isReadOnly" />`
    - Max **5** colors (component already enforces)
  - Schema-driven fields for Theme: **hide** `theme.defaultColor` (filter out when rendering tab fields); keep `defaultFont`
  - Save settings includes `colorPalette` in PATCH payload; BE derives `colorRoles` + `defaultColor`
- Service: AppDataService → EP-SETTINGS-01/02 (unchanged routes)
- Guard: layout; `settings.manage` for write
- Models:
  - `AppSettings.colorPalette?: string[] | null`
  - `AppSettings.colorRoles?: { primary; secondary; accent; surface; text } | null`
  - keep `defaultColor` for compat
- State defaults: `colorPalette: []` or seed from `defaultColor` on load
- Hydrate on settings$ load:
  1. use `colorPalette` if length ≥ 1
  2. else build from `colorRoles` order
  3. else `[defaultColor]` if set
- i18n en/ar: e.g. `settings.colorPalette` / `settings.brandColors` (replace “Default color” label in Theme)

## Delta

- **Replace** single default-color control with `app-color-palette`
- **Extend** AppSettings + state + save payload
- **Filter** schema field `defaultColor` from Theme tab UI
