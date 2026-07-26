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
