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
- Notes: Registration may be disabled globally via System Settings (`registrationEnabled`). On success redirects to `/auth/check-email` (invitation flow preserves accept-invite redirect). *(change-056)*

### Check Email Page *(change-056)*
- Route: `/auth/check-email`
- Components: CheckEmailPage (envelope icon, user email display, resend button, continue to onboarding link)
- Service: AuthService.resendVerification() → `POST /api/v1/auth/resend-verification`
- Guard: authGuard (authenticated only)
- Notes: Shown after registration. Resend respects 5-min cooldown (429). User can continue to onboarding while unverified.

### Verify Email Page *(change-056)*
- Route: `/auth/verify-email` (`?token=`)
- Components: VerifyEmailPage (loading/success/already-verified/error states)
- Service: AuthService.verifyEmail() → `POST /api/v1/auth/verify-email`
- Guard: none (public; token-based)
- Notes: Updates local session with verified user profile on success. Invalid/expired token shows error with link to resend (if logged in) or login.

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

### App Shell Verify Banner *(change-056)*
- Location: AppShell (authenticated `/app/*` routes)
- Components: persistent top banner when `user.emailVerified === false`
- Action: link to `/auth/check-email` for resend
- Notes: EN/AR via i18n. Banner hidden once verified.
