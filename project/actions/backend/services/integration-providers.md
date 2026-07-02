## Module: Integration Providers

### SVC-EXT-AI · AnthropicProvider [external, Anthropic Claude, ai]
AI adapter (bound to AI_PROVIDER) for column analysis and dashboard generation, with full call logging and cost tracking.

**Methods:**
- `analyzeColumns(input: AiColumnAnalysisInput, jobId?): Promise<AiColumnAnalysisResult>` — prompts model for per-column descriptions, parses JSON
- `generateDashboard(input: AiDashboardGenerationInput, jobId?): Promise<AiDashboardGenerationResult>` — prompts model to assemble widgets from catalog, parses JSON

**Deps:** AiLogRepository · AiModelPricingRepository · Anthropic SDK · ConfigService (ANTHROPIC_API_KEY, AI_MODEL, AI_MAX_TOKENS)
**Side effects:** outbound AI API calls · AI-log writes
**Rules:** Prompts forbid raw data rows — only column metadata and samples · Responses must be valid JSON (non-JSON throws, logged FAILED) · Cost computed from token usage × resolved pricing (0 if missing) · Provider-agnostic interface (swappable behind AI_PROVIDER token)

---

### SVC-EXT-MAIL · MailjetProvider [external, Mailjet, email]
Mailjet email adapter (bound to MAIL_PROVIDER) for transactional email.

**Methods:**
- `send(options: SendMailOptions): Promise<void>` — sends email (to, subject, htmlBody, optional textBody); logs and rethrows on failure

**Deps:** Mailjet SDK · ConfigService (MAILJET_* credentials, mail.fromEmail, mail.fromName)
**Side effects:** outbound email
**Rules:** Sender identity from config only · Throws on send failure (callers typically wrap in best-effort .catch)

---

### SVC-EXT-STOR · R2StorageProvider [external, Cloudflare R2 (S3-compatible), storage]
Object storage adapter (bound to STORAGE_PROVIDER) for CSV files.

**Methods:**
- `upload(options: UploadFileOptions): Promise<string>` — puts object, returns key
- `getPresignedUrl(options: PresignedUrlOptions): Promise<string>` — short-lived signed URL (default 1h)
- `delete(key: string): Promise<void>` — removes object
- `download(key: string): Promise<Buffer>` — streams object into Buffer

**Deps:** AWS S3 SDK (S3Client, presigner) · ConfigService (R2_* settings: storage.bucketName, storage.endpoint, storage.accessKeyId, storage.secretAccessKey)
**Side effects:** network object operations
**Rules:** Bucket and credentials from config only; region fixed to auto for R2 · S3-compatible (swapping to AWS S3/MinIO requires only config + token rebinding)

---

### SVC-EXT-PAY · PayUpProvider [external, PayUp, payment]
PayUp payment adapter (bound to PAYMENT_PROVIDER) implementing hosted-checkout backend integration; DefaultPaymentProvider is a safe no-op fallback.

**Methods:**
- `createCheckoutSession(input): Promise<{ sessionId, sessionToken, redirectUrl, status, amount, currency }>` — POST /v1/auth then POST /v1/checkout/session
- `getCheckoutSession(sessionToken): Promise<{ status, ... }>` — GET /v1/checkout/session/{token} for authoritative status
- `validateWebhookSignature(payload: Buffer, signature: string): boolean` — reserved for future webhook events
- `processWebhookEvent(event: any): Promise<void>` — reserved for future webhook events

**Deps:** PayUp REST API (global fetch) · ConfigService (payup.apiBaseUrl, payup.publicKey, payup.secretKey, app.apiBaseUrl, app.frontendUrl)
**Side effects:** outbound PayUp API calls
**Rules:** API keys and SDK token never leave provider or appear in responses/logs · Base URL chosen by NODE_ENV unless PAYUP_API_BASE_URL set · DefaultPaymentProvider.createCheckoutSession throws when selected without configuration

---

### SVC-EXT-OAUTH · OAuth Google/Microsoft [external, Google/Microsoft, auth] — STUB, partially implemented
OAuth login — config and provider linking exist, but no integration adapter and the callback is a stub.

**Methods:**
- none dedicated — relies on AuthService.oauthLogin(provider, oauthUserId, email, name, ip?)

**Deps:** UserRepository (via AuthService) · AuthService · ConfigService (GOOGLE_*/MICROSOFT_* client config)
**Side effects:** none (not wired)
**Rules:** OAuth identity links to existing email if present, otherwise creates new EDITOR user · End-to-end flow not wired (no adapter, callback is stub)
