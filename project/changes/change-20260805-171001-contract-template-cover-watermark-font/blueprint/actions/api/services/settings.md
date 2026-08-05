# Services Delta — Safqa API · Settings (change-20260805-171001)

### SVC-SETTINGS-01 · SettingsDataService [domain, internal, Settings]
- Status: done (delta)
- `getPublicSettings()` unchanged — already returns `defaultFont` + `colorRoles`/`colorPalette` (used as-is by the Contracts delta in this pack).
- **Post-verify amendment — dynamic select-field validation.** `patchSettings(workspaceId, patch)` now calls a new `validateSelectFieldValues(patch, schema)` (in `settings-schema.ts`) right after loading the schema, before persisting. Root cause fixed: `PatchSettingsDto.defaultFont`/`currency` had hardcoded `@IsIn([...])` decorators that were never updated when `Amiri` was added, so saving it 400'd even though the schema allowed it — two un-synced sources of truth for the same allowed-values list.
- New `validateSelectFieldValues` is generic/schema-driven: for every `select`-type field with a static `options` list, checks the patched value is one of the field's currently-loaded options (DB `config/settingsSchema` when seeded, else `FALLBACK_SETTINGS_SCHEMA`) and throws a `400` listing the live allowed values. Adding/removing an option in the schema/seed going forward needs no DTO change.
- `PatchSettingsDto` (`settings.dto.ts`): removed the hardcoded `@IsIn(['Cairo','Tajawal'])`/`@IsIn(['SAR','USD'])` decorators from `defaultFont`/`currency` (both keep `@IsString()` for basic type-shape validation only); the DTO no longer duplicates a list that can drift from the schema.

## Delta
- `settings-schema.ts` (`FALLBACK_SETTINGS_SCHEMA`) and `scripts/config-seed-data.js` (`settingsSchema.fields`): `theme.defaultFont` select gains a third option `{ value: 'Amiri', label: 'Amiri' }` alongside `Cairo`/`Tajawal`. No new field, no endpoint change, no FE code change (the Settings page's field list is schema-driven and already renders any `type: 'select'` field generically).
- Post-verify amendment: new exported `validateSelectFieldValues(patch, schema)` in `settings-schema.ts`, called from `SettingsDataService.patchSettings`; `PatchSettingsDto.defaultFont`/`currency` lost their hardcoded `@IsIn` validators in favor of this schema-driven check.
