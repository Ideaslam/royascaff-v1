# Verification — Login register link (self-serve copy)

## Plan Consistency
- [x] Login and Register already in `actions/customer-portal/pages/dashboard.md`
- [x] No new endpoints or entities
- [x] Dashboard login note updated: self-serve “Create an account” → `/auth/register`

## Code Verification
- [x] Login footer still uses `routerLink="/auth/register"` (`login.ts`)
- [x] EN `auth.login.requestAccount` = Create an account
- [x] AR `auth.login.requestAccount` = إنشاء حساب
- [x] Register page and `/auth/register` route unchanged
- [x] Layering unchanged (i18n only)
- [x] No hardcoded external URLs
- [x] Auth unchanged (public login/register)
- [x] Acceptance criteria met
- [x] UI screenshots — skipped (no browser tools in this session)

## Result: PASS
