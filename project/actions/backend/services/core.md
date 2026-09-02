# Services — Remaining Modules

## Module: Products

### SVC-PR01 · ProductService [domain, internal, Products]
- Methods: `createProduct`, `findOrCreateAdHocProduct`, `listProducts`, `listProductsPaginated`, `listProductsLite`, `getProduct`, `updateProduct`, `deleteProduct`
- Deps: `ProductRepository`, `AppRepository`, `ICurrencyService`, `AuditService`
- Notes: prices are integer `*Minor`; `currency` required; `currencyExponent` snapshotted; `product.created` / `product.updated` audit with `Money` metadata

## Module: Tokens

### SVC-T01 · TokenService [domain, internal, Tokens]
- Methods: `createToken`, `listTokens`, `getToken`, `listTokensPaginated`, `listTokensLite`, `revokeToken`, `deleteToken`, `addDomain`, `removeDomain`, `updateToken`
- Deps: `TokenRepository`, `AppRepository`, `LibraryRepository`

## Module: Customers

### SVC-CU01 · CustomerService [domain, internal, Customers]
- Methods: `findOrCreateCustomer`, `createCustomer`, `getCustomerById`, `updateCustomer`, `deleteCustomer`, `getCustomersByApp`, `listCustomersPaginated`, `getCustomerPaymentHistory`
- Deps: `CustomerRepository`, `PaymentRepository`
- Notes: payment history amounts are `Money` objects; aggregations use `amountMinor`

## Module: Profile

### SVC-PF01 · CompanyService [domain, internal, Profile]
- Methods: `listByUser`, `getOwned`, `create`, `update`, `delete`, `addDocument`, `removeDocument`
- Deps: `CompanyRepository`, `S3Service`

## Module: Verification

### SVC-V01 · VerificationService [domain, internal, Verification]
- Methods: `registerStrategy`, `requestVerification`, `verify`, `generateVerificationToken`, `getVerification`, `getAvailableMethods`
- Deps: EmailOTPStrategy, MobileOTPStrategy, `Verification` model, `SdkTokenService`

### SVC-V02 · EmailOTPStrategy [integration, external, Verification]
- Deps: `EmailService`

### SVC-V03 · MobileOTPStrategy [integration, external, Verification]
- Deps: SMS provider

## Module: Dashboard

### SVC-DB01 · DashboardService [domain, internal, Dashboard]
- Methods: `getDashboard`, `listTokens`
- Notes: revenue / daily amounts / session amounts returned as `Money`; aggregations `$sum` `amountMinor`
- Deps: `AppRepository`, `GatewayRepository`, `ProductRepository`, `TokenRepository`, `PaymentRepository`
- Used by: merchant panel `/reports/dashboard` routes
- Side effects: read-only aggregations for merchant dashboard stats and chart data

## Module: Core

### SVC-CO01 · DomainVerificationService [integration, external, Core]
- Methods: `generateWellKnownFile`, `verifyDomain`, `isDomainVerified`, `getVerifiedDomains`
- Deps: DNS lookup, axios, `DomainVerification` model

### SVC-CO02 · MediaService [domain, internal, Core]
- Methods: `uploadMedia`, `listMedia`, `getMedia`, `deleteMedia`
- Deps: `MediaRepository`, `S3Service`

### SVC-CO03 · LibraryService [domain, internal, Core]
- Methods: CRUD for SDK libraries
- Deps: `LibraryRepository`

### SVC-CO04 · RateLimitService [integration, external, Core]
- Deps: Redis, `rate-limiter-flexible`

### SVC-CO05 · PlatformSeedService [domain, internal, Infrastructure]
- Methods: `seed(options: { datasets, dryRun, confirm })` — production-safe selectable seed; returns per-dataset `{ created, skipped, failed }`
- CLI: `src/scripts/seed-production.ts` · `npm run seed:prod`
- Datasets: `currencies`, `available-gateways`, `libraries`, `admin-user`, `notifications` (default = all of these)
- Deps: `CurrencyRepository`, `ICurrencyService` (cache invalidation only), `AvailableGatewayService`, `LibraryService` / `LibraryRepository`, `AdminUser` model, `seedNotificationData`
- Catalogs: `constants/seed-catalogs.ts` (lists only; local seed scripts import the same lists)
- Rules: RULE-024 — always production policy (no `--clear`, no encryption, no gateway-rules, no admin overwrite). `--confirm` required for writes. `--dry-run` writes nothing. Unknown / forbidden dataset names refuse the run. Not registered in `startServer()`.
- Side effects: inserts missing platform rows; may update library scopes/modules and gateway catalog metadata except `enabled`; never updates existing AdminUser or live FX rate fields

## Module: Currency

### SVC-CR01 · CurrencyService [domain, internal, Currency]
- Implements: **`ICurrencyService`** — every consumer depends on the interface, never the class
- Methods: `getAllCurrencies`, `getCurrencyByCode`, `getCurrencyExponent`, `getRateFromUsd`, `getExchangeRate`, `convertCurrency`, `getDefaultCurrency`, `getAcceptedCurrencies`, `validateCurrency`, cache invalidation
- Deps: `CurrencyRepository`, `GatewayRepository`, `CacheService`
- Notes: Conversion is integer-space via `money/convert.ts` (`amountMinor` in/out). `rateFromUsd` is units per 1 USD and is **never rounded**. Redis TTL comes from `FX_CACHE_TTL_SECONDS` (30 min). Logs a staleness warning when the newest `rateUpdatedAt` exceeds `FX_MAX_STALENESS_HOURS`; conversions still succeed on stale rates so an FX outage never blocks checkout. Inversion guard: `10000` USD → `37545` SAR at `rateFromUsd(SAR)=3.7545`.

### SVC-CR02 · FastForexRateProvider [integration, external, Currency]
- Implements: **`IExchangeRateProvider`** — `fetchRates(base) → ExchangeRateSnapshot`
- Deps: axios, `FASTFOREX_*` config
- Notes: Lives in `external-services/fastforex/`. The only place fastFOREX URLs and response field names appear. Resolved through a factory reading `FX_PROVIDER`, which fails fast on an unknown value. Rates are stored exactly as returned — no scaling, rounding, or inversion.

### SVC-CR03 · ExchangeRateSyncService [domain, internal, Currency]
- Implements: **`IExchangeRateSyncService`** — `syncNow(reason)`, `getSyncStatus()`
- Deps: `IExchangeRateProvider`, `CurrencyRepository`, `CacheService`, `AuditService`
- Notes: Validates the whole snapshot before any write (no partial writes), bulk-upserts every currency, stamps `rateUpdatedAt` / `rateProviderUpdatedAt` / `rateSource`, invalidates currency cache keys so new rates are live immediately, and writes one `currency.rates.synced` audit entry. Provider failures log a structured error and leave stored rates untouched. Driven by the `fx-rates` BullMQ worker (repeatable, `FX_SYNC_INTERVAL_MS`, gated by `FX_SYNC_ENABLED`) and by the admin manual-trigger endpoint.

## Module: Audit

### SVC-AU01 · AuditService [domain, internal, Audit]
- Methods: `log`, `auditFromRequest`, `query`, `getByActorId`, `getByAction`; `assertAuditMoneyMetadata`
- Deps: `AuditLogRepository`
- Notes: Money in `metadata` must be a `Money` object. New events: `product.created`, `product.updated`, `payment.session.created`, `payment.refund.issued`

## Module: Email

### SVC-EM01 · EmailService [integration, external, Email]
- Methods: `sendOTPEmail`, `sendWelcomeEmail`, `sendPasswordResetEmail`
- Deps: Mailjet, n8n webhook (welcome)

## Module: Storage

### SVC-ST01 · S3Service [integration, external, Storage]
- Methods: `uploadFile`, `deleteFile`, `getFile`, `extractKeyFromUrl`
- Deps: AWS S3 SDK (Cloudflare R2)

## Module: Encryption

### SVC-EN01 · DbEncryptionService [domain, internal, Encryption]
### SVC-EN02 · EncryptionConfigService [domain, internal, Encryption]
### SVC-EN03 · getEncryptionService [domain, internal, Encryption] — factory
