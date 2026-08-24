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
- Methods: `generateRegistrationOptions`, `verifyRegistrationResponse`, `generateAuthenticationOptions`, `verifyAuthenticationResponse`, `storeChallenge`, `consumeChallenge`, `getUserPasskeys`, `deletePasskey`, `findUserByEmail`
- Deps: `@simplewebauthn/server`, `PasskeyCredentialRepository`, `UserRepository`
- Side effects: external WebAuthn ceremony; holds short-lived WebAuthn challenge store (login + password reset)

### SVC-A04 · PasswordResetService [domain, internal, Auth]
- Methods:
  - `requestReset(email)` — always generic success; if user exists, store SHA-256 token hash, expiry 15m, Mailjet link `{APP_BASE_URL}/auth/reset-password?token=`
  - `validateResetToken(token)` — `{ valid, requiresStepUp, availableMethods: { totp, passkey } }` (no account-existence leak on invalid token)
  - `resetPassword(token, password, stepUp?)` — verify token; if TOTP and/or passkey enabled, require one proof (`totp`/`backup` or passkey `{ challengeKey, response }`); hash password; clear token; **do not** issue JWT
- Deps: `UserRepository`, `EmailService`, `TotpService`, `PasskeyService`, crypto, bcrypt
- Side effects: email (reset link); consume backup code if used
- Rules: anti-enumeration; token hashed at rest; new request replaces prior token; stolen link alone cannot reset a step-up account

### SVC-A05 · GoogleOAuthProvider [integration, external, Auth]
- Methods: `getAuthorizationUrl`, `exchangeCode`, `getProfile`
- Deps: Google OAuth HTTP, config

### SVC-A06 · OAuthRegistry [domain, internal, Auth]
- Methods: `register`, `get`, `getAll`, `has`
- Deps: `IOAuthProvider` implementations
