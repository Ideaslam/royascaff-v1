## Module: Auth

### Login Page
- Route: `/auth/login`
- Components: LoginPage (brand header, email/password form, OAuth buttons for Google & Microsoft, links to forgot-password & register)
- Service: AuthService.login() → `POST /api/v1/auth/login`; OAuth via browser redirect → `/api/v1/auth/oauth/google`, `/api/v1/auth/oauth/microsoft`
- Guard: guestGuard
- Notes: OAuth end-to-end is partial (backend `oauth/callback` is a stub). Authenticated users redirected away by guestGuard.

### Register Page
- Route: `/auth/register`
- Components: RegisterPage (brand header, name/email/password form, link to login)
- Service: AuthService.register() → `POST /api/v1/auth/register`
- Guard: guestGuard
- Notes: Registration may be disabled globally via System Settings (`registrationEnabled`).

### Forgot Password Page
- Route: `/auth/forgot-password`
- Components: ForgotPasswordPage (email field, submit, confirmation message, link to login)
- Service: AuthService.forgotPassword() → `POST /api/v1/auth/forgot-password`
- Guard: guestGuard
- Notes: Success shows "check your email" confirmation instead of navigating away.

### Reset Password Page
- Route: `/auth/reset-password` (`?token=`)
- Components: ResetPasswordPage (new password + confirm fields, submit, redirect to login on success)
- Service: AuthService.resetPassword() → `POST /api/v1/auth/reset-password`
- Guard: guestGuard
- Notes: Reads `token` from query string; invalid/expired token shows error.
