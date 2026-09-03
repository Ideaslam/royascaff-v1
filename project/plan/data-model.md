# Data Model

MongoDB via Mongoose. PK: `_id: ObjectId`. Timestamps: `createdAt`, `updatedAt` (unless noted).

**Hub entities:** `Merchant` (workspace/organization) and `App` (merchant application) anchor most app-scoped resources. `User` is a personal identity that gains access to merchants via `MerchantMember`.

---

## 1. User

Purpose: Personal identity — authentication, settings, 2FA, OAuth. Users access merchants via MerchantMember.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `email` | String | required, unique | — |
| `password` | String | optional (OAuth users) | — |
| `name` | String | required | — |
| `photo` | String | optional | — |
| `isActive` | Boolean | default: true | — |
| `settings` | Object | embedded | security, notifications, display, privacy groups |
| `twoFactor` | Object | embedded | enabled, secret, backupCodes |
| `oauthAccounts[]` | Array | embedded | provider, providerUserId, email |
| `passwordResetTokenHash` | String | optional | — |
| `passwordResetExpires` | Date | optional | — |

Relations: one User → many MerchantMember, PasskeyCredential, AuditLog (as actor).
Indexes: unique `email`.

---

## 1b. Merchant

Purpose: Workspace/organization representing a business. All business resources (Apps, Products, Payments, etc.) belong to a Merchant.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `name` | String | required | — |
| `slug` | String | required, unique, lowercase, URL-safe | — |
| `logo` | String | optional | — |
| `status` | Enum | default: active | `active`, `suspended`, `deleted` |
| `website` | String | optional | — |
| `description` | String | optional | — |
| `industry` | String | optional | — |
| `address` | Object | optional | street, city, state, country, postalCode |
| `phone` | String | optional | — |
| `timezone` | String | optional | — |
| `contactName` | String | optional | — |
| `contactEmail` | String | optional | — |
| `contactPhone` | String | optional | — |
| `onboardingCompleted` | Boolean | default: false | — |

Relations: one Merchant → many App, Company, MerchantMember, and all business resources.
Indexes: unique `slug`; `{ status: 1, createdAt: -1 }`.

---

## 1c. MerchantMember

Purpose: Links users to merchants with workspace roles. A user can belong to multiple merchants.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `userId` | ObjectId | required | → User |
| `merchantId` | ObjectId | required | → Merchant |
| `role` | Enum | required | `owner`, `admin`, `member`, `developer` |
| `joinedAt` | Date | default: now | — |
| `invitedBy` | ObjectId | optional | → User |

Relations: belongs to User and Merchant.
Indexes: unique `{ userId, merchantId }`; `{ merchantId: 1, role: 1 }`.

---

## 1d. MerchantInvite

Purpose: Pending email invitations to join a merchant workspace.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `merchantId` | ObjectId | required | → Merchant |
| `email` | String | required | — |
| `role` | Enum | required | `admin`, `member`, `developer` |
| `token` | String | required, unique | — |
| `expiresAt` | Date | required | 3 days from creation |
| `invitedBy` | ObjectId | required | → User |
| `status` | Enum | default: pending | `pending`, `accepted`, `expired`, `revoked` |

Indexes: unique `token`; `{ merchantId: 1, status: 1 }`; TTL index on `expiresAt` for expired cleanup.

---

## 1e. AdminUser

Purpose: Platform administrator — completely isolated from merchant users. Manages merchants, platform config, gateway onboarding.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `email` | String | required, unique | — |
| `password` | String | required | — |
| `name` | String | required | — |
| `photo` | String | optional | — |
| `isActive` | Boolean | default: true | — |
| `twoFactor` | Object | embedded | enabled, secret, backupCodes |
| `lastLoginAt` | Date | optional | — |

Indexes: unique `email`.

---

## 2. Company

Purpose: Merchant business entity for KYC / gateway onboarding. One merchant can have many companies.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `merchantId` | ObjectId | required | → Merchant |
| `createdBy` | ObjectId | required | → User |
| `name` | String | required | — |
| `crNumber` | String | required | — |
| `vatNumber` | String | optional | — |
| `country`, `city`, `address`, `postalCode` | String | required | — |
| `companyLogoMediaId` | String | optional | — |
| `documents[]` | Array | embedded | docType, name, url, key, mimeType, size |

Collection: `companies`. Indexes: `{ merchantId: 1 }`, `{ merchantId: 1, createdAt: -1 }`.

---

## 3. App

Purpose: Merchant application — multi-app tenancy, branding, checkout/payment settings.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `merchantId` | ObjectId | required | → Merchant |
| `createdBy` | ObjectId | required | → User |
| `name` | String | required | — |
| `description` | String | optional | — |
| `isActive` | Boolean | default: true | — |
| `brandName`, `brandLogo` | String | optional | — |
| `showProducts` … `showPayment` | Boolean | checkout UI toggles | — |
| `settings` | Object | embedded | branding, checkout, payment (`minimumAmountMinor`, `maximumAmountMinor` integers), notifications, security, integration |

Relations: one App → many Product, Payment, Gateway, Token, Customer, ApiKey, etc.

---

## 4. ApiKey

Purpose: Backend SDK key pairs (`pk_` / `sk_`) per app and environment.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `merchantId` | ObjectId | required | → Merchant |
| `createdBy` | ObjectId | required | → User |
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
| `merchantId` | ObjectId | required | → Merchant |
| `createdBy` | ObjectId | required | → User |
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
| `merchantId`, `appId` | ObjectId | required | → Merchant, App |
| `createdBy` | ObjectId | required | → User |
| `storeCode` | String | required, unique | — |
| `title` | String | required | — |
| `sku`, `description`, `category` | String | optional | — |
| `priceMinor`, `currency`, `currencyExponent` | Number/String | `currency` required; amounts are integer minor units; `currencyExponent` snapshotted | — |
| `compareAtPriceMinor`, `unitPriceMinor`, `costPerItemMinor` | Number | optional integers | — |
| `variants[].priceMinor` | Number | optional integer | — |
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
| `merchantId`, `appId` | ObjectId | required | → Merchant, App |
| `createdBy` | ObjectId | optional | → User |
| `firstName`, `lastName`, `email`, `mobile` | String | optional | — |
| `language` | String | default: en | — |
| `defaultAddress` | Object | optional | street, city, state, country, zipCode |
| `marketingPreferences` | Object | optional | email, sms |
| `notes`, `tags` | String / String[] | optional | — |
| `sessionIds` | String[] | optional | links to Payment.sessionId |

Indexes: unique sparse `{ email, appId }`, `{ mobile, appId }`; `{ merchantId, appId }`.

---

## 8. Payment

Purpose: Payment sessions AND payment records (single collection).

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `merchantId`, `appId` | ObjectId | required | → Merchant, App |
| `createdBy` | ObjectId | optional | → User |
| `sessionId`, `sessionToken` | String | required, unique | — |
| `amountMinor`, `currency`, `currencyExponent`, `description` | Number/String | required | integer minor units; `currencyExponent` snapshotted; charged (gateway) values |
| `taxAmountMinor` | Number | optional | integer tax, first-class (not metadata) |
| `customerEmail`, `customerPhone`, `customerName` | String | optional | — |
| `verifiedIdentifier`, `verifiedChannel` | String | optional | channel: email, phone |
| `customerLocked` | Boolean | default: false | — |
| `customerId` | ObjectId | optional | → Customer |
| `products[]` | Array | embedded | storeCode, title, `priceMinor`, currency, quantity, productId, `sessionPriceMinor`, imageUrl, `paidPriceMinor`, paidCurrency. Catalog prices stay in original currency; `paidPriceMinor` is the charged unit in gateway currency |
| `currencyConversion` | Object | optional | `originalAmountMinor`, originalCurrency, `convertedAmountMinor`, convertedCurrency, exchangeRate (float — a rate is not money). Always set on new sessions (`exchangeRate: 1` when same currency) |
| `metadata` | Mixed | optional | may duplicate `currencyConversion` |
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

Indexes: unique `sessionId`, unique `sessionToken`, plus three compound indexes serving the dashboard analytics aggregations (EP-DB03…EP-DB10) — `{merchantId, createdAt}`, `{merchantId, status, createdAt}`, `{merchantId, appId, createdAt}`. `merchantId` leads every one of them because it is the first term of every analytics filter (RULE-017).

**`completedAt` is not a reliable time axis.** Gateway webhooks (`webhook-service.ts`) flip `status` to `completed` without stamping `completedAt`; only `payment-status-sync-service.ts` sets it. Analytics therefore bucket on `createdAt`, which `{ timestamps: true }` always populates — revenue is attributed to the session's creation date. Filtering money metrics on `completedAt` would silently drop every webhook-completed payment.

---

## 9. Gateway

Purpose: App-scoped payment gateway configuration (encrypted credentials).

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `merchantId`, `appId` | ObjectId | required | → Merchant, App |
| `createdBy` | ObjectId | required | → User |
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
| `enabled` | Boolean | default: true | `false` = hidden from merchants & blocked in payments |
| `displayName`, `description` | String | optional | — |
| `logo` | String | optional | Public URL to gateway logo |
| `availableCurrencies`, `supportedPaymentMethods` | String[] | optional | — |
| `availableCountries` | String[] | optional | ISO 3166-1 alpha-2 country codes |

---

## 11. GatewayRule

Purpose: Routing rules to select preferred gateway by conditions.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `merchantId`, `appId` | ObjectId | required | → Merchant, App |
| `createdBy` | ObjectId | required | → User |
| `name`, `description` | String | required/optional | — |
| `ruleType` | Enum | required | amount, domain, currency, product, custom |
| `conditions[]` | Array | embedded | field (`amountMinor`, `productPriceMinor`, currency, …), operator, value, value2 |
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
| `clientId` | ObjectId | required | → Merchant |
| `publicKeySent` | Boolean | default: false | — |
| `gatewayExternalId` | String | optional | — |

---

## 13. DomainVerification

Purpose: Domain ownership verification for SDK tokenization.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `merchantId`, `appId` | ObjectId | required | → Merchant, App |
| `createdBy` | ObjectId | required | → User |
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

Purpose: Reference currency data — live USD exchange rates, ISO 4217 minor-unit exponents, and rate provenance. Rates are refreshed hourly by the `fx-rates` background job and served through `ICurrencyService` (Redis, 30 min TTL).

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `code` | String | required, unique, uppercase | — |
| `name`, `symbol` | String | optional | — |
| `rateFromUsd` | Number | required, default: 1.0 | — |
| `minorUnitExponent` | Number | required, `0 \| 2 \| 3`, default: 2 | — |
| `rateUpdatedAt` | Date | optional | — |
| `rateProviderUpdatedAt` | Date | optional | — |
| `rateSource` | Enum | `fastforex \| manual \| seed` | — |
| `isActive` | Boolean | default: true | — |

**`rateFromUsd`** is units of this currency per **1 USD**, stored exactly as the rate provider returns it (`SAR: 3.7545` means 1 USD = 3.7545 SAR). `USD` is always `1`. This is the inverse of the pre-change-011 `exchangeRateToUSD`; conversion is `amount / from.rateFromUsd * to.rateFromUsd`, and the rate is never rounded.

**`minorUnitExponent`** is the ISO 4217 decimal count — `2` for USD/EUR/GBP/SAR/AED/QAR, **`3` for KWD/BHD/OMR/JOD/TND/IQD/LYD**, `0` for JPY/KRW. Providers do not supply it; it is seeded from `constants/iso-currency-exponents.ts` and is admin-editable. All currencies the provider returns are stored; only supported ones are `isActive`.

---

## 16. Media

Purpose: Uploaded files (S3/R2) per app.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `merchantId`, `appId` | ObjectId | required | → Merchant, App |
| `createdBy` | ObjectId | required | → User |
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
Merchant webhook URLs with encrypted secrets. Fields: `merchantId`, `appId`, `createdBy`, `url`, `secretEnc`, `isActive`, `consecutiveFailures`, `disabledReason`.

### Delivery
Unified delivery log. Fields: `appId`, `ruleId`, `channel`, `eventType`, `status` (pending→disabled), `attempts`, `payloadSnapshot`, retry fields.

### Notification
In-app merchant inbox. Fields: `merchantId`, `appId`, `title`, `body`, `eventType`, `viewed`, `metadata`.

---

## Encryption Entities

### EncryptionKey
Per-purpose encryption keys. Fields: `merchantId`, `appId`, `name`, `purpose` (customer-data, gateway-communication, jwt-secret, general, gateway_request), `keyType`, encrypted key material.

### EncryptionConfig
System encryption config KV store. Fields: `key` (unique), `value`, `isEncrypted`, `isActive`.

---

## Admin Panel — Entity Usage

Admin panel uses `AdminUser` for authentication (separate collection). Manages `Merchant` entities and platform config.

| Entity | Admin operations | Notes |
|--------|------------------|-------|
| `AdminUser` | Login, profile, 2FA | Isolated admin identity collection |
| `Merchant` | List, detail, suspend/activate (`status` toggle) | Platform-scoped workspace management |
| `MerchantMember` | Read (via merchant detail) | View team composition |
| `App` | Read (via merchant detail), counts on dashboard | Cross-merchant aggregation |
| `Payment` | Read-only list/detail across all merchants | Support/search; no refund from admin V1 |
| `GatewayRequest` | List all, status/corrections/forward | Platform-scoped; `clientId` → Merchant |
| `AuditLog` | Query all with filters | Admin-only read |
| `Currency` | Create, update | Platform reference data |
| `Library` | Create, update, delete | Platform SDK libraries |
| `AvailableGateway` | Create, update (enable/disable, methods, currencies) | Platform catalog |
| `Delivery` | Read across apps, redeliver | Notifications health module |
| `WebhookEndpoint` | Read across apps (disabled/failing) | Notifications health module |

**Indexes used by admin queries:**
- `Merchant`: `{ status: 1, createdAt: -1 }` — merchant list
- `Payment`: `{ status: 1, createdAt: -1 }`, `{ sessionId: 1 }` — cross-merchant search
- `GatewayRequest`: `{ status: 1, createdAt: -1 }` — onboarding board
- `Delivery`: `{ status: 1, createdAt: -1 }` — failed delivery health

---

## Entity Relationship Summary

```
User ─── MerchantMember ─── Merchant ─┬─ Company
    │                                  ├─ App ─┬─ Product, Customer, Payment, Gateway, GatewayRule
    │                                  │       ├─ Token, ApiKey, DomainVerification, Media
    │                                  │       └─ WebhookEndpoint, NotificationRule, Delivery
    │                                  └─ MerchantInvite
    ├─ PasskeyCredential
    └─ AuditLog (actor)

AdminUser (isolated — platform admin identity)

Payment ── embeds Product snapshots; refs Customer, Gateway (by name)
NotificationRule ── Delivery
Library ── Token (libraryIds)
GatewayRequest ── Merchant (clientId); media refs by string ID
```
