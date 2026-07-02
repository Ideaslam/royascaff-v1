## Module: Auth

### Admin Login Page
- Route: `/auth/login`
- Components: LoginPage (email/password form, rejects non-admin accounts client-side before storing session)
- Service: AuthService.login() → `POST /api/v1/auth/login`
- Guard: guestGuard
- Notes: Client rejects non-admin users before storing the session.

### Admin Forgot Password Page
- Route: `/auth/forgot-password`
- Components: ForgotPasswordPage (email field, submit, confirmation)
- Service: AuthService.forgotPassword() → `POST /api/v1/auth/forgot-password`
- Guard: guestGuard

### Admin Reset Password Page
- Route: `/auth/reset-password` (`?token=`)
- Components: ResetPasswordPage (new password + confirm fields)
- Service: AuthService.resetPassword() → `POST /api/v1/auth/reset-password`
- Guard: guestGuard
- Notes: A `RegisterPage` component exists in this repo but is **not routed** (admin accounts are provisioned, not self-registered).
