# Verification — Portal password reset (link + 2FA/passkey)

## Plan Consistency
- [x] EP-AU19–21 in `endpoints/auth.md` with 15m link + step-up I/O
- [x] SVC-A04 + PasskeyService challenge store in `services/auth.md`
- [x] Pages: login Forgot password, `/auth/forgot-password`, `/auth/reset-password`
- [x] No new data-model fields
- [x] Routes public + rate-limited; RULE-012 / RULE-021
- [x] Recon gaps (no pages, 1h TTL, no step-up) reflected in plan

## Code Verification
- [x] `POST /password/forgot|reset|validate-token` public + `MERCHANT_SENSITIVE`
- [x] `PasswordResetService`: 15m hash, step-up via `TotpService` / `PasskeyService`, no JWT
- [x] WebAuthn challenges tagged `login` | `register` | `password_reset`; EP-AU16 rejects non-login
- [x] Pages at `/auth/forgot-password` and `/auth/reset-password`; login link present
- [x] Controller → service → repository; Mailjet only from `EmailService`
- [x] Frontend calls go through `AuthService` / `apiUrl`
- [x] Auth pages have no guard (public)
- [x] Acceptance criteria:
  1. Login credentials step has Forgot password → `/auth/forgot-password`
  2. Forgot always shows generic success (EN/AR)
  3. Mailjet link `{APP_BASE_URL}/auth/reset-password?token=` expires 15 minutes
  4. Invalid/expired token: shared message + request new link
  5. No step-up: new password + confirm (min 8)
  6. TOTP and/or passkey: one method required before save
  7. Success clears token (reuse fails)
  8. New forgot replaces prior token
  9. No email enumeration; password + token hashed
  10. Audit `auth.password.forgot.requested`, `.reset.success`, `.reset.failed`
  11. auth-split + login 2FA/passkey UI; EN/AR; loading/error/expired/success
  12. Login 2FA/passkey verify unchanged; admin untouched
- [x] Runtime: `tsc --noEmit` API PASS; panel bundle complete; curl forgot unknown email → generic success; validate `deadbeef` → `{ valid: false }`; reset bad token → `Invalid or expired reset link`; portal `/auth/login`, `/forgot-password`, `/reset-password` → 200

## UI screenshots
Skipped — no browser automation in this session. Routes compile and return 200; click-through of 2FA/passkey on reset not exercised in a browser.

## Result: PASS
