# Custom Feature Rules

## Module: Creative / AI Generation

### Feature: Creative Pipeline v2
- Type: AI, Async Job
- Must:
  - enqueue jobs to Mongo `aiJobQueue`; poller advances status
  - use workspace encrypted Claude API key (never from FE)
  - persist HTML artifacts to R2/S3 and link on proposal
  - track `creativePipeline` phase state on `aiJobs`
- Provider: Anthropic Claude via `infrastructure/claude` + `creative-pipeline/`
- Must not:
  - call Anthropic from Angular
  - treat Message Batches as realtime (known latency)

### Feature: Legacy Stream Generation
- Type: AI
- Must: support `POST /api/ai-jobs/stream` one-shot path for smaller jobs
- Provider: Claude
- Must not: block creative pipeline path

### Feature: OpenAI / Gemini providers
- Type: AI
- Must: remain disabled until configured
- Provider: stubs in seed (`aiProviders`) — OpenAI throws not configured
- Must not: pretend multi-provider is production-ready

## Module: Proposals

### Feature: Proposal Delivery Notification
- Type: Integration
- Must: send via backend Mailjet; WhatsApp via Meta templates when enabled
- Provider: Mailjet, Meta WhatsApp
- Must not: send from frontend SDKs

### Feature: Public Proposal Links
- Type: Business Logic, Security
- Must: expose only via `/api/public/proposals/:id/links` without workspace JWT
- Must not: leak workspace-private fields beyond public link contract

### Feature: PDF Export
- Type: Business Logic
- Must: [gap] currently FE `window.print` only — no server PDF
- Provider: N/A
- Must not: claim pixel-perfect PDF until server renderer exists (see `docs/refactor-proposal-generator.md`)

## Module: Settings & Config

### Feature: Secret API Key Storage
- Type: Security
- Must: encrypt Claude key at rest (`apiKeyEncrypted`); return mask only to FE
- Provider: EncryptionService + SETTINGS_ENCRYPTION_KEY
- Must not: persist plaintext apiKey after encryption rollout

## Module: Integrations

### Feature: Object Storage
- Type: Storage
- Must: use S3-compatible client pointed at R2 endpoint from env
- Provider: AWS SDK → Cloudflare R2
- Must not: hardcode bucket credentials in FE

### Feature: Redis Cache
- Type: Caching
- Must: use Redis for cache only (not job queue)
- Provider: ioredis
- Must not: assume Bull/BullMQ present

## Module: Auth

### Feature: Route Protection (Web)
- Type: Security
- Must: protect MainLayout with authGuard (currently commented — **violation / gap**)
- Provider: Angular authGuard + interceptor
- Must not: rely solely on API 401 for UX security

## Module: Admin

### Feature: Workspace Data Reset
- Type: Business Logic, Security
- Must: require admin or settings.manage; wipe only intended collections
- Must not: expose without permission check
