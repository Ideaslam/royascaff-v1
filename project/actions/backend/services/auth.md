## Module: Auth

### SVC-AUTH · AuthService [internal, application, Auth]
Owns registration, credential/OAuth login, token rotation, logout, and password reset.

**Methods:**
- `register(dto: RegisterDto, ip?: string): Promise<AuthResponseDto>` — rejects duplicate email, bcrypt-hashes password, creates EDITOR user, auto-creates workspace via WorkspaceService.createWorkspace, issues tokens with workspace context, sends welcome email, audits USER_REGISTER
- `login(dto: LoginDto, ip?: string): Promise<AuthResponseDto>` — validates credentials and active status, updates lastLoginAt, audits USER_LOGIN / USER_LOGIN_FAILED
- `oauthLogin(provider: string, oauthUserId: string, email: string, name: string, ip?: string): Promise<AuthResponseDto>` — finds-or-links-or-creates user from OAuth identity, issues tokens (controller callback is a stub)
- `refresh(dto: RefreshTokenDto): Promise<{ accessToken; refreshToken }>` — verifies refresh JWT, compares stored hash, issues new pair
- `logout(userId: string, ip?: string): Promise<void>` — clears stored refresh-token hash, audits USER_LOGOUT
- `forgotPassword(email: string): Promise<void>` — generates reset token, stores hash with 1h expiry, emails reset link (silent no-op if email unknown)
- `resetPassword(token: string, newPassword: string): Promise<void>` — matches hashed reset token, sets new password, clears reset fields and refresh hash
- `toProfileDto(user): UserProfileDto` — maps user document to safe public profile shape

**Deps:** UserRepository · WorkspaceService · AuditLogService · JwtService (@nestjs/jwt) · ConfigService · MAIL_PROVIDER
**Side effects:** bcrypt hashing · JWT signing · email send (best-effort) · audit writes
**Rules:** Email unique (lowercased) · New users default to EDITOR · bcrypt 12 rounds (password) / 10 rounds (refresh hash) · Inactive accounts cannot login · forgotPassword never reveals email existence · Reset tokens single-use, expire 1h, successful reset revokes sessions

---

### SVC-AUTH-JWT · JwtStrategy [internal, application, Auth]
Passport JWT strategy that validates access tokens and loads the active user for each request.

**Methods:**
- `validate(payload: JwtPayload): Promise<RequestUser>` — loads user by payload.sub, looks up WorkspaceMembership for payload.currentWorkspaceId, throws UnauthorizedException if missing/inactive or not workspace member, returns RequestUser with workspace details

**Deps:** UserRepository · ConfigService
**Side effects:** none (read-only)
**Rules:** Expired tokens rejected (ignoreExpiration: false) · Valid signature not enough — user must exist and be active
