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
- Provider: Mailjet (`external-services/mailjet/`), n8n
- Must not: Send email from frontend

## RULE-013 · Multi-App Context (Frontend)

- Type: Business Logic
- Module: Apps (Module 2)
- Must: Portal pages scope data to `AppContextService.selectedAppId`
- Must not: Assume single-app without switcher selection

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
- Module: Admin Panel (Module 14)
- Must: All platform-admin operations exposed under `/api/admin/v1/*` with `authMiddleware` + `requireAdmin`; admin panel frontend calls **only** `/api/admin/v1` (including auth — no merchant API)
- Must: Admin login at `POST /api/admin/v1/auth/login` delegates to `AuthService` but rejects users where `role !== 'admin'` or `isActive === false` (same generic error as invalid credentials)
- Must: Cross-merchant reads (payments, deliveries, merchants) go through dedicated admin services with explicit platform scope — never bypass ownership checks on merchant routes
- Must not: Expose admin-only operations without `requireAdmin`; allow non-admin users into admin panel routes; keep duplicate admin endpoints on merchant API after migration
- Must: Audit merchant suspend/role change and gateway request admin actions via `AuditService` (RULE-010)
