# Services — Safqa API · Settings

### SVC-SETTINGS-01 · SettingsDataService [domain, internal, Settings]
- Status: done
- Methods: get/patch workspace settings (schema-validated, secrets encrypted); upload/delete workspace logo
- Deps: SettingsRepository, ConfigRepository, EncryptionService, S3Service
- Side effects: file (R2 logo upload/delete under `workspaces/{workspaceId}/`)
- Rules: logo JPEG/PNG/WebP/SVG max 2MB; `logoUrl` not settable via patch whitelist

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
