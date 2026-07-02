# Endpoints — Auth

## Module: Auth

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-001 | POST | /auth/login | public | `body: LoginDto` | `200 AuthResponseDto` | `AuthService.login()` | — |
| EP-002 | POST | /auth/register | public | `body: RegisterDto` (inviteToken required) | `201 AuthResponseDto` | `AuthService.register()` | RULE-001 |
| EP-003 | POST | /auth/refresh | public | `body: RefreshTokenDto` | `200 AuthResponseDto` | `AuthService.refresh()` | — |
| EP-004 | POST | /auth/logout | authenticated | — | `204` | `AuthService.logout()` | — |
| EP-005 | POST | /auth/password-reset/request | public | `body: { email }` | `204` | `AuthService.requestPasswordReset()` | always 204 |
| EP-006 | POST | /auth/password-reset/confirm | public | `body: ResetPasswordDto` | `204` | `AuthService.resetPassword()` | — |
| EP-007 | GET | /auth/invite/:token | public | `param: token` | `200 InvitePreviewDto` | `AuthService.validateInviteToken()` | registration pre-check |
| EP-008 | GET | /auth/google | public | `query: redirectUri` | `302` | `GoogleOAuthService.getAuthorizationUrl()` | OAuth redirect |
| EP-009 | GET | /auth/google/callback | public | `query: code, state` | `200 AuthResponseDto` | `OAuthLinkService.loginOrRegisterWithGoogle()` | — |
| EP-010 | GET | /auth/github | public | `query: redirectUri` | `302` | `GitHubOAuthService.getAuthorizationUrl()` | OAuth redirect |
| EP-011 | GET | /auth/github/callback | public | `query: code, state` | `200 AuthResponseDto` | `OAuthLinkService.loginOrRegisterWithGitHub()` | RULE-010 |
| EP-012 | GET | /auth/me | authenticated | — | `200 MeDto` | `JwtStrategy.validate()` | current user + roles |
