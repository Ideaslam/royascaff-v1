# Custom Feature Rules

Auth rules: see `plan/roles-and-authorization.md`.

---

## RULE-001 · Payment Gateway Isolation

- Type: Integration
- Module: Gateways (Module 7)
- Must: All gateway SDK/API calls go through `GatewayFactory` adapter classes in `services/gateway/gateways/`
- Provider: Stripe, PayPal, Moyasar, MyFatoorah via adapter pattern
- Must not: Call gateway APIs directly from controllers; store plaintext credentials (use `GatewayConfigEncryption`)

## RULE-002 · Checkout Card Tokenization Exception

- Type: Integration, Security
- Module: Payments (Module 6)
- Must: Checkout frontend tokenizes cards directly with Moyasar/MyFatoorah APIs (PCI scope reduction on backend)
- Must not: Send raw card numbers to PayUp API
- Note: Deviation from engine frontend convention (no direct third-party calls)

## RULE-003 · Notification Event Bus

- Type: Async Job
- Module: Notifications (Module 8)
- Must: Domain code emits via `eventBus.emit()` only; dispatch worker fans out to rules; delivery worker sends with retry
- Must not: Send webhooks/emails synchronously from payment controllers; add channels without implementing `NotificationChannel` interface
- Provider: BullMQ (`notif-events`, `notif-deliveries`) + Redis

## RULE-004 · Webhook Security

- Type: Security, Integration
- Module: Notifications (Module 8)
- Must: HMAC-SHA256 sign outbound webhooks; AES-256-GCM encrypt stored secrets; SSRF protection on URLs; auto-disable after consecutive failures
- Must not: Log full webhook secrets; deliver to private IP ranges

## RULE-005 · Domain Verification Gate

- Type: Business Logic, Security
- Module: Tokens (Module 4)
- Must: Reject `POST /tokenize` if Origin domain not verified for app
- Must not: Issue frontend SDK JWT without domain check

## RULE-006 · Payment Session = Payment Document

- Type: Business Logic
- Module: Payments (Module 6)
- Must: Use single `Payment` collection for sessions and completed payments; unique `sessionId` and `sessionToken`
- Must not: Create separate session collection

## RULE-023 · Exchange Rates Are Stored, Never Fetched Inline

- Type: Integration, Business Logic
- Module: Core Platform (Module 9), Payments (Module 6)
- Must: Read every currency and rate through **`ICurrencyService`** — never construct `CurrencyService` directly and never read the `Currency` model from a service or controller
- Must: Contact an FX provider **only** from the `fx-rates` BullMQ worker or the admin manual-sync endpoint, both through **`IExchangeRateProvider`**; the concrete provider is selected by `FX_PROVIDER` and resolved by a factory that fails fast on an unknown value
- Must: Store `rateFromUsd` exactly as the provider returns it (units per 1 USD, `USD = 1`); convert with `amount / from.rateFromUsd * to.rateFromUsd`
- Must: Keep `minorUnitExponent` on every currency, seeded from ISO 4217 (`3` for KWD/BHD/OMR/JOD/TND/IQD/LYD, `0` for JPY/KRW, `2` otherwise)
- Must: Serve reads from Redis with `FX_CACHE_TTL_SECONDS`, and invalidate currency cache keys immediately after a successful sync
- Must: On provider failure, leave stored rates untouched, log a structured error, and keep serving the last known rates; log a warning per conversion once rates exceed `FX_MAX_STALENESS_HOURS`
- Must: Write one `currency.rates.synced` audit entry per successful sync, and a `currency.exponent.updated` entry with before/after values whenever an admin edits `minorUnitExponent`
- Must: Keep exactly two exponent artifacts — `Currency.minorUnitExponent` in MongoDB (authoritative) and `constants/iso-currency-exponents.ts` (seed bootstrap and unknown-currency fallback). A third copy is what produced bug-008
- Must not: Call an FX provider from any request path, including payment session creation; round the exchange rate; scale or invert a rate before storing it; reference fastFOREX URLs or response field names outside `external-services/fastforex/`; write a partial snapshot

## RULE-022 · Session Money Fields Are Additive

- Type: Business Logic, Integration
- Module: Payments (Module 6)
- Must: `Payment.amount` / `Payment.currency` (and checkout `totalAmount` / `currency`) are the **charged** gateway values used to process payment
- Must: Product snapshot `price` / `currency` remain the merchant/catalog values the integrator sent
- Must: Persist first-class `currencyConversion` (`originalAmount`, `originalCurrency`, `convertedAmount`, `convertedCurrency`, `exchangeRate`) on new sessions; `exchangeRate` is `1` when currencies match
- Must: Persist product `paidPrice` / `paidCurrency` (charged unit price) on new sessions
- Must: Expose those new keys on session create, checkout session GET, merchant session detail, admin payment detail, and webhook payment payloads **without** renaming, removing, or changing the meaning of existing response fields
- Must not: Reshape existing integrator responses; mark the new fields required; backfill historical documents; change the charge path to use merchant currency when the gateway default differs

## RULE-007 · Gateway Selection

- Type: Business Logic
- Module: Gateways (Module 7)
- Must: Evaluate `GatewayRule` conditions by priority/score; respect app gateway availability and environment (sandbox/live)
- Must not: Hardcode gateway selection in checkout without rule evaluation

## RULE-008 · Encryption at Rest

- Type: Security
- Module: Core (Module 9)
- Must: Encrypt gateway configs, webhook secrets, TOTP secrets via `EncryptionServiceFactory`; separate `MASTER_ENCRYPTION_KEY` from JWT secret
- Provider: `DbEncryptionService` (storage type: db or vault)
- Must not: Commit secrets to git; use weak defaults in production

## RULE-009 · Rate Limiting

- Type: Security
- Module: Infrastructure (Module 12)
- Must: Apply tiered rate limits — auth endpoints 10/min/IP; checkout high-sensitive routes stricter
- Provider: Redis + `rate-limiter-flexible`

## RULE-010 · Audit Trail

- Type: Business Logic
- Module: Core (Module 9)
- Must: Log auth events (2FA, passkey, password reset) and sensitive mutations via `AuditService`
- Must not: Skip audit on admin gateway request actions

## RULE-011 · Media Storage

- Type: Storage, Integration
- Module: Core (Module 9)
- Must: Upload media and company documents via `S3Service` to Cloudflare R2
- Provider: AWS S3 SDK (S3-compatible endpoint)
- Must not: Store files on local disk in production

## RULE-012 · Email Delivery

- Type: Integration
- Module: Auth, Verification, Notifications
- Must: OTP and password reset via Mailjet; welcome emails via n8n webhook
- Must: Password-reset email is a 15-minute link to `{APP_BASE_URL}/auth/reset-password?token=`; `APP_BASE_URL` is the customer portal origin (not the API)
- Provider: Mailjet (`external-services/mailjet/`), n8n
- Must not: Send email from frontend

## RULE-021 · Password Reset Step-Up

- Type: Security
- Module: Auth (Module 1)
- Must: Store reset token as SHA-256 hash with 15-minute expiry; forgot always returns the same success; if TOTP 2FA and/or a passkey is enabled, require one successful method before the password changes
- Must: Verify TOTP/backup via `TotpService` and passkey via `PasskeyService` inside `PasswordResetService`; consume a used backup code
- Must not: Issue a session JWT on reset; call `POST /2fa/verify` or `POST /passkey/login/verify` from the reset flow; reveal whether an email exists; accept an expired or reused token

## RULE-013 · Multi-App Context (Frontend)

- Type: Business Logic
- Module: Apps (Module 2)
- Must: Portal pages scope data to `AppContextService.selectedAppId` within the active merchant context
- Must: Lazy `p-table` pages let `onLazyLoad` own the fetch. `selectedApp$` only stores the app and resets the table (`requestTableLoad`). Payments (non-lazy) loads only from `watchSelectedApp`, not also from `onAppSelected`
- Must not: Assume single-app without switcher selection; access apps outside current merchant; call the same list API from both `selectedApp$` and PrimeNG `onLazyLoad`

## RULE-014 · SDK Scope Permissions

- Type: Security
- Module: Tokens (Module 4)
- Must: Enforce scope checks on SDK JWT for session creation, OTP, and product linking
- Must not: Grant all scopes by default on token creation without explicit configuration

## RULE-015 · Status Transition Notifications

- Type: Async Job
- Module: Payments, Notifications
- Must: `PaymentStatusSyncService.persist()` emits notification events only on valid status transitions
- Events: payment.completed, payment.failed, payment.cancelled, payment.expired, payment.refunded

## RULE-016 · Admin API Isolation

- Type: Security, Architecture
- Module: Admin Panel (Module 15)
- Must: All platform-admin operations exposed under `/api/admin/v1/*` with `adminAuthMiddleware`; admin panel frontend calls **only** `/api/admin/v1` (including auth — no merchant API)
- Must: Admin login at `POST /api/admin/v1/auth/login` authenticates against `AdminUser` collection (fully isolated from merchant users)
- Must: Cross-merchant reads (payments, deliveries, merchants) go through dedicated admin services with explicit platform scope
- Must not: Expose admin-only operations without `adminAuthMiddleware`; allow User accounts into admin panel routes

## RULE-017 · Merchant Ownership Scoping

- Type: Security, Architecture
- Module: Merchant & Team (Module 14)
- Must: All business resources (Apps, Products, Payments, Gateways, Tokens, etc.) scoped by `merchantId`; `merchantContext` middleware resolves `X-Merchant-Id` header and validates membership on every `/api/merchant/v1/*` request (except auth routes)
- Must: Track `createdBy` (userId) on resource creation for attribution; does NOT affect access control
- Must not: Use `userId` for resource ownership; allow access without valid merchant membership; skip merchant status check (suspended merchants must be blocked)

## RULE-018 · Workspace Role Enforcement

- Type: Security
- Module: Merchant & Team (Module 14)
- Must: Enforce role-based access via `requireMerchantRole(...roles)` middleware on sensitive routes (team management = owner/admin only; SDK/webhook routes = owner/admin/developer; live payments = not developer)
- Must: Owner cannot leave or be removed from merchant
- Must not: Allow role escalation without owner/admin action; allow developer role access to live payment data or business modules

## RULE-019 · Merchant Suspension

- Type: Business Logic, Security
- Module: Merchant & Team (Module 14), Admin Panel (Module 15)
- Must: When `Merchant.status = 'suspended'` by platform admin, ALL API access blocked for merchant members (merchantContext middleware returns 403 with suspension reason); members can still authenticate (login) but portal shows suspended state
- Must: Audit suspension/activation actions via `AuditService`
- Must not: Allow any CRUD operations on a suspended merchant's resources; silently fail without informing the user

## RULE-020 · Invite System

- Type: Business Logic
- Module: Merchant & Team (Module 14)
- Must: Invites expire after 3 days; invite registration creates new User account and auto-joins merchant; only owner/admin can invite; email must not already be a member of the target merchant
- Must not: Allow invite to existing member; allow invite with owner role (owner is creator only); bypass expiry check
