# Services — Safqa API · Settings

### SVC-SETTINGS-01 · SettingsDataService [domain, internal, Settings]
- Status: done
- Methods: get/patch workspace settings (schema-validated, secrets encrypted); upload/delete workspace logo
- Theme branding:
  - GET: `hydrateThemeBranding` → coherent `colorPalette` + `colorRoles` + `defaultColor` (= primary); legacy `defaultColor`-only rows upgrade on read
  - PATCH: `applyThemeBrandingPatch` — prefer `colorPalette` (1–5) → derive roles; or `colorRoles`; or legacy `defaultColor`; max 5 / invalid hex → 400
- Deps: SettingsRepository, ConfigRepository, EncryptionService, S3Service; `lib/settings-branding.ts` + branding-colors helpers
- Side effects: file (R2 logo upload/delete under `workspaces/{workspaceId}/`)
- Rules: logo JPEG/PNG/WebP/SVG max 2MB; `logoUrl` not settable via patch whitelist; `colorPalette`/`colorRoles` always allowed via `EXTRA_PATCH_KEYS`
- Company schema fields (Company group order): `companyName` (brand), `companyFormalName`, `companyCr`, `companyRepresentative`, `companyCity`, then `email` / `phone` / `address` — present in `FALLBACK_SETTINGS_SCHEMA` + seeded `config/settingsSchema`; all four legal keys are on `PatchSettingsDto` / `SETTINGS_PATCH_KEYS`
- `patchSettings(workspaceId, patch)` validates `select`-type schema fields dynamically via `validateSelectFieldValues(patch, schema)` (`lib/settings-schema.ts`) right after loading the schema, before persisting — checks the patched value against that field's **currently loaded** `options` (DB `config/settingsSchema` when seeded, else `FALLBACK_SETTINGS_SCHEMA`), 400s with the live allowed-values list otherwise. `PatchSettingsDto` no longer hardcodes `@IsIn([...])` for `defaultFont`/`currency` (keeps `@IsString()` only) — adding/removing a `select` option in the schema/seed (e.g. a new font) needs no DTO change.

### SVC-SETTINGS-02 · SettingsService [infrastructure, internal, Settings]
- Status: done
- Methods: load decrypted settings for AI/runtime
- Deps: SettingsRepository, EncryptionService
- Side effects: none

### SVC-SETTINGS-03 · pipelineV3Enabled flag [infrastructure, Settings]
- Status: done
- Methods: patch/read `pipelineV3Enabled` via settings whitelist + schema fallback; `isPipelineV3Enabled(workspaceId)`
- Deps: SettingsDataService / getSettingsFromDb
- Side effects: none
- Rules: default **true** (cutover); seed `settingsSchema` includes field; `settings.manage` to flip; false re-enables legacy creative create; gates Projects create-from-project + regen/translate
