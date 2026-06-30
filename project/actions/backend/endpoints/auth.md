# Endpoints — Auth

Prefix: `/api/merchant/v1/auth` · Auth default: **authenticated** (Bearer JWT) unless noted public.

## Core Auth

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-AU01 | POST | /register | public; rate limit | email, password, name | 201 | `AuthService.register` | — |
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
| EP-AU15 | POST | /passkey/login/options | public; rate limit | `PasskeyService` | — |
| EP-AU16 | POST | /passkey/login/verify | public; rate limit | `PasskeyService` | issues JWT |
| EP-AU17 | GET | /passkey | authenticated | `PasskeyService.getUserPasskeys` | — |
| EP-AU18 | DELETE | /passkey/:credentialId | authenticated | `PasskeyService.deletePasskey` | — |

## Password (`/password`)

| ID | Method | Route | Auth | Service | Notes |
|----|--------|-------|------|---------|-------|
| EP-AU19 | POST | /password/forgot | public; rate limit | `PasswordResetService` | — |
| EP-AU20 | POST | /password/reset | public; rate limit | `PasswordResetService` | — |
| EP-AU21 | POST | /password/validate-token | public; rate limit | `PasswordResetService` | — |

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
