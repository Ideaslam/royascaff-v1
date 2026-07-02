## Module: Auth

`@Controller('auth')` · Global: JwtAuthGuard + RolesGuard · Envelope: `{ success, data }` · Paginated: `{ items, page, limit, total }` · Route prefix: `/api/v1` · Export endpoints return raw streams (no envelope) · `204` returns no body

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-AUTH-01 | POST | /api/v1/auth/register | public | `RegisterDto` { name, email, password } | 201 `AuthResponseDto` | SVC-AUTH.register() | Rate 10/min |
| EP-AUTH-02 | POST | /api/v1/auth/login | public | `LoginDto` { email, password } | 200 `AuthResponseDto` | SVC-AUTH.login() | Rate 10/min; 401 on mismatch |
| EP-AUTH-03 | POST | /api/v1/auth/oauth/callback | public | `OAuthCallbackDto` { provider, code, redirectUri } | 200 `{ message }` | none (stub) | **Stub** — not wired |
| EP-AUTH-04 | POST | /api/v1/auth/refresh | public | `RefreshTokenDto` { refreshToken } | 201 `{ accessToken, refreshToken }` | SVC-AUTH.refresh() | 401 if invalid/expired |
| EP-AUTH-05 | POST | /api/v1/auth/forgot-password | public | `ForgotPasswordDto` { email } | 200 `{ message }` | SVC-AUTH.forgotPassword() | Rate 10/min; always 200 |
| EP-AUTH-06 | POST | /api/v1/auth/reset-password | public | `ResetPasswordDto` { token, newPassword } | 200 `{ message }` | SVC-AUTH.resetPassword() | |
| EP-AUTH-07 | POST | /api/v1/auth/logout | JWT | none | 204 | SVC-AUTH.logout() | |
| EP-AUTH-08 | GET | /api/v1/auth/me | JWT | none | 200 user payload `{ id, email, role }` | none (JWT payload) | |

**Notes:**
- [EP-AUTH-01] Validates email uniqueness, hashes password, creates user record, returns JWT access + refresh tokens. Never returns `passwordHash`. `redirectTo` defaults to `'/onboarding'` for new registrations. Response includes `user: UserProfileDto` with id, name, email, role, languagePreference, currentWorkspaceId, defaultWorkspaceId.
- [EP-AUTH-03] Accepts an OAuth authorization code payload but is **not wired** to `AuthService.oauthLogin`. Handler returns a static message only. See Known Gaps.
