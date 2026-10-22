# Bug #063 — NG0200 circular dependency: TranslateService ↔ authInterceptor

## Status
**PENDING** — Fix applied 2026-10-21, awaiting user verification

## Reported
- **Date**: 2026-10-21
- **Severity**: high
- **Affected area**: roya-ai-dynamo-frontend / core/interceptors/auth.interceptor.ts

## Description
On app start the translation file fails to load:

```
@ngx-translate/http-loader: error loading translation for en:
RuntimeError: NG0200: Circular dependency detected for `_TranslateService`.
    at authInterceptor (auth.interceptor.ts:28:21)
```

Translations for `en` never load, so the UI shows raw translation keys.

## Expected Behavior
`/i18n/en.json` loads normally and the interceptor still shows translated subscription toasts.

## Steps to Reproduce
1. Run `roya-ai-dynamo-frontend` (`ng serve`).
2. Open the app and check the console. The NG0200 error is logged and the UI shows keys instead of translated text.

## Root Cause
`auth.interceptor.ts:28` calls `inject(TranslateService)` eagerly, at the top of the interceptor (added in change-080 for the subscription toast).

Dependency chain:
1. `TranslateService` is being constructed. Its constructor sets the fallback language (`fallbackLang: 'en'`), which starts a load through `TranslateHttpLoader`.
2. `TranslateHttpLoader` calls `HttpClient.get('/i18n/en.json')`.
3. `HttpClient` runs `authInterceptor`, which calls `inject(TranslateService)`.
4. `TranslateService` is still under construction, so Angular throws NG0200.

The admin frontend's interceptor does not inject `TranslateService`, so it is not affected.

## Fix Applied
`roya-ai-dynamo-frontend/src/app/core/interceptors/auth.interceptor.ts` (commit `36850c7`):
- Replaced the eager `inject(TranslateService)` with `inject(Injector)`.
- `TranslateService` is resolved lazily (`injector.get(TranslateService)`) only inside the error branch that shows the subscription toast, so the interceptor no longer needs `TranslateService` while `TranslateService` itself is loading `/i18n/en.json`.

_(Section restored 2026-10-21 from commit `36850c7` after it was accidentally overwritten by the bug-064 record update.)_

## Verification
- [x] Fix implemented in code (`tsc --noEmit -p tsconfig.app.json` clean)
- [ ] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- roya-ai-dynamo-frontend/src/app/core/interceptors/auth.interceptor.ts
