# Change Request

## Metadata
- **date**: 2026-08-24
- **change-type**: modify-feature
- **target-app**: customer-portal
- **affected-repos**: backend+frontend
- **priority**: high

## Scope
- Module(s): Auth
- Feature(s): Password Reset
- Endpoint(s): EP-AU19 `POST /password/forgot`, EP-AU20 `POST /password/reset`, EP-AU21 `POST /password/validate-token` (same routes; I/O and step-up logic change)
- Page(s)/View(s): customer-portal: Login `/auth/login`; Forgot password `/auth/forgot-password`; Reset password `/auth/reset-password`
- Service(s): `PasswordResetService` (SVC-A04), `EmailService.sendPasswordResetEmail`, `TotpService`, `PasskeyService`

## Description

Merchant users who forget their Customer Portal password cannot recover the account in the UI. The API already emails a 1-hour reset **link** and exposes forgot/reset/validate-token, but the portal has no forgot/reset pages, no login link, and reset does not require 2FA or passkey. A stolen reset email could change the password on an account that has those methods enabled.

**Desired behavior**
1. Login credentials step shows **Forgot password** → `/auth/forgot-password`.
2. User submits email. `POST /password/forgot` always returns the same generic success (no account enumeration). If the user exists, Mailjet sends a reset **link** with a high-entropy token. Token is stored hashed on `User.passwordResetTokenHash` with `passwordResetExpires` = **15 minutes**. A new request replaces any previous token.
3. User opens `/auth/reset-password?token=…`. The page validates the token via `POST /password/validate-token`. Invalid or expired token shows the same “Invalid or expired reset link” state and a path to request a new link.
4. If **neither** TOTP 2FA nor a passkey is enabled: show new password + confirm.
5. If **either or both** are enabled: user must pass **one** method (TOTP, backup code, or passkey — same choice pattern as login) **before** the new password can be saved.
6. `POST /password/reset` accepts token + new password + confirm, plus the 2FA/passkey proof when required. Success clears the token (single-use) and the page sends the user to login. Other sessions are **not** invalidated.

**Who is affected:** Customer Portal merchant users (`payup-frontend-customer-control`) only.

**Permissions:** Public, rate-limited (`MERCHANT_SENSITIVE`) on the three `/password/*` routes. Reset applies only to the User that owns the valid token. No admin reset-for-others.

**Data:** No new collections, fields, indexes, or enums. Reuse existing User reset fields. No new providers, queues, or AI.

**Out of scope:** Admin Panel reset; changing how 2FA/passkeys are set up; Google-only accounts with no password; invalidating other sessions after reset.

## Acceptance Criteria
1. Login credentials step shows a **Forgot password** link that navigates to `/auth/forgot-password`.
2. Forgot-password page submits email and always shows the same generic success copy (EN + AR), whether or not the account exists.
3. If the account exists, Mailjet sends a reset email whose link is `{appBaseUrl}/auth/reset-password?token={token}` and the token expires in 15 minutes.
4. Opening a valid reset link shows the reset page. Invalid or expired token shows “Invalid or expired reset link” (same message for both) and a way to request a new link.
5. If the user has neither TOTP 2FA nor a passkey, they can set a new password (min 8, must match confirm) and succeed.
6. If TOTP 2FA and/or a passkey is enabled, the reset page requires one successful method (TOTP, backup code, or passkey) before the password change is accepted. A stolen email link alone cannot reset those accounts.
7. A successful reset clears the stored token; reusing the same link fails with the invalid/expired message.
8. A new forgot-password request replaces the previous token.
9. Forgot/reset/validate-token remain public and rate-limited; responses do not reveal whether the email exists; the new password is hashed; the token is stored hashed only.
10. Existing audit events still fire: `auth.password.forgot.requested`, `auth.password.reset.success`, `auth.password.reset.failed`.
11. Pages use the existing auth-split layout, PrimeNG, and login 2FA/passkey UI; EN + AR strings; loading, error, expired-link, and success states.
12. Existing login with password + 2FA/passkey is unchanged. Admin Panel is unchanged.

## Notes
- Visual approach: match login/register (`auth-split`, promo panel). Reuse login TOTP/passkey step UI. No Figma.
- Mailjet send stays inline. If send fails after the token is stored, still return generic success.
- High-entropy link token — no extra code-guess rate limiter.
- Passkey/WebAuthn failure: show error; retry or switch to TOTP if available.
- No undo after a successful reset.
