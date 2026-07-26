# Services — Safqa API · Auth

### SVC-AUTH-01 · AuthActionsService [domain, internal, Auth]
- Status: done
- Methods:
  - `login(email, password): AuthTokens` — verify credentials, issue JWT + refresh
  - `logout(refreshToken): void` — revoke refresh
  - `refresh(refreshToken): AuthTokens` — rotate access/refresh
- Deps: PasswordService, AuthJwtService, AuthTokenService, UserContextService, UserRepository
- Side effects: token persist
- Rules: bcrypt verify; workspace context on JWT

### SVC-AUTH-02 · AuthRegistrationService [domain, internal, Auth]
- Status: done
- Methods:
  - `register(dto): result` — create workspace/user, send verification email
- Deps: UserRepository, WorkspacesRepository, MailjetService, VerificationService, PasswordService
- Side effects: email

### SVC-AUTH-03 · AuthTokenService [domain, internal, Auth]
- Status: done
- Methods: create/find/revoke refresh & purpose tokens by hash
- Deps: AuthTokensRepository
- Side effects: none

### SVC-AUTH-04 · AuthJwtService [domain, internal, Auth]
- Status: done
- Methods: `signAccess(payload)` / `verifyAccess(token)`
- Deps: JWT secret from environment
- Side effects: none

### SVC-AUTH-05 · PasswordService [domain, internal, Auth]
- Status: done
- Methods: `hash`, `verify`, password-reset helpers
- Deps: bcrypt, AuthTokenService, MailjetService
- Side effects: email (reset)

### SVC-AUTH-06 · VerificationService [domain, internal, Auth]
- Status: done
- Methods: issue/verify email verification tokens; resend
- Deps: AuthTokenService, MailjetService
- Side effects: email

### SVC-AUTH-07 · ProfileService [domain, internal, Auth]
- Status: done
- Methods: get/patch profile; upload/delete avatar (S3)
- Deps: UserRepository, S3Service
- Side effects: file

### SVC-AUTH-08 · UserContextService [domain, internal, Auth]
- Status: done
- Methods: `bootstrap(user)` — resolve role + permission keys + workspace
- Deps: RolesRepository, PermissionCheckerService
- Side effects: none

### SVC-AUTH-09 · PermissionCheckerService [domain, internal, Auth]
- Status: done
- Methods: resolve permission keys for role; has(permission)
- Deps: Roles/Permissions repos
- Side effects: none
