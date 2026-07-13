## Module: Auth

### SVC-AUTH · AuthService [internal, application, Auth]
Owns registration, credential/OAuth login, token rotation, logout, password reset, and email verification.

**Methods:**
- `register(dto: RegisterDto, ip?: string): Promise<AuthResponseDto>` — rejects duplicate email, bcrypt-hashes password, creates EDITOR user with emailVerified=false, auto-creates workspace via WorkspaceService.createWorkspace, issues tokens with workspace context, sends verification email (EN/AR), audits USER_REGISTER; redirectTo `/auth/check-email` *(change-056)*
- `login(dto: LoginDto, ip?: string): Promise<AuthResponseDto>` — validates credentials and active status, updates lastLoginAt, audits USER_LOGIN / USER_LOGIN_FAILED; unverified users allowed *(change-056)*
- `oauthLogin(provider, oauthUserId, email, name, ip?): Promise<AuthResponseDto>` — finds-or-links-or-creates user from OAuth identity with emailVerified=true, issues tokens (controller callback is a stub)
- `refresh(dto: RefreshTokenDto): Promise<{ accessToken; refreshToken }>` — verifies refresh JWT, compares stored hash, issues new pair
- `logout(userId: string, ip?: string): Promise<void>` — clears stored refresh-token hash, audits USER_LOGOUT
- `forgotPassword(email: string): Promise<void>` — generates reset token, stores hash with 1h expiry, emails reset link (silent no-op if email unknown)
- `resetPassword(token: string, newPassword: string): Promise<void>` — matches hashed reset token, sets new password, clears reset fields and refresh hash
- `verifyEmail(token: string, ip?: string): Promise<{ alreadyVerified; user? }>` — marks verified, sends welcome email, audits USER_EMAIL_VERIFIED *(change-056)*
- `resendVerificationEmail(userId: string): Promise<void>` — resends verification email with 5-min cooldown *(change-056)*
- `getProfile(userId, workspaceSlug?, workspaceRole?): Promise<UserProfileDto>` — loads user and maps to safe profile including emailVerified *(change-056)*
- `toProfileDto(user): UserProfileDto` — maps user document to safe public profile shape

**Deps:** UserRepository · WorkspaceService · AuditLogService · JwtService (@nestjs/jwt) · ConfigService · MAIL_PROVIDER · EmailVerificationService *(change-056)*
**Side effects:** bcrypt hashing · JWT signing · email send (best-effort) · audit writes
**Rules:** Email unique (lowercased) · New email/password users default to emailVerified=false · OAuth users emailVerified=true · bcrypt 12 rounds (password) / 10 rounds (refresh hash) · Inactive accounts cannot login · forgotPassword never reveals email existence · Reset tokens single-use, expire 1h · Verification tokens expire 24h, resend cooldown 5 min *(change-056)*

---

### SVC-AUTH-EMAIL · EmailVerificationService [internal, application, Auth] *(change-056)*
Centralizes email verification token lifecycle, branded template emails, and mutating-action guard.

**Methods:**
- `assertEmailVerified(userId: string): Promise<void>` — throws 403 EMAIL_NOT_VERIFIED if user exists and emailVerified=false
- `issueVerificationToken(userId: string): Promise<string>` — generates raw token, stores bcrypt hash + 24h expiry
- `sendVerificationEmail(user, rawToken): Promise<void>` — renders EN/AR template, sends via MailProvider (best-effort)
- `sendWelcomeEmail(user): Promise<void>` — sends welcome template after successful verification
- `verifyEmail(token: string): Promise<{ alreadyVerified; userId? }>` — validates token, marks verified, sends welcome
- `resendVerification(userId: string): Promise<void>` — 400 if verified, 429 if cooldown, else re-issue + send

**Deps:** UserRepository · ConfigService · MailTemplateService · MAIL_PROVIDER

---

### SVC-AUTH-JWT · JwtStrategy [internal, application, Auth]
Passport JWT strategy that validates access tokens and loads the active user for each request.

**Methods:**
- `validate(payload: JwtPayload): Promise<RequestUser>` — loads user by payload.sub, looks up WorkspaceMembership for payload.currentWorkspaceId, throws UnauthorizedException if missing/inactive or not workspace member, returns RequestUser with workspace details and emailVerified *(change-056)*

**Deps:** UserRepository · ConfigService
**Side effects:** none (read-only)
**Rules:** Expired tokens rejected (ignoreExpiration: false) · Valid signature not enough — user must exist and be active
