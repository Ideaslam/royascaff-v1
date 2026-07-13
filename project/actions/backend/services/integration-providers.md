## Module: Integration Providers

### SVC-EXT-AI · AiProviderRegistry + AnthropicProvider [external, Anthropic Claude, ai] *(updated change-016)*
Pluggable AI provider system. `AiProviderRegistry` holds named `AiProviderInterface` implementations; callers request by provider id or use the workspace default.

**AiProviderRegistry methods:**
- `register(id: string, provider: AiProviderInterface): void` — called by each provider's `onModuleInit()`
- `resolve(id?: string): AiProviderInterface` — returns named provider or default (from `AI_PROVIDER` env)

**AnthropicProvider methods (implements AiProviderInterface):**
- `generate(request: AiGenerateRequest, jobId?): Promise<AiGenerateResult>` — generic completion; renders via `PromptTemplateService`, calls Claude, returns `{ text, usage, cost }`
- `stream(request: AiGenerateRequest, jobId?): AsyncGenerator<string>` — streaming variant
- `analyzeColumns(input: AiColumnAnalysisInput, jobId?): Promise<AiColumnAnalysisResult>` — column description generation
- `generateDashboard(input: AiDashboardGenerationInput, jobId?): Promise<AiDashboardGenerationResult>` — widget assembly from catalog

**Deps:** AiProviderRegistry · PromptTemplateService · AiLogRepository · AiModelPricingRepository · Anthropic SDK · ConfigService
**Side effects:** outbound AI API calls · AI-log writes
**Rules:** Prompts always go through `PromptTemplateService` (no inline strings) · Raw data rows never sent to AI · Responses must be valid JSON for structured outputs · Cost computed from token usage × pricing

---

### SVC-EXT-MAIL · MailjetProvider [external, Mailjet, email]
Mailjet email adapter (bound to MAIL_PROVIDER) for transactional email.

**Methods:**
- `send(options: SendMailOptions): Promise<void>` — sends email (to, subject, htmlBody, optional textBody); logs and rethrows on failure

**Deps:** Mailjet SDK · ConfigService (MAILJET_* credentials, mail.fromEmail, mail.fromName)
**Side effects:** outbound email
**Rules:** Sender identity from config only · Throws on send failure (callers typically wrap in best-effort .catch)

---

### SVC-EXT-MAIL-TPL · MailTemplateService [internal, application, email] *(change-056)*
Loads HTML email templates from `src/integrations/mail/templates/` and renders `{{var}}` placeholders.

**Methods:**
- `render(templateName: string, vars: Record<string, string>): string` — reads `{templateName}.html`, interpolates variables

**Templates:** `email-verification.en|ar`, `welcome.en|ar` — Roya brand styling (purple header, coral CTA)

**Deps:** filesystem (bundled via nest-cli assets)
**Rules:** Templates must use inline CSS for email client compatibility · Never embed secrets or raw tokens beyond verify URL

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
