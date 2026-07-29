# Services — Safqa API · Integrations

### SVC-INT-01 · S3Service [integration, external, Storage]
- Status: done
- Methods: upload/get/delete objects; public URL helpers
- Deps: AWS SDK v3 (R2 endpoint)
- Side effects: file

### SVC-INT-02 · MailjetService [integration, external, Email]
- Status: done
- Methods: send transactional emails (verify, reset, proposal, contract)
- Deps: axios + Mailjet HTTP API
- Side effects: email
- Rules (proposal email):
  - `ProposalTemplateData` includes `workspace_name` / `workspace_logo` / `workspace_email` / `workspace_phone` / `workspace_address` (+ client + URLs)
  - Templates `proposals.template.{en,ar}.md` use Settings-backed vars (logo img, about heading, signature, footer) — no hardcoded Roya Marketing Solution / `media.roya.marketing/roya.png` / `roya.marketing`
  - Subject fallback: client name → workspace name → generic “Your proposal documents” (never `'Roya'`)
  - Mailjet From remains env `MAILJET_FROM_*` (not per-workspace SMTP)

### SVC-INT-03 · MetaWhatsAppService [integration, external, Messaging]
- Status: done
- Methods: send WhatsApp template messages for proposals
- Deps: Meta Graph API
- Side effects: external API

### SVC-INT-04 · CacheService [integration, external, Cache]
- Status: done
- Methods: get/set/delete via RedisCacheService
- Deps: ioredis
- Side effects: none

### SVC-INT-05 · EncryptionService [domain, internal, Security]
- Status: done
- Methods: encrypt/decrypt settings secrets (AES-GCM)
- Deps: SETTINGS_ENCRYPTION_KEY
- Side effects: none
