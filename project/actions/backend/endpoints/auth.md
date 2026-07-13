## Module: Auth

`@Controller('auth')` · Global: JwtAuthGuard + RolesGuard · Envelope: `{ success, data }` · Paginated: `{ items, page, limit, total }` · Route prefix: `/api/v1` · Export endpoints return raw streams (no envelope) · `204` returns no body

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-AUTH-01 | POST | /api/v1/auth/register | public | `RegisterDto` { name, email, password } | 201 `AuthResponseDto` | SVC-AUTH.register() | Rate 10/min; sets emailVerified=false; sends verification email; redirectTo `/auth/check-email` *(change-056)* |
| EP-AUTH-02 | POST | /api/v1/auth/login | public | `LoginDto` { email, password } | 200 `AuthResponseDto` | SVC-AUTH.login() | Rate 10/min; 401 on mismatch; unverified users allowed |
| EP-AUTH-03 | POST | /api/v1/auth/oauth/callback | public | `OAuthCallbackDto` { provider, code, redirectUri } | 200 `{ message }` | none (stub) | **Stub** — not wired |
| EP-AUTH-04 | POST | /api/v1/auth/refresh | public | `RefreshTokenDto` { refreshToken } | 201 `{ accessToken, refreshToken }` | SVC-AUTH.refresh() | 401 if invalid/expired |
| EP-AUTH-05 | POST | /api/v1/auth/forgot-password | public | `ForgotPasswordDto` { email } | 200 `{ message }` | SVC-AUTH.forgotPassword() | Rate 10/min; always 200 |
| EP-AUTH-06 | POST | /api/v1/auth/reset-password | public | `ResetPasswordDto` { token, newPassword } | 200 `{ message }` | SVC-AUTH.resetPassword() | |
| EP-AUTH-09 | POST | /api/v1/auth/verify-email | public | `VerifyEmailDto` { token } | 200 `{ message, alreadyVerified, user? }` | SVC-AUTH.verifyEmail() | 24h token; sends welcome email on success *(change-056)* |
| EP-AUTH-10 | POST | /api/v1/auth/resend-verification | JWT | none | 200 `{ message }` | SVC-AUTH.resendVerificationEmail() | 429 if within 5-min cooldown; 400 if already verified *(change-056)* |
| EP-AUTH-07 | POST | /api/v1/auth/logout | JWT | none | 204 | SVC-AUTH.logout() | |
| EP-AUTH-08 | GET | /api/v1/auth/me | JWT | none | 200 `UserProfileDto` | SVC-AUTH.getProfile() | Includes emailVerified *(change-056)* |

**Notes:**
- [EP-AUTH-01] Validates email uniqueness, hashes password, creates user record, returns JWT access + refresh tokens. Never returns `passwordHash`. `redirectTo` defaults to `'/auth/check-email'` for new registrations. Response includes `user: UserProfileDto` with id, name, email, role, languagePreference, emailVerified, currentWorkspaceId, defaultWorkspaceId.
- [EP-AUTH-03] Accepts an OAuth authorization code payload but is **not wired** to `AuthService.oauthLogin`. Handler returns a static message only. See Known Gaps.
- [EP-AUTH-09] Marks user verified, clears token fields, sends welcome email (EN/AR). Returns user profile when available.
- Unverified users receive `403 EMAIL_NOT_VERIFIED` on mutating project/dashboard/data/invite endpoints (see RULE-AUTH-002).
