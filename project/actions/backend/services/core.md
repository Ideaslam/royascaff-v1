# Services — Remaining Modules

## Module: Products

### SVC-PR01 · ProductService [domain, internal, Products]
- Methods: `createProduct`, `findOrCreateAdHocProduct`, `listProducts`, `listProductsPaginated`, `listProductsLite`, `getProduct`, `updateProduct`, `deleteProduct`
- Deps: `ProductRepository`, `AppRepository`

## Module: Tokens

### SVC-T01 · TokenService [domain, internal, Tokens]
- Methods: `createToken`, `listTokens`, `getToken`, `listTokensPaginated`, `listTokensLite`, `revokeToken`, `deleteToken`, `addDomain`, `removeDomain`, `updateToken`
- Deps: `TokenRepository`, `AppRepository`, `LibraryRepository`

## Module: Customers

### SVC-CU01 · CustomerService [domain, internal, Customers]
- Methods: `findOrCreateCustomer`, `createCustomer`, `getCustomerById`, `updateCustomer`, `deleteCustomer`, `getCustomersByApp`, `listCustomersPaginated`, `getCustomerPaymentHistory`
- Deps: `CustomerRepository`, `PaymentRepository`

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

## Module: Currency

### SVC-CR01 · CurrencyService [domain, internal, Currency]
- Methods: `getAllCurrencies`, `getCurrencyByCode`, `convertCurrency`, `validateCurrency`, cache invalidation
- Deps: `CurrencyRepository`, `GatewayRepository`, `CacheService`

## Module: Audit

### SVC-AU01 · AuditService [domain, internal, Audit]
- Methods: `log`, `auditFromRequest`, `query`, `getByActorId`, `getByAction`
- Deps: `AuditLogRepository`

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
