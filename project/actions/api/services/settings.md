# Services — Safqa API · Settings

### SVC-SETTINGS-01 · SettingsDataService [domain, internal, Settings]
- Status: done
- Methods: get/patch workspace settings (schema-validated, secrets encrypted)
- Deps: SettingsRepository, ConfigRepository, EncryptionService
- Side effects: none

### SVC-SETTINGS-02 · SettingsService [infrastructure, internal, Settings]
- Status: done
- Methods: load decrypted settings for AI/runtime
- Deps: SettingsRepository, EncryptionService
- Side effects: none
