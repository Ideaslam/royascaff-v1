# Services — Auth

## Module: Auth

### SVC-001 · AuthService [domain, internal, Auth]

- Status: partial

- Methods:
  - `login(dto): AuthResponse` — validate credentials, issue JWT
  - `register(dto): AuthResponse` — validate invite token, create user, wallet, sphere connection, issue JWT
  - `refresh(refreshToken): AuthResponse` — rotate tokens
  - `logout(userId): void` — invalidate refresh token if stored
  - `requestPasswordReset(email): void` — queue reset email
  - `resetPassword(dto): void` — validate reset token, update password
  - `validateInviteToken(token): InvitationPreview` — check token valid for registration form
- Deps: `UsersRepository`, `InvitationsService`, `WalletsService`, `SphereService`, `MailjetEmailProvider`, `JwtService`
- Side effects: email on password reset; wallet + sphere connection on register
- Rules: RULE-001 invite-only registration; never return password hashes

### SVC-002 · GoogleOAuthService [integration, external, Auth]

- Status: planned

- Methods:
  - `getAuthorizationUrl(state): string`
  - `handleCallback(code): OAuthProfile` — exchange code, return profile
- Deps: Google OAuth config from env
- Side effects: none
- Rules: server-side only; RULE-015

### SVC-003 · GitHubOAuthService [integration, external, Auth]

- Status: planned

- Methods:
  - `getAuthorizationUrl(state, scopes): string`
  - `handleCallback(code): OAuthTokensAndProfile` — exchange code; return tokens + profile
- Deps: GitHub OAuth config from env
- Side effects: none
- Rules: RULE-010 single GitHub app; RULE-015

### SVC-004 · OAuthLinkService [application, internal, Auth]

- Status: planned

- Methods:
  - `loginOrRegisterWithGoogle(dto): AuthResponse` — link or create user; invite required for new users
  - `loginOrRegisterWithGitHub(dto): AuthResponse` — same; optionally persist GitHubConnection
- Deps: `GoogleOAuthService`, `GitHubOAuthService`, `AuthService`, `UsersRepository`, `GithubConnectionsRepository`
- Side effects: may create user, wallet, sphere connection
- Rules: RULE-001, RULE-010

### SVC-005 · JwtStrategy [domain, internal, Auth]

- Status: done

- Methods:
  - `validate(payload): AuthUser` — load user + effective roles for request context
- Deps: `UsersRepository`, `RolesService`
- Side effects: none
- Rules: attach global + project roles to request user
