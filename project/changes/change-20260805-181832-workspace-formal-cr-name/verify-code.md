# Verification — Workspace legal / CR party identity

## Plan Consistency
- [x] Data model delta lists 4 settings fields + 4 tokens
- [x] Settings / contracts / FE page slices drafted in pack
- [x] No new endpoints (PATCH allow-list only)
- [x] Recon hardcodes addressed in default template

## Code Verification
- [x] `FALLBACK_SETTINGS_SCHEMA` + `config-seed-data.js` include formal name / CR / representative / city (orders 2–5; email/phone/address 6–8)
- [x] `PatchSettingsDto` + `SETTINGS_PATCH_KEYS` allow the four keys
- [x] `renderContractHtml` exposes `workspace_formal_name` (fallback → companyName), `workspace_cr`, `workspace_representative`, `workspace_city`
- [x] Create-from-proposal passes the four fields from `getPublicSettings`
- [x] `roya-default.html` party-1 + signature use tokens; no hardcoded وهج / CR# / representative / الرياض
- [x] FE fallback schema, `AppSettings`, state defaults, i18n en/ar, token picker updated
- [x] Live Mongo re-seeded: `config/settingsSchema` + `contract_templates/roya-default`
- [x] Nest `start:dev` reloaded successfully after changes

## Acceptance Criteria
1. [x] Settings Company fields persist via existing PATCH/GET (schema-driven + DTO allow-list)
2. [x] Contract tokens resolved with documented fallbacks
3. [x] Default Roya template uses tokens (hardcodes removed)
4. [x] Token picker lists the four new workspace tokens
5. [x] i18n labels en + ar present
6. [x] Empty fields fall back safely; seed/fallback schema include fields

## Result: PASS
