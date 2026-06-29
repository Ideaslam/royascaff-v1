## Module: Settings

`@Controller('settings')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-SET-01 | GET | /api/v1/settings | JWT+admin | none | 200 `SystemSettingsDto` | SVC-SET.getSettings() | |
| EP-SET-02 | PATCH | /api/v1/settings | JWT+admin | `UpdateSystemSettingsDto` { registrationEnabled?, maxFileSizeMb?, defaultMaxDashboards?, supportedLanguages?[] } | 200 `SystemSettingsDto` | SVC-SET.updateSettings() | |
