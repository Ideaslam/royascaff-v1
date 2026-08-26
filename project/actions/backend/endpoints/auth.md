# Endpoints — Auth

Prefix: `/api/merchant/v1/auth` · Auth default: **authenticated** (Bearer JWT) unless noted public.

## Core Auth

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-AU01 | POST | /register | public; rate limit | email, password, name | 201 `{ verificationToken, email, message }` | `AuthService.register` | Sends registration OTP; does not issue JWT until email is verified |
| EP-AU29 | POST | /verify-email | public; rate limit | `{ verificationToken, code }` | 200 `{ user, token }` | `AuthService.verifyEmail` | Marks `emailVerified`; issues JWT |
| EP-AU30 | POST | /resend-verification | public; rate limit | `{ verificationToken }` | 200 `{ verificationToken, message }` | `AuthService.resendVerificationOTP` | Rotates challenge token; resends OTP |
| EP-AU02 | POST | /login | public; rate limit | email, password | 200 JWT or 2FA challenge | `AuthService.login` | — |
| EP-AU03 | GET | /profile/summary | authenticated | — | 200 | `AuthService.getProfileSummary` | — |
| EP-AU04 | GET | /profile | authenticated | — | 200 | `AuthService.getProfile` | — |
| EP-AU05 | PUT | /profile | authenticated | name, company, settings | 200 | `AuthService.updateProfile` | — |
| EP-AU06 | POST | /refresh | authenticated | — | 200 JWT | `AuthService.refreshToken` | — |

## 2FA (`/2fa`)

| ID | Method | Route | Auth | Service | Notes |
|----|--------|-------|------|---------|-------|
| EP-AU07 | POST | /2fa/setup | authenticated | `TotpService` | — |
| EP-AU08 | POST | /2fa/enable | authenticated | `TotpService` | — |
| EP-AU09 | POST | /2fa/disable | authenticated | `UserRepository` | requires password |
| EP-AU10 | POST | /2fa/verify | public; rate limit | `TotpService`, `AuthService` | challenge token |
| EP-AU11 | POST | /2fa/regenerate-backup-codes | authenticated | `TotpService` | — |
| EP-AU12 | GET | /2fa/status | authenticated | `UserRepository` | — |

## Passkeys (`/passkey`)

| ID | Method | Route | Auth | Service | Notes |
|----|--------|-------|------|---------|-------|
| EP-AU13 | POST | /passkey/register/options | authenticated | `PasskeyService` | — |
| EP-AU14 | POST | /passkey/register/verify | authenticated | `PasskeyService` | — |
| EP-AU15 | POST | /passkey/login/options | public; rate limit | `PasskeyService` | login (`email` / `challengeToken`) or reset (`resetToken`); reset challenges are `password_reset` purpose and cannot be used on EP-AU16 |
| EP-AU16 | POST | /passkey/login/verify | public; rate limit | `PasskeyService` | issues JWT — login only; reset must not call this |
| EP-AU17 | GET | /passkey | authenticated | `PasskeyService.getUserPasskeys` | — |
| EP-AU18 | DELETE | /passkey/:credentialId | authenticated | `PasskeyService.deletePasskey` | — |

## Password (`/password`)

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-AU19 | POST | /password/forgot | public; rate limit | email | always generic success | `PasswordResetService.requestReset` | Mailjet 15m link; no enumeration; audit `auth.password.forgot.requested` |
| EP-AU20 | POST | /password/reset | public; rate limit | token, password, confirmPassword; optional `twoFactor: { code, type }` or `passkey: { challengeKey, response }` | 200 success or 400 | `PasswordResetService.resetPassword` | step-up required if TOTP or passkey enabled; no JWT; single-use token; audit success/failure |
| EP-AU21 | POST | /password/validate-token | public; rate limit | token | `{ valid, requiresStepUp, availableMethods }` | `PasswordResetService.validateResetToken` | invalid/expired → `valid: false` only |

## OAuth (`/oauth`)

| ID | Method | Route | Auth | Service | Notes |
|----|--------|-------|------|---------|-------|
| EP-AU22 | GET | /oauth/:provider | public; rate limit | `OAuthRegistry`, Google provider | redirect to Google |
| EP-AU23 | GET | /oauth/:provider/callback | public; rate limit | OAuth + `AuthService` | issues JWT |

## Account Settings (`/settings`)

| ID | Method | Route | Auth | Service | Notes |
|----|--------|-------|------|---------|-------|
| EP-AU24 | GET | /settings | authenticated | `AccountSettingsService.getSettings` | — |
| EP-AU25 | PUT | /settings | authenticated | `AccountSettingsService.updateSettings` | — |
| EP-AU26 | PUT | /settings/:group | authenticated | `AccountSettingsService.updateGroup` | security, notifications, display, privacy |
| EP-AU27 | POST | /settings/reset | authenticated | `AccountSettingsService.resetToDefaults` | — |
| EP-AU28 | POST | /settings/reset/:group | authenticated | `AccountSettingsService.resetToDefaults` | — |
