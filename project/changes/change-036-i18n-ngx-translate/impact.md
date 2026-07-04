# Impact Analysis — change-036-i18n-ngx-translate

## Feature State
`partial` — `@ngx-translate/core ^18.0.0` and `@ngx-translate/http-loader ^18.0.0` are already in `package.json` but are NOT configured in `app.config.ts`. No translation files exist. No `TranslateModule` is imported in any component. The user model has a `languagePreference` field (en/ar) and the profile page has a language selector, but switching it does not actually change the UI language.

## Plan-vs-Code Drift
None relevant to i18n. The profile page shows `languagePreference` field but saving it does not trigger an app language switch.

## Code Reconnaissance

### Infrastructure (missing — create)
- `public/i18n/en.json` — English translation strings (does not exist)
- `public/i18n/ar.json` — Arabic translation strings (does not exist)
- `src/app/core/services/i18n.service.ts` — Language + RTL orchestration service (does not exist)

### Configuration (modify)
- `src/app/app.config.ts` — Must add `provideTranslation` / `TranslateHttpLoader` providers

### Layouts (modify — add TranslateModule, language switcher)
- `src/app/layouts/app-shell/app-shell.ts`
- `src/app/layouts/auth-layout/auth-layout.ts`

### Pages — HTML templates (29 files, all modify — replace hardcoded strings with `| translate`)
- auth: login, register, forgot-password, reset-password
- onboarding
- projects: projects-list, project-detail
- dashboards: dashboard-viewer, dashboard-generating, shared-viewer
- data: csv-upload, data-sources, dataset-detail, files-list, google-sheets-connect/setup, mongodb-atlas-connect, salla-connect/setup, shopify-connect/setup, sql-server-connect, upload-wizard, zid-connect/setup
- notifications (inline template in .ts)
- settings: profile, workspace, admin-users, admin-workspaces
- subscriptions (inline template in .ts)
- workspace: accept-invite (inline template in .ts)

### Pages — TS files (all modify — add `TranslateModule` to `imports[]`)
All 33 `.page.ts` files listed above.

### Profile integration (modify)
- `src/app/pages/settings/profile/profile.page.ts` — `saveProfile()` must call `I18nService.setLanguage(lang)` after successful save

## Impact Classification

| Area | Classification | Action |
|------|---------------|--------|
| `public/i18n/en.json` | Create new | New file |
| `public/i18n/ar.json` | Create new | New file |
| `src/app/core/services/i18n.service.ts` | Create new | New service |
| `src/app/app.config.ts` | Modify | Add TranslateHttpLoader provider |
| `app-shell.ts` | Modify | TranslateModule + language toggle button |
| `auth-layout.ts` | Modify | TranslateModule |
| All 29 HTML templates | Modify | Replace strings with `| translate` |
| All 33 `.page.ts` imports | Modify | Add `TranslateModule` |
| `profile.page.ts` | Modify | Call `i18nService.setLanguage()` on save |

## Ripple Effects
- RTL layout: `document.documentElement.dir` switched to `rtl` for Arabic. Existing CSS uses `var()` tokens and PrimeNG which both support RTL. No additional CSS changes required.
- No backend changes needed; `languagePreference` is already persisted via the users API.

## Risks
- Low: translation strings must cover all user-visible text; any missed string falls back to the key name (visible but not breaking).
