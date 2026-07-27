# Pages — Safqa Web · Settings

### Settings `PG-SETTINGS-01`
- Route: `/settings`
- Status: done
- Components: tabbed schema-driven form (company/integration/financial/theme/system); Company tab logo panel (avatar + upload + remove)
- Service: AppDataService → EP-SETTINGS-01/02/03/04, EP-CONFIG-01
- Guard: layout; settings.manage for write / logo mutate
- Notes: logo upload/remove is immediate (not via Save settings); `AppSettings.logoUrl?`; i18n en/ar
