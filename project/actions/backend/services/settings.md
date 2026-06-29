## Module: Settings

### SVC-SET · SettingsService [internal, domain, Settings]
Reads and updates the single global system-settings document.

**Methods:**
- `getSettings()` — returns global settings singleton
- `updateSettings(dto: UpdateSystemSettingsDto, actorId?, ip?)` — updates global settings, audits SETTINGS_UPDATE

**Deps:** SettingsRepository · AuditLogService
**Side effects:** audit write on update
**Rules:** Operates on a single global settings document
