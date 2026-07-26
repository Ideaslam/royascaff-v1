# Product Description

## 1. Product Summary
- **Name**: Roya Safqa (رويا صفقة)  **Type**: SaaS web app  **Audience**: Roya Marketing sales teams (workspace-scoped)
- Deal intelligence platform: manage clients, services, AI-generated bilingual proposals, contracts, and delivery via email/WhatsApp.

## 2. Core Workflow
1. Register/login to a workspace and configure company + Claude API key in Settings
2. Maintain clients and priced service catalog (categories)
3. Create a proposal (manual or Creative AI flow with RFP/options)
4. Review/edit technical & financial HTML; store to R2; update status
5. Send to client (email/WhatsApp) or share public link; optionally create contract and track signature

## 3. Core Features
- **Workspace Auth & RBAC**: JWT, roles, permission keys
- **CRM**: clients with logos
- **Catalog**: bilingual services & categories
- **Proposals**: CRUD, dashboard analytics, bilingual docs, S3 HTML, send
- **Creative AI**: Claude pipeline v2 + legacy stream jobs
- **Contracts**: lifecycle from proposals
- **Settings/Config**: schema-driven workspace settings + global creative config
- **i18n**: Arabic/English UI with RTL

## 4. Key Entities
- **workspaces**, **user**, **roles**, **permissions**, **clients**, **services**, **service-categories**, **proposals**, **contracts**, **settings**, **config**, **aiJobs**, **aiJobQueue**, **auth_tokens**

## 5. User Roles
- **admin**: full permissions including settings/roles/user delete
- **sales_manager**: team + proposals + clients (no settings/roles.manage / proposal.delete in seed)
- **sales_user**: create/edit proposals & clients; view proposals
- **public viewer**: public proposal link only

## 6. Integrations
- **Anthropic Claude**: proposal generation
- **Cloudflare R2 (S3)**: HTML/assets
- **Mailjet**: transactional email
- **Meta WhatsApp**: proposal messaging
- **Redis**: cache

## 7. Tech & Constraints
- Backend: NestJS 11 + MongoDB (schema-less) + custom job poller  Frontend: Angular 18 + PrimeNG  i18n: en/ar RTL
- Constraints: no server PDF yet; OpenAI stub; MainLayout authGuard disabled; creative pipeline latency from Claude Batches
- Related design doc (not blueprint): `docs/refactor-proposal-generator.md`

## 8. Business Rules
1. Tenant data scoped by workspaceId
2. Claude key encrypted per workspace
3. Proposal statuses: pending → sent → endorsed → won/lost
4. Contract statuses: draft → sent → signed → active/expired
5. FE must call only configured apiBaseUrl

## 9. Out of Scope (current product)
- Native mobile apps
- Server-side PDF rendering (planned in refactor doc)
- Fully working OpenAI/Gemini providers
- Project entity with many proposals (planned in refactor doc) [INFERRED from docs]

## 10. Success Criteria
1. Sales user can generate and send a bilingual proposal end-to-end
2. Permissions prevent unauthorized settings/user admin actions
3. Public link works without login
4. Blueprint in `royascaff-v1/project/` matches implemented apps
