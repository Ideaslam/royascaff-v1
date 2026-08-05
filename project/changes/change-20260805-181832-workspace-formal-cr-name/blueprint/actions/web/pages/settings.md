# Pages Delta — Safqa Web · Settings (change-20260805-181832)

### Settings `PG-SETTINGS-01`
- Status: done (delta)
- Company tab is schema-driven — once FE fallback schema matches API, the four new text fields render automatically. No custom control needed.
- Models: extend `AppSettings` with optional/required string fields:
  - `companyFormalName`, `companyCr`, `companyRepresentative`, `companyCity`
- `StateService` settings$ defaults: empty strings for the four keys.
- `settings-schema.util.ts` `DEFAULT_SETTINGS_SCHEMA.fields`: same four fields + order bumps as API fallback (keep FE/BE fallbacks in sync).
- i18n (`en.json` / `ar.json`) under `settings`:

| key | EN | AR |
|-----|----|----|
| `companyFormalName` | Formal / CR company name | الاسم الرسمي / اسم السجل التجاري |
| `companyCr` | Commercial registration (CR) | رقم السجل التجاري |
| `companyRepresentative` | Legal representative | الممثل النظامي |
| `companyCity` | City | المدينة |

- Save/load: existing PATCH/GET path; no route or permission change (`settings.manage` for write).

## Delta
- FE fallback schema + AppSettings + state defaults + i18n labels
- UI appears via schema-driven Company tab (no bespoke markup)
