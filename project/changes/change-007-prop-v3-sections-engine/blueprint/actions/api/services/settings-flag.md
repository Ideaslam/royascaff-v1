# Services — Settings delta (Phase 3 feature flag)

## Delta

- **Modify** Settings schema / patch whitelist to accept `pipelineV3Enabled: boolean`
- **Modify** SettingsDataService / DTO — allow patch; default false when unset
- No new endpoint required if existing `PATCH /api/data/settings` already covers whitelisted keys

### SVC-SETTINGS-FLAG-01 · pipelineV3Enabled [infrastructure, Settings]
- Status: planned
- Methods: read via `getSettingsFromDb`; write via existing settings patch
- Deps: SettingsService, settings-schema / SETTINGS_PATCH_KEYS
- Side effects: none
- Rules: default `false`; only `settings.manage` can flip (existing settings permission)
