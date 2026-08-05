# Services — Settings (pack delta)

### SVC-SETTINGS-01 · SettingsDataService
- Status: planned
- Methods (delta):
  - `getPublicSettings` — after merge/strip secrets, call `hydrateThemeBranding(settings)` so response always exposes coherent theme fields when any of palette / roles / defaultColor exist
  - `patchSettings` — accept `colorPalette` and/or `colorRoles` (and still `defaultColor`); normalize via `applyThemeBrandingPatch` before storage; reject invalid hex / >5 with statusCode 400
- Deps: existing + branding-colors helpers (`normalizeColorPalette`, `colorsToColorRoles`)
- Rules:
  - Prefer patch `colorPalette` when present → derive `colorRoles` + set `defaultColor = primary`
  - If only `colorRoles` patched with `primary` → rebuild ordered `colorPalette` from roles (omit nullish roles) + sync `defaultColor`
  - If only `defaultColor` patched (legacy FE/clients) → `colorPalette = [defaultColor]` + derive roles
  - Empty palette array clears palette/roles? **No** — treat empty as “unset palette”; keep font; if clearing, allow `colorPalette: null` or omit; recommend FE always sends 1–5 when user has swatches
  - `logoUrl` still not patchable
  - Add `colorPalette` / `colorRoles` to DTO whitelist + `EXTRA_PATCH_KEYS` (or schema) so seeded stale schema does not drop them
  - Fallback schema: remove sole reliance on `theme.defaultColor` for UI (FE special panel); may keep storageKey for compat defaults

### Theme hydrate / apply helpers (new, colocated in settings service or small `lib/settings-branding.ts`)
- Status: planned
- `hydrateThemeBranding(settings)`:
  1. If valid `colorPalette` → derive roles; sync `defaultColor`
  2. Else if `colorRoles.primary` → rebuild palette from role order; sync `defaultColor`
  3. Else if `defaultColor` → palette `[defaultColor]` + derive roles
  4. Else leave unset (schema defaultColor may still fill from mergeDefaults — OK)
- `applyThemeBrandingPatch(existing, patch)` → merged theme fields for save

## Delta

- **Add** palette/roles persist + hydrate on GET
- **Modify** patch whitelist / EXTRA_PATCH_KEYS
- **Sync** `defaultColor` ↔ primary
