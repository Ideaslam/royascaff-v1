# Services Delta — Safqa API · Settings (change-20260805-181832)

### SVC-SETTINGS-01 · SettingsDataService [domain, internal, Settings]
- Status: done (delta)
- `getPublicSettings` / `patchSettings` unchanged in shape — new keys flow through schema-driven merge + `mapPatchToStorage` once listed in the schema and DTO allow-list.
- No new endpoints.

## Delta
- `lib/settings-schema.ts` `FALLBACK_SETTINGS_SCHEMA.fields` — insert after `company.name`:
  - `{ key: 'company.formalName', storageKey: 'companyFormalName', type: 'text', labelKey: 'settings.companyFormalName', default: '', order: 2 }`
  - `{ key: 'company.cr', storageKey: 'companyCr', type: 'text', labelKey: 'settings.companyCr', default: '', order: 3 }`
  - `{ key: 'company.representative', storageKey: 'companyRepresentative', type: 'text', labelKey: 'settings.companyRepresentative', default: '', order: 4 }`
  - `{ key: 'company.city', storageKey: 'companyCity', type: 'text', labelKey: 'settings.companyCity', default: '', order: 5 }`
  - Bump existing `company.email` / `phone` / `address` orders to 6 / 7 / 8.
- `scripts/config-seed-data.js` `settingsSchema.fields` — same four fields + order bumps (re-seed / upsert `config` key `settingsSchema` for live DB).
- `dtos/data/settings.dto.ts` — add the four storage keys to `SETTINGS_PATCH_KEYS` and optional `@IsString()` properties on `PatchSettingsDto`.
- `models/settings.model.ts` — optional: document the four keys in comments; index signature already allows them.
