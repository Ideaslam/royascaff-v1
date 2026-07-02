# Pages — Auth

App key: `linda` · Layout: **auth layout** (no app shell)

## Module: Auth

### Login Page

- Route: `/auth/login`
- Components: `LoginFormComponent`, `SocialLoginButtonsComponent`
- Service: `AuthApiService` → EP-001 (POST /auth/login), EP-008/EP-010 (OAuth redirects)
- Guard: `GuestGuard`
- UI states: loading on submit; invalid credentials error; redirect to `/` on success
- Notes: link to password reset; Google + GitHub buttons

### Register Page

- Route: `/auth/register`
- Components: `RegisterFormComponent`, `InviteTokenBannerComponent`
- Service: `AuthApiService` → EP-002 (POST /auth/register), EP-007 (GET /auth/invite/:token)
- Guard: `GuestGuard`
- Query: `?token=` invite token required
- UI states: invalid/expired token error; success → auto-login → `/`
- Notes: RULE-001 invite-only

### Password Reset Request Page

- Route: `/auth/password-reset`
- Components: `PasswordResetRequestFormComponent`
- Service: `AuthApiService` → EP-005
- Guard: `GuestGuard`
- UI states: always show success message after submit

### Password Reset Confirm Page

- Route: `/auth/password-reset/confirm`
- Components: `PasswordResetConfirmFormComponent`
- Service: `AuthApiService` → EP-006
- Guard: `GuestGuard`
- Query: `?token=`
- UI states: invalid token error; success → redirect login

### OAuth Callback Page

- Route: `/auth/callback`
- Components: `OAuthCallbackHandlerComponent`
- Service: `AuthApiService` → EP-009, EP-011
- Guard: `GuestGuard`
- UI states: loading spinner; error toast; success → `/`
