# Change Request

## Metadata
- **date**: 2026-08-05
- **change-type**: modify-feature
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: medium
- **request-id**: REQ-SETTINGS-PALETTE
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Data (Settings), Web Settings page, shared `app-color-palette`
- Feature(s): Workspace Theme & Branding → multi-color palette + `colorRoles`
- Endpoint(s): EP-SETTINGS PATCH/GET (extend payload; no new route)
- Page(s)/View(s): web: Settings → Theme & Branding tab
- Service(s): Settings data service / DTO / schema; FE settings page + AppSettings model

## Description

**Problem:** Workspace Settings → Theme & Branding exposes a single “Default color” swatch (`defaultColor`). Projects already use shared `app-color-palette` (max 5) that maps to DNA `colorRoles` (`primary` / `secondary` / `accent` / `surface` / `text`). Workspace branding cannot express a full palette, and the backend only accepts a single hex.

**Outcome:** Replace the single color control with `app-color-palette` (hard max **5** colors). Persist workspace branding as ordered colors + semantic `colorRoles`, e.g.:

```json
"colorRoles": {
  "primary": "#6f1926",
  "secondary": "#b37d3f",
  "accent": "#868849",
  "surface": "#ffffff",
  "text": "#1a1a2e"
}
```

**Who:** Workspace admins with `settings.manage`.

**Assumptions (confirm):**
1. FE uses existing `app-color-palette`; keep/enforce max 5 (component already slices to 5).
2. Ordered palette indices map like DNA: `[0]=primary`, `[1]=secondary`, `[2]=accent`, `[3]=surface`, `[4]=text`; missing surface/text use defaults (`#ffffff` / `#1a1a2e`); missing secondary/accent derive from primary (same as `colorsToColorRoles`).
3. Persist both `colorPalette: string[]` (1–5) and derived `colorRoles` on `settings`; keep `defaultColor` as alias of `colorRoles.primary` for backward compat (read + write).
4. Existing workspaces with only `defaultColor` → seed palette as `[defaultColor]` and derive roles on read/save.
5. Downstream (optional in this pack unless confirmed): when a project has no `colorPalette`, branding resolution falls back to workspace `colorRoles` / `colorPalette` before Roya defaults.
6. Default font control stays as-is; no permission / auth changes.

**Out of scope:** Changing project create/edit palette UX; redesigning Theme tab layout beyond swapping the color control; new endpoints; polish-only spacing.

## Acceptance Criteria
1. Theme & Branding tab shows `app-color-palette` instead of a single default-color bar; user can add/edit/remove/reorder up to **5** colors (cannot add a 6th).
2. Save settings persists `colorPalette` (1–5 hex) and `colorRoles` with keys `primary`, `secondary`, `accent`, `surface`, `text` on workspace settings.
3. PATCH settings accepts `colorPalette` and/or `colorRoles`; rejects >5 colors with 400; derives missing roles consistently with project DNA rules.
4. GET settings returns `colorPalette`, `colorRoles`, and `defaultColor` (= primary) so FE can hydrate the palette.
5. Legacy settings with only `defaultColor` still load; palette initializes from that color; save upgrades to palette + roles.
6. Default font + Save / Reset actions remain functional; `settings.manage` still gates writes.
7. (If confirmed) Project branding with empty palette uses workspace `colorRoles` before Roya catalog defaults.

## Notes
- Screenshot: Theme & Branding single teal bar → replace with palette.
- Reuse: `ColorPaletteComponent`, `normalizeColorPalette` / `colorsToColorRoles` from API branding-colors.
- Schema-driven settings field type `color` may need a dedicated theme-panel or new field type `colorPalette` so the shared component is not jammed into `SettingsFieldComponent` awkwardly.
