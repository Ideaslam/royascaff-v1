# Data Model

MongoDB via Mongoose. PK: `_id: ObjectId`. Timestamps: `createdAt`, `updatedAt` (unless noted).

**Hub entities:** `User` (merchant account) and `App` (merchant application) anchor most app-scoped resources.

---

## 1. User

Purpose: Merchant account — authentication, settings, 2FA, OAuth.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `email` | String | required, unique | — |
| `password` | String | optional (OAuth users) | — |
| `name` | String | required | — |
| `photo` | String | optional | — |
| `company` | String | optional | — |
| `isActive` | Boolean | default: true | — |
| `role` | Enum | default: user | `user`, `admin` |
| `settings` | Object | embedded | security, notifications, display, privacy groups |
| `twoFactor` | Object | embedded | enabled, secret, backupCodes |
| `oauthAccounts[]` | Array | embedded | provider, providerUserId, email |
| `passwordResetTokenHash` | String | optional | — |
| `passwordResetExpires` | Date | optional | — |

Relations: one User → many App, Company, PasskeyCredential, AuditLog (as actor).
Indexes: unique `email`.

---

## 2. Company

Purpose: Merchant business entity for KYC / gateway onboarding.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `userId` | ObjectId | required | → User |
| `name` | String | required | — |
| `crNumber` | String | required | — |
| `vatNumber` | String | optional | — |
| `country`, `city`, `address`, `postalCode` | String | required | — |
| `companyLogoMediaId` | String | optional | — |
| `documents[]` | Array | embedded | docType, name, url, key, mimeType, size |

Collection: `companies`. Indexes: `{ userId: 1 }`, `{ userId: 1, createdAt: -1 }`.

---

## 3. App

Purpose: Merchant application — multi-app tenancy, branding, checkout/payment settings.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `userId` | ObjectId | required | → User |
| `name` | String | required | — |
| `description` | String | optional | — |
| `isActive` | Boolean | default: true | — |
| `brandName`, `brandLogo` | String | optional | — |
| `showProducts` … `showPayment` | Boolean | checkout UI toggles | — |
| `settings` | Object | embedded | branding, checkout, payment, notifications, security, integration |

Relations: one App → many Product, Payment, Gateway, Token, Customer, ApiKey, etc.

---

## 4. ApiKey

Purpose: Backend SDK key pairs (`pk_` / `sk_`) per app and environment.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `userId` | ObjectId | required | → User |
| `appId` | ObjectId | required | → App |
| `environment` | Enum | required | `sandbox`, `live` |
| `publicKey` | String | required, unique | — |
| `secretKeyHash` | String | required, unique | — |
| `secretKeyPrefix`, `secretKeyLast4` | String | required | — |
| `status` | Enum | default: active | `active`, `revoked` |
| `lastRotatedAt`, `lastUsedAt` | Date | optional | — |

Indexes: unique `{ appId, environment }` (partial active); unique `publicKey`, `secretKeyHash`.

---

## 5. Token

Purpose: Frontend client tokens (`tk_*`) for Web SDK with scopes and domain allowlist.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `userId` | ObjectId | required | → User |
| `appId` | ObjectId | required | → App |
| `libraryIds` | ObjectId[] | optional | → Library |
| `token` | String | required, unique | — |
| `name` | String | optional | — |
| `scopes` | String[] | default: [] | — |
| `environment` | Enum | default: sandbox | `sandbox`, `live` |
| `domains` | String[] | default: [] | — |
| `isActive` | Boolean | default: true | — |
| `lastUsed` | Date | optional | — |

Indexes: unique `token`.

---

## 6. Product

Purpose: Product catalog per app.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `userId`, `appId` | ObjectId | required | → User, App |
| `storeCode` | String | required, unique | — |
| `title` | String | required | — |
| `sku`, `description`, `category` | String | optional | — |
| `price`, `currency` | Number/String | optional | — |
| `media` | String[] | optional | — |
| `status` | Enum | default: active | `active`, `draft`, `archived` |
| `inventory`, `shipping`, `variants`, `seo` | Object | optional | nested commerce fields |
| `isActive` | Boolean | default: true | — |

Indexes: unique `storeCode`.

---

## 7. Customer

Purpose: End-customer records per app.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `userId`, `appId` | ObjectId | required | → User, App |
| `firstName`, `lastName`, `email`, `mobile` | String | optional | — |
| `language` | String | default: en | — |
| `defaultAddress` | Object | optional | street, city, state, country, zipCode |
| `marketingPreferences` | Object | optional | email, sms |
| `notes`, `tags` | String / String[] | optional | — |
| `sessionIds` | String[] | optional | links to Payment.sessionId |

Indexes: unique sparse `{ email, appId }`, `{ mobile, appId }`; `{ userId, appId }`.

---

## 8. Payment

Purpose: Payment sessions AND payment records (single collection).

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `userId`, `appId` | ObjectId | required | → User, App |
| `sessionId`, `sessionToken` | String | required, unique | — |
| `amount`, `currency`, `description` | Number/String | required | — |
| `customerEmail`, `customerPhone`, `customerName` | String | optional | — |
| `verifiedIdentifier`, `verifiedChannel` | String | optional | channel: email, phone |
| `customerLocked` | Boolean | default: false | — |
| `customerId` | ObjectId | optional | → Customer |
| `products[]` | Array | embedded | storeCode, title, price, quantity, productId |
| `metadata` | Mixed | optional | — |
| `gateway` | String | required | gateway name |
| `orderedGateways` | String[] | optional | — |
| `status` | Enum | default: init | init, pending, requires_action, completed, failed, cancelled, expired, refunded |
| `providerPaymentId`, `gatewayTransactionId` | String | optional | — |
| `redirectUrl`, `returnUrl`, `cancelUrl` | String | optional | — |
| `error`, `errorCode` | String | optional | — |
| `expiresAt` | Date | required | — |
| `completedAt`, `cancelledAt` | Date | optional | — |
| `brandName`, `brandLogo` | String | optional | checkout branding |
| `showProducts` … `showPayment` | Boolean | checkout UI toggles | — |

Indexes: unique `sessionId`, unique `sessionToken`.

---

## 9. Gateway

Purpose: App-scoped payment gateway configuration (encrypted credentials).

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `userId`, `appId` | ObjectId | required | → User, App |
| `name` | Enum | required | paypal, stripe, moyasar, myfatoorah |
| `config` | Object | embedded | clientId, clientSecret, secretKey, publishableKey, apiKey, environment |
| `defaultCurrency` | String | optional | — |
| `acceptedCurrencies`, `supportedPaymentMethods` | String[] | optional | — |
| `isDefault`, `isActive` | Boolean | optional | — |

Indexes: unique `{ appId, name, config.environment }`; partial unique default per app/env.

---

## 10. AvailableGateway

Purpose: Platform catalog of supported gateway types.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `name` | Enum | required, unique | paypal, stripe, moyasar, myfatoorah |
| `enabled` | Boolean | default: true | — |
| `displayName`, `description` | String | optional | — |
| `logo` | String | optional | Public URL to gateway logo |
| `availableCurrencies`, `supportedPaymentMethods` | String[] | optional | — |
| `availableCountries` | String[] | optional | ISO 3166-1 alpha-2 country codes |

---

## 11. GatewayRule

Purpose: Routing rules to select preferred gateway by conditions.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `userId`, `appId` | ObjectId | required | → User, App |
| `name`, `description` | String | required/optional | — |
| `ruleType` | Enum | required | amount, domain, currency, product, custom |
| `conditions[]` | Array | embedded | field, operator, value, value2 |
| `preferredGateway` | Enum | required | test, paypal, stripe, moyasar, myfatoorah |
| `score`, `priority` | Number | required | score 0–100 |
| `isActive` | Boolean | default: true | — |
| `environment` | Enum | required | sandbox, live |

---

## 12. GatewayRequest

Purpose: Merchant gateway onboarding workflow (KYC → gateway approval).

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `gateway` | String | required | — |
| `customer`, `company`, `website` | Object | required | KYC fields |
| `gatewayExtra`, `attachments[]` | Mixed/Array | optional | — |
| `status` | Enum | default: Draft | Draft → Live (10 states) |
| `history[]` | Array | embedded | status transitions |
| `corrections` | Object | optional | required, message, fields |
| `clientId` | ObjectId | required | → User |
| `publicKeySent` | Boolean | default: false | — |
| `gatewayExternalId` | String | optional | — |

---

## 13. DomainVerification

Purpose: Domain ownership verification for SDK tokenization.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `userId`, `appId` | ObjectId | required | → User, App |
| `domain` | String | required | — |
| `isVerified` | Boolean | default: false | — |
| `verifiedAt`, `lastVerifiedAt` | Date | optional | — |
| `challengeFileContent` | String | optional | well-known file content |

---

## 14. Verification / VerificationOTP

Purpose: Checkout customer OTP verification (email/mobile). `VerificationOTP` is legacy.

Key fields (Verification): `identifier`, `method` (email_otp, mobile_otp, social…), `code`, `appId`, `userId` (strings), `status` (pending→consumed), `expiresAt`, TTL index.

---

## 15. Currency

Purpose: Reference currency data with USD exchange rates.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `code` | String | required, unique, uppercase | — |
| `name`, `symbol` | String | optional | — |
| `exchangeRateToUSD` | Number | required, default: 1.0 | — |
| `isActive` | Boolean | default: true | — |

---

## 16. Media

Purpose: Uploaded files (S3/R2) per app.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `userId`, `appId` | ObjectId | required | → User, App |
| `type` | Enum | required | image, video, 3d, file |
| `url`, `name` | String | required | — |
| `extension`, `size`, `mimeType` | String/Number | optional | — |

---

## 17. Library

Purpose: SDK capability libraries (scopes/modules) assignable to tokens.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `identifier` | String | required, unique, lowercase | — |
| `name`, `description` | String | optional | — |
| `scopes`, `modules` | String[] | optional | — |
| `isActive` | Boolean | default: true | — |

---

## 18. PasskeyCredential

Purpose: WebAuthn passkey credentials per user.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `userId` | ObjectId | required | → User |
| `credentialId` | String | required, unique | — |
| `publicKey` | String | required | — |
| `counter` | Number | default: 0 | — |
| `deviceName`, `transports` | String / String[] | optional | — |
| `lastUsedAt` | Date | optional | — |

---

## 19. AuditLog

Purpose: Auth and CRUD audit trail.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `actorId` | ObjectId | optional | → User |
| `actorType` | Enum | default: user | user, system, merchant |
| `action` | String | required | — |
| `status` | Enum | default: success | success, failure |
| `ip`, `userAgent` | String | optional | — |
| `metadata` | Mixed | default: {} | — |

---

## 20–28. Notifications Module Entities

### EventType
Catalog of notifiable events. Fields: `key` (unique), `category`, `description`, `samplePayload`, `supportedChannels`, `supportedRecipients`, `isActive`.

### NotificationRule
Maps event → channel → recipient per app. Fields: `appId`, `eventType`, `channel`, `recipient`, `config`, `filters`, `isActive`.

### NotificationTemplate
Channel-specific templates. Fields: `appId` (null = platform default), `channel`, `eventType`, `recipient`, `locale`, `subject`, `body`.

### WebhookEndpoint
Merchant webhook URLs with encrypted secrets. Fields: `userId`, `appId`, `url`, `secretEnc`, `isActive`, `consecutiveFailures`, `disabledReason`.

### Delivery
Unified delivery log. Fields: `appId`, `ruleId`, `channel`, `eventType`, `status` (pending→disabled), `attempts`, `payloadSnapshot`, retry fields.

### Notification
In-app merchant inbox. Fields: `userId`, `appId`, `title`, `body`, `eventType`, `viewed`, `metadata`.

---

## Encryption Entities

### EncryptionKey
Per-purpose encryption keys. Fields: `userId`, `appId`, `name`, `purpose` (customer-data, gateway-communication, jwt-secret, general, gateway_request), `keyType`, encrypted key material.

### EncryptionConfig
System encryption config KV store. Fields: `key` (unique), `value`, `isEncrypted`, `isActive`.

---

## Admin Panel — Entity Usage (no new collections)

Admin panel V1 uses existing entities only. No schema migrations required.

| Entity | Admin operations | Notes |
|--------|------------------|-------|
| `User` | List, detail, `isActive` toggle, `role` toggle | Merchants = `role: user`; admins = `role: admin` |
| `App` | Read (via merchant detail), counts on dashboard | Cross-merchant aggregation |
| `Payment` | Read-only list/detail across all merchants | Support/search; no refund from admin V1 |
| `GatewayRequest` | List all, status/corrections/forward | Platform-scoped; `clientId` → User |
| `AuditLog` | Query all with filters | Admin-only read |
| `Currency` | Create, update | Platform reference data |
| `Library` | Create, update, delete | Platform SDK libraries |
| `AvailableGateway` | Create, update (enable/disable, methods, currencies) | Platform catalog |
| `Delivery` | Read across apps, redeliver | Notifications health module |
| `WebhookEndpoint` | Read across apps (disabled/failing) | Notifications health module |

**Indexes used by admin queries (existing or to add in build phase):**
- `User`: `{ role: 1, isActive: 1, createdAt: -1 }` — merchant list
- `Payment`: `{ status: 1, createdAt: -1 }`, `{ sessionId: 1 }` — cross-merchant search
- `GatewayRequest`: `{ status: 1, createdAt: -1 }` — onboarding board
- `Delivery`: `{ status: 1, createdAt: -1 }` — failed delivery health

---

## Entity Relationship Summary

```
User ─┬─ Company
      ├─ App ─┬─ Product, Customer, Payment, Gateway, GatewayRule
      │       ├─ Token, ApiKey, DomainVerification, Media
      │       └─ WebhookEndpoint, NotificationRule, Delivery
      ├─ PasskeyCredential
      └─ AuditLog (actor)

Payment ── embeds Product snapshots; refs Customer, Gateway (by name)
NotificationRule ── Delivery
Library ── Token (libraryIds)
GatewayRequest ── User (clientId); media refs by string ID
```
