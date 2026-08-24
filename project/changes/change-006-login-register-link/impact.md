# Impact Analysis — Login register link (self-serve copy)

## Code Reconnaissance

Feature state: **complete** — register page + API exist; login already links there with invite-style wording.

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | complete | User | none |
| Endpoint(s) | complete | `POST /api/merchant/v1/auth/register` | none |
| Page(s) | complete | `login.ts` footer `routerLink="/auth/register"`; `register.ts`; `auth.routes.ts` | copy says “Request an account here” |
| i18n | complete | `en.json` / `ar.json` `auth.login.requestAccount` | wording implies request, not register |

## Affected Modules
- Auth — login footer copy only

## Plan Docs to Update
- [ ] Optional one-line note in `actions/customer-portal/pages/dashboard.md` that login offers self-serve register (already lists `/auth/register`)

## Risk
complexity L, cross-module N, migration N

## Recommendation
- **Modify**: `en.json` and `ar.json` `auth.login.requestAccount` → Create an account / إنشاء حساب.
- **Do not**: new route, new page, backend, or admin login (same leftover copy there; out of scope unless asked).
