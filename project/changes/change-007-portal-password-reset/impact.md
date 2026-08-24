# Impact Analysis — Portal password reset (link + 2FA/passkey)

## Code Reconnaissance

Feature state: **partial** — backend link-reset exists; portal UI missing; no 2FA/passkey step-up.

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | complete | `User.passwordResetTokenHash`, `User.passwordResetExpires` | none — reuse as-is |
| Service(s) | partial | `password-reset-service.ts` | 1h expiry; reset does not check TOTP/passkey; `validateResetToken` returns `{ valid, email? }` only |
| Endpoint(s) | partial | `password.controller.ts` (`/forgot`, `/reset`, `/validate-token`) | reset I/O is token + password only; no step-up fields |
| Email | partial | `email-service.ts` + `password-reset.template.md` | copy says **1 hour**; URL already `/auth/reset-password?token=` |
| Page(s) | none | `auth.routes.ts` has login/register/access/error only | no forgot/reset pages; login has no Forgot password link |
| FE service | partial | `auth.service.ts` `forgotPassword` / `resetPassword` / `validateResetToken` | types lack step-up; methods unused by any page |
| i18n | none | `en.json` / `ar.json` `auth.*` | no forgot/reset keys |

**Implemented today**
- `POST /api/merchant/v1/auth/password/forgot` — anti-enumeration; hashes token; Mailjet link; audit `auth.password.forgot.requested`
- `POST /password/reset` — token + password + confirm (min 8); clears token; audit success/failure
- `POST /password/validate-token` — `{ valid, email? }`
- Login already has TOTP / backup / passkey step-up after password (`login.ts`)

**Missing**
- Portal routes and pages; login link; EN/AR copy
- 15-minute TTL
- Step-up on reset when `user.twoFactor.enabled` or passkeys exist
- Email template expiry text

## Plan vs Code Drift

- Plan already lists Password Reset, SVC-A04, EP-AU19–21. Code matches that **link** design (not a code).
- Plan pages (`dashboard.md` Auth) list login/register only — no forgot/reset.
- Email + service say 1 hour; change request is 15 minutes.
- Local `APP_BASE_URL=http://localhost:3301` (API). Reset/invite/OAuth links should open the **portal** (`http://localhost:4301`). Prod profile: `APP_BASE_URL` is `dash.payupconnect.com`, portal CORS is `control.payupconnect.com`.
- Admin `auth.service.ts` has unused reset client methods — **out of scope**.
- `/2fa/verify` and `/passkey/login/verify` **issue a session JWT**. `generateChallengeToken` has `purpose` but those verifiers do **not** check it. Reset must **not** call them.

## Affected Modules
- Auth — complete reset service/endpoints; add portal forgot/reset pages; require 2FA or passkey when active

## Ripple Map

| Affected item | Type | Relationship | Breaks if changed? | Action needed |
|---------------|------|--------------|:------------------:|---------------|
| `PasswordResetService` | callee | owns token + email | yes | complete: 15m TTL; validate returns `requiresStepUp` + `availableMethods`; reset verifies TOTP/backup/passkey then sets password |
| `password.controller.ts` EP-AU19–21 | endpoint | public API | yes | modify I/O; keep routes + `MERCHANT_SENSITIVE` + existing audit actions |
| `TotpService` | callee | verify TOTP/backup | no | reuse from reset (do not call `/2fa/verify`) |
| `PasskeyService` | callee | WebAuthn options + verify | yes if store stays private | complete: hold WebAuthn challenge store here so reset can verify without issuing JWT |
| `passkey.controller.ts` EP-AU15/16 | endpoint | shares challenge store | yes if store moves carelessly | modify: use shared store on `PasskeyService`; login verify still issues JWT; **do not** use from reset page |
| `2fa.controller.ts` EP-AU10 | endpoint | login step-up | no if unused | leave — reset must not call it (would log the user in) |
| `EmailService.sendPasswordResetEmail` | callee | Mailjet | no | leave method; update template 1 hour → 15 minutes |
| `password-reset.template.md` | template | email body | no | modify expiry copy |
| `config.appBaseUrl` | config | reset URL host | yes if wrong host | confirm portal origin so the link opens `/auth/reset-password` |
| `AuthService` (FE) | caller | unused methods | no | modify types; add passkey-options-for-reset using existing `passkeyLoginOptions` **or** token-bound options via reset service |
| `login.ts` | page | entry | no | modify: Forgot password → `/auth/forgot-password` |
| `auth.routes.ts` | routes | missing pages | no | add forgot + reset |
| New forgot/reset pages | page | greenfield | — | create; reuse `auth-split` + login 2FA/passkey UI |
| `en.json` / `ar.json` | i18n | missing keys | no | add `auth.forgot` / `auth.reset` |
| Admin reset client methods | caller | dead code | no | leave |
| Login 2FA/passkey | sibling | shared UI/services | yes if we change `/2fa/verify` purpose carelessly | leave login path unchanged |

- Shared DTOs: reset/validate request/response; `availableMethods: { totp, passkey }`
- Auth: public + rate-limited; no JWT until user logs in after reset
- Async jobs: none
- Data migration: no

## Reuse Opportunities

- Token hash + expiry fields, Mailjet helper, audit action names, `MERCHANT_SENSITIVE`
- Login TOTP/backup/passkey UI and `@simplewebauthn/browser`
- `TotpService.verifyToken` / `verifyBackupCode`
- `PasskeyService.generateAuthenticationOptions` / `verifyAuthenticationResponse`
- Auth-split CSS (`auth.css`)

**Do not reuse** `POST /2fa/verify` or `POST /passkey/login/verify` — they set `localStorage.token`.

**Passkey during reset (no new route):** move the in-memory WebAuthn challenge map from `passkey.controller.ts` into `PasskeyService`. Reset page: `validate-token` → if passkey, call existing `POST /passkey/login/options` with a reset-bound identifier (valid reset token or email from a valid token) → WebAuthn → send `{ challengeKey, response }` on `POST /password/reset`. Service checks the passkey `userId` matches the token owner.

## Plan Docs to Update

- [x] `project/plan/modules.md` — Password Reset: 15m link + 2FA/passkey step-up
- [ ] `project/plan/data-model.md` — no field changes
- [x] `project/actions/backend/services/auth.md` — SVC-A04 methods/I/O
- [x] `project/actions/backend/endpoints/auth.md` — EP-AU19–21 notes + reset/validate I/O
- [x] `project/actions/customer-portal/pages/dashboard.md` — login link + forgot/reset pages
- [x] `project/description.md` — Security: reset requires 2FA/passkey when enabled
- [x] `project/rules.md` — Auth: reset link + step-up (no JWT on reset)
- [ ] `project/profile.md` — only if `APP_BASE_URL` is corrected to the portal origin

## Risk

complexity **M**, cross-module **N** (Auth + Email template only), migration **N**

Risks:
- Reset email host (`APP_BASE_URL`) currently API `:3301` — link will 404 unless pointed at portal `:4301`
- Reusing login 2FA/passkey **verify** endpoints would log the attacker in
- Backup code used during reset must be consumed (same as login)
- New forgot request replaces token (already true)

## Recommendation

- **Create**: `/auth/forgot-password`, `/auth/reset-password` pages + routes; login Forgot password link; EN/AR keys
- **Complete**: `PasswordResetService` + EP-AU20/21 I/O (15m, step-up, no session JWT); email template expiry text; `PasskeyService` challenge store so reset can verify passkeys
- **Modify**: `password.controller.ts`; FE `AuthService` types; `login.ts`; plan docs listed above
- **Leave**: schema fields; `/2fa/verify`; `/passkey/login/verify` behavior; admin panel; session invalidation
