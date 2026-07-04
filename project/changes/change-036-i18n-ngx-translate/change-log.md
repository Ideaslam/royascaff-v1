# Change Log — change-036-i18n-ngx-translate

## Summary
Implemented full i18n localization using `@ngx-translate/core` v18 for English and Arabic languages across the entire frontend.

## Date
2026-07-05

## Status
COMPLETED

---

## Changes Made

### Infrastructure (New Files)
- **`public/i18n/en.json`** — 300+ English translation keys organized hierarchically by module (AUTH, NAV, PROJECTS, DASHBOARDS, DATA, SETTINGS, NOTIFICATIONS, SUBSCRIPTIONS, WORKSPACE, ONBOARDING, COMMON)
- **`public/i18n/ar.json`** — Complete Arabic translations with proper RTL-appropriate phrasing
- **`src/app/core/services/i18n.service.ts`** — Singleton service that:
  - Reacts to `AuthService.currentUser()` signal to apply stored language preference
  - Sets `document.documentElement.dir` and `lang` for RTL support
  - Exposes `setLanguage()`, `currentLang()`, and `toggleLanguage()`

### Configuration
- **`src/app/app.config.ts`** — Replaced `TranslateModule.forRoot()` with v18 standalone providers: `provideTranslateService({fallbackLang:'en'})` + `provideTranslateHttpLoader({prefix:'/i18n/',suffix:'.json'})`
- **`src/app/app.ts`** — Eagerly injects `I18nService` to ensure language is applied before any page renders

### Layouts
- **`app-shell.ts`** — Added language toggle button in topbar, nav item labels use `| translate` pipe, injected `I18nService.toggleLanguage()` on button click
- **`auth-layout.ts`** — Brand tagline and footer translated

### Pages — 29 HTML templates
All templates updated to use `'KEY' | translate` for all user-facing strings:
- Auth: login, register, forgot-password, reset-password
- Onboarding
- Projects: projects-list, project-detail
- Dashboards: dashboard-viewer, dashboard-generating, shared-viewer
- Data: data-sources, csv-upload, files-list, upload-wizard, google-sheets-connect, shopify-connect, dataset-detail (breadcrumbs + titles)
- Settings: profile, workspace-settings, admin-users, admin-workspaces
- Notifications (inline template in .ts)
- Subscriptions (inline template in .ts)
- Workspace: accept-invite (inline template in .ts)
- Admin settings (inline template in .ts)

### Pages — 35 TypeScript files
Added `import { TranslatePipe } from '@ngx-translate/core'` and `TranslatePipe` to `imports[]` array in all page components.

### Profile Integration
- **`profile.page.ts`** — After saving profile, calls `i18nService.setLanguage(lang)` to apply immediately

---

## API Notes (ngx-translate v18)
| Old API (v15-17) | New API (v18) |
|---|---|
| `TranslateModule.forRoot()` | `provideTranslateService()` |
| `TranslateModule` in imports | `TranslatePipe` in imports |
| `TranslateService.setDefaultLang()` | `provideTranslateService({fallbackLang})` |
| `TranslateService.currentLang` (string) | `TranslateService.currentLang()` (Signal) |
| `new TranslateHttpLoader(http, prefix, suffix)` | `provideTranslateHttpLoader({prefix, suffix})` |
