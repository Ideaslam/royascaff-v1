# Services — Auth

## Module: Auth

### SVC-A01 · AuthService [domain, internal, Auth]
- Methods:
  - `register(dto): User` — create merchant account, hash password
  - `login(dto): AuthResponse` — validate credentials, issue JWT or 2FA challenge
  - `getProfile(userId): User` — full profile
  - `getProfileSummary(userId): Summary` — lightweight profile for header
  - `updateProfile(userId, dto): User` — update name, company, settings
  - `refreshToken(userId): Token` — re-issue JWT
  - `generateChallengeToken(userId): string` — 2FA challenge JWT (5m TTL)
  - `verifyChallengeToken(token): userId` — decode challenge token
- Deps: `UserRepository`, `PasskeyCredentialRepository`, bcrypt, jwt
- Side effects: none
- Rules: email unique; password never returned

### SVC-A02 · TotpService [domain, internal, Auth]
- Methods: `generateSecret`, `verifyToken`, `encryptSecret`, `decryptSecret`, `generateBackupCodes`, `hashBackupCodes`, `verifyBackupCode`
- Deps: otplib, QRCode, `getEncryptionService`
- Side effects: none

### SVC-A03 · PasskeyService [integration, external, Auth]
- Methods: `generateRegistrationOptions`, `verifyRegistrationResponse`, `generateAuthenticationOptions`, `verifyAuthenticationResponse`, `getUserPasskeys`, `deletePasskey`, `findUserByEmail`
- Deps: `@simplewebauthn/server`, `PasskeyCredentialRepository`, `UserRepository`
- Side effects: external WebAuthn ceremony

### SVC-A04 · PasswordResetService [domain, internal, Auth]
- Methods: `requestReset(email)`, `resetPassword(token, password)`, `validateResetToken(token)`
- Deps: `UserRepository`, `EmailService`, crypto
- Side effects: email (reset link)

### SVC-A05 · GoogleOAuthProvider [integration, external, Auth]
- Methods: `getAuthorizationUrl`, `exchangeCode`, `getProfile`
- Deps: Google OAuth HTTP, config

### SVC-A06 · OAuthRegistry [domain, internal, Auth]
- Methods: `register`, `get`, `getAll`, `has`
- Deps: `IOAuthProvider` implementations
