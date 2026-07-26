# Modules & Features

## 1. Auth
- Scope: BE `src/modules/auth` + FE auth pages + `core/services/auth*`
- Audience: public and authenticated
- Entities: `user`, `auth_tokens`, `workspaces`
- Depends on: Users, Integrations (Mailjet), Infrastructure

### Features
1. **Login / Refresh / Logout** [both] — JWT access + refresh in localStorage
2. **Registration & Email Verification** [both] — Mailjet verification
3. **Password Reset** [both] — tokenized reset email
4. **Profile & Avatar** [both] — self-service profile + S3 avatar
5. **Bootstrap Context** [both] — user + role permissions + workspace

## 2. Users
- Scope: BE `modules/data/user` + FE `/users` + admin user APIs
- Audience: admin / managers with user.* permissions
- Entities: `user`
- Depends on: Auth, Roles

### Features
1. **Team User Management** [both] — CRUD + lookup/lite
2. **Admin User Password Reset** [backend-only] — `user.resetPassword`

## 3. Clients
- Scope: BE `modules/data/clients` + FE `/clients`
- Audience: sales roles
- Entities: `clients`
- Depends on: Integrations (S3)

### Features
1. **Client CRM** [both] — CRUD, lite pickers
2. **Client Logo** [both] — upload/delete to R2

## 4. Services Catalog
- Scope: BE services + service-categories modules + FE pages
- Audience: internal sales ops
- Entities: `services`, `service-categories`
- Depends on: —

### Features
1. **Service Categories** [both] — bilingual categories with sortOrder
2. **Services Catalog** [both] — priced services with bilingual SOW fields

## 5. Proposals
- Scope: BE proposals modules + FE proposals/proposal/output
- Audience: sales + public viewers
- Entities: `proposals`
- Depends on: Clients, Services, AI Jobs, Integrations

### Features
1. **Proposal CRUD & Dashboard** [both] — list/search/status/dashboard charts
2. **Technical/Financial Documents** [both] — HTML edit + S3 store by lang
3. **Proposal Delivery** [both] — email (+ WhatsApp capability)
4. **Public Proposal Links** [both] — unauthenticated client view

## 6. Creative / AI Generation
- Scope: BE `ai`, `ai-jobs`, `creative-pipeline`, `jobs` + FE creative/ai/ai-jobs
- Audience: sales users
- Entities: `aiJobs`, `aiJobQueue`, `proposals`
- Depends on: Settings (Claude key), Integrations (Claude, S3), Proposals
- Type: domain + integration

### Features
1. **Creative Pipeline v2** [both] — queued Claude Message Batches → HTML → S3
2. **Legacy Stream Generation** [both] — `POST /ai-jobs/stream` one-shot
3. **AI Playground** [both] — Claude chat/test endpoints
4. **Job Monitoring** [both] — list/details progress
5. **Multi-provider AI** [backend-only] — OpenAI/Gemini stubs partial

## 7. Contracts
- Scope: BE `modules/data/contracts` + FE contracts pages
- Audience: sales
- Entities: `contracts`
- Depends on: Proposals, Clients, Integrations

### Features
1. **Contract Lifecycle** [both] — create from proposal, edit, status, send, signed upload

## 8. Roles & Permissions
- Scope: BE roles/permissions + FE roles-permissions
- Audience: admins (`roles.manage`)
- Entities: `roles`, `permissions`
- Depends on: Auth
- Type: infrastructure

### Features
1. **Permission Catalog** [both] — seeded keys
2. **Role Management** [both] — assign permissionIds; batch upsert

## 9. Settings & Config
- Scope: BE settings/config + FE settings + ConfigService
- Audience: `settings.manage` for writes
- Entities: `settings`, `config`
- Depends on: Encryption, Integrations
- Type: infrastructure

### Features
1. **Workspace Settings** [both] — company/integration/financial/theme (schema-driven)
2. **Global Config Bundle** [both] — designStyles, themes, aiProviders for FE
3. **Maintenance Mode** [both] — public status flag + FE guards

## 10. Admin
- Scope: BE `modules/admin` (+ data/admin reset)
- Audience: privileged users
- Entities: multiple
- Depends on: Users, Settings, AI Jobs
- Type: infrastructure

### Features
1. **Seed Config** [backend-only] — permissions/roles/config docs
2. **Admin AI Job Diagnostics** [both] — list via /admin/ai-jobs
3. **Workspace Data Reset** [backend-only] — destructive wipe
4. **S3 / Batch Debug** [backend-only] — ops probes

## 11. Integrations (cross-cutting)
- Scope: BE services (S3, Mailjet, WhatsApp, Redis, Claude)
- Audience: system
- Entities: N/A
- Type: integration

### Features
1. **Object Storage (R2)** [backend-only]
2. **Email (Mailjet)** [backend-only]
3. **WhatsApp (Meta)** [backend-only]
4. **Cache (Redis)** [backend-only]
5. **Claude (Anthropic)** [backend-only]
