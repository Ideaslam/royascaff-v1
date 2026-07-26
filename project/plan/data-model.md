# Data Model

> Persistence: MongoDB via custom Mongoose repositories (`strict: false` flexible schemas).
> Document `_id` is application string ID (UUID-style). Tenant isolation via `workspaceId` on listed collections.
> Source: `src/infrastructure/persistence/providers/mongodb/*`, DTOs, TypeScript models.

## Conventions

- PKs: `_id: string` (stored as Mongo `_id`; app often exposes as `id`)
- Timestamps: typically present as `createdAt` / `updatedAt` (Date) where written by services
- Schema-less: most collections use `flexibleSchema` (`strict: false`) — fields below are observed from DTOs/repos/models, not enforced at DB layer
- Tenant-isolated collections: `clients`, `proposals`, `contracts`, `services`, `service-categories`, `aiJobs`/`ai-jobs`, `user`

---

## 1. workspaces
Purpose: multi-tenant workspace (account) record

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `name` | String | required | — |
| `email` | String | required | — |
| `status` | Enum | `active` \| `inactive` | — |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

Relations: one workspace → many users, clients, proposals, contracts, services, aiJobs, settings
Indexes: none declared in code
Files: `models/workspace.model.ts`, `mongodb-workspaces.repository.ts`

---

## 2. user
Purpose: workspace members (collection name is singular `user`)

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `uid` | String | optional alias / legacy | — |
| `name` | String | | — |
| `email` | String | required (login) | — |
| `passwordHash` | String | bcrypt; never returned | — |
| `countryCode` | String | | — |
| `phone` | String | | — |
| `role` | String | role key (e.g. `admin`) | → `roles.key` |
| `status` | String | e.g. active/pending | — |
| `workspaceId` | String | tenant | → `workspaces` |
| `profileImageUrl` | String | S3/R2 URL | — |
| `jobTitle` | String | max 100 | — |
| `bio` | String | max 500 | — |
| `emailVerified` | Boolean | [INFERRED] from verification flow | — |
| `date` | String | legacy display date | — |
| `createdAt` / `updatedAt` | Date | | — |

Relations: belongs to workspace; role → permissions via roles
Indexes: email lookups in auth services
Files: `mongodb-user.repository.ts`, `dtos/data/user.dto.ts`

---

## 3. auth_tokens
Purpose: refresh / email-verification / password-reset tokens (hashed)

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `userId` | String | required | → `user` |
| `tokenHash` | String | required | — |
| `type` | Enum | AuthTokenType (refresh / verify / reset) | — |
| `expiresAt` | Date | required | — |
| `revokedAt` | Date | optional | — |
| `createdAt` | Date | | — |

Relations: many tokens → one user
Indexes: query by `{ tokenHash, type, revokedAt missing, expiresAt > now }`
Files: `mongodb-auth-tokens.repository.ts`

---

## 4. roles
Purpose: named roles with permission key lists (seeded globally + workspace-usable)

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK (often = key) | — |
| `key` | String | unique role key | — |
| `name` | String | display (often AR) | — |
| `permissionIds` | String[] | permission keys | → `permissions.key` |
| `workspaceId` | String | optional scope | → `workspaces` |

Seeded roles: `admin`, `sales_manager`, `sales_user` (+ code mentions `workspace_owner`)
Files: `mongodb-roles.repository.ts`, `scripts/config-seed-data.js`

---

## 5. permissions
Purpose: permission catalog keys used by `PermissionGuard`

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK (often = key) | — |
| `key` | String | required unique | — |
| `label` | String | display | — |
| `category` | String | user \| proposal \| client \| settings | — |

Seeded keys: `user.create|edit|delete|resetPassword`, `proposal.create|edit|delete|view`, `client.create|edit|delete`, `settings.manage`, `roles.manage`
Files: `mongodb-permissions.repository.ts`, `scripts/config-seed-data.js`

---

## 6. clients
Purpose: CRM clients / accounts for proposals & contracts

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `workspaceId` | String | tenant | → `workspaces` |
| `name` | String | | — |
| `company` | String | | — |
| `email` | String | | — |
| `countryCode` | String | | — |
| `phone` | String | | — |
| `industry` | String | | — |
| `cr` | String | commercial registration | — |
| `city` | String | | — |
| `issuer` | Object | snapshot fields | — |
| `logoUrl` | String | S3/R2 | — |
| `createdBy` | String | | → `user` |

Relations: one client → many proposals/contracts
Files: `mongodb-clients.repository.ts`, `dtos/data/clients.dto.ts`

---

## 7. services
Purpose: sellable service catalog (pricing + bilingual copy)

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `workspaceId` | String | tenant | → `workspaces` |
| `name` / `nameEn` | String | AR/EN | — |
| `description` / `descriptionEn` | String | | — |
| `price` | Number | | — |
| `unit` | String | | — |
| `category` | String | category key | → `service-categories.key` |
| `revenueType` | String | | — |
| `definition` | String | | — |
| `scope_of_work` / `scopeOfWork` | String | dual naming | — |
| `execution_and_delivery` / `executionAndDelivery` | String | | — |
| `roya_obligations` | String | | — |
| `client_obligations` | String | | — |
| `createdBy` | String | | → `user` |

Files: `mongodb-services-catalog.repository.ts`, `dtos/data/services.dto.ts`

---

## 8. service-categories
Purpose: catalog grouping for services

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `workspaceId` | String | tenant | → `workspaces` |
| `key` | String | required unique-ish | — |
| `name` / `nameEn` | String | | — |
| `sortOrder` | Number | | — |

Default keys: advisory, strategic, management, creative, advertising, technical, analytics, media_production, other
Files: `mongodb-service-categories.repository.ts`, `lib/defaults/service-categories.defaults.ts`

---

## 9. proposals
Purpose: sales proposals with financials, bilingual HTML (inline or S3 URLs), generation linkage

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `workspaceId` | String | tenant | → `workspaces` |
| `clientId` | String | | → `clients` |
| `clientName` | String | denormalized | — |
| `projectName` | String | | — |
| `title` | String | | — |
| `date` | String | | — |
| `type` | String | | — |
| `status` | Enum | `pending` \| `sent` \| `endorsed` \| `won` \| `lost` | — |
| `total` / `tax` / `grandTotal` | Number | | — |
| `services` | Mixed | line items | — |
| `creativeOptions` | Mixed | generation inputs | — |
| `jobId` | String \| null | | → `aiJobs` |
| `generationStatus` | Enum | `pending` \| `completed` | — |
| `issuer` | Object | | — |
| `technical` / `financial` | String | HTML bodies (legacy) | — |
| `technicalAr` / `technicalEn` / `financialAr` / `financialEn` | String | | — |
| `technicalUrlByLang` / `financialUrlByLang` | Object | `{ar,en}` S3 URLs | — |
| `technicalHtmlUrl` / `financialHtmlUrl` | String | | — |
| `technicalHtmlUrlByLang` / `financialHtmlUrlByLang` | Object | | — |
| `emailSent` / send meta | Mixed | [INFERRED] ProposalEmailSentMeta | — |
| `createdBy` | String | | → `user` |

Relations: client, aiJob, contracts
Indexes: list sort fields mapped in repo; clientId filter supports string/number legacy
Files: `mongodb-proposals.repository.ts`, `dtos/data/proposals.dto.ts`

---

## 10. contracts
Purpose: legal contracts derived from proposals

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `workspaceId` | String | tenant | → `workspaces` |
| `proposalId` | String | required on create | → `proposals` |
| `clientId` / `clientName` | String | | → `clients` |
| `title` | String | | — |
| `contract` | String | HTML/body | — |
| `status` | Enum | `draft` \| `sent` \| `signed` \| `active` \| `expired` | — |
| `overrides` | Object | string map | — |
| `endAt` | String/Date | | — |
| `signed` | Boolean | | — |
| `signedAt` / `sentAt` | String/Date | | — |
| `signedContract` | String | signed PDF/URL | — |
| `serviceIds` | Mixed | | → `services` |
| `createdBy` | String | | → `user` |

Files: `mongodb-legal-contracts.repository.ts`, `dtos/data/contracts.dto.ts`

---

## 11. settings
Purpose: per-workspace company + integration settings (Claude key encrypted)

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK (workspace-scoped) | — |
| `workspaceId` | String | | → `workspaces` |
| `apiKeyEncrypted` | String | AES-256-GCM | — |
| `apiKeyMask` | String | UI mask | — |
| `companyName` / `email` / `phone` / `address` | String | | — |
| `tax` / `currency` / `validity` | Mixed | financial | — |
| `model` | String | default Claude model | — |
| `defaultColor` / `defaultFont` | String | theme | — |
| `[key: string]` | Mixed | schema-driven extras | — |

Note: plaintext `apiKey` decrypted at runtime only
Files: `models/settings.model.ts`, `mongodb-settings.repository.ts`, `lib/settings-schema.ts`

---

## 12. config
Purpose: global/system config docs (seeded design styles, AI providers, settings schema, maintenance flags)

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` / `key` | String | doc key | — |
| `value` | Mixed | payload | — |

Known keys: `designStyles`, `pageDepth`, `themeConfigs`, `servicePricing`, `settingsSchema`, `aiProviders`, maintenance fields
Files: `mongodb-config.repository.ts`, `mongodb-maintenance.repository.ts`, `scripts/config-seed-data.js`

---

## 13. aiJobs
Purpose: async AI job records (creative pipeline + chat)

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK (= job id) | — |
| `userId` | String | | → `user` |
| `workspaceId` | String | tenant | → `workspaces` |
| `type` | Enum | `creative` \| `chat` | — |
| `status` | Enum | `pending` \| `processing` \| `completed` \| `failed` | — |
| `progress` | Number | 0–100 | — |
| `stepName` | String \| null | | — |
| `result` | Object \| null | `{ text }` | — |
| `error` | String \| null | | — |
| `responseType` | Enum \| null | `stream` \| `batch` | — |
| `batchId` | String \| null | Claude batch id | — |
| `creativePipeline` | Object \| null | CreativePipelineState | — |
| `createdAt` / `updatedAt` | Date/String | | — |

Files: `models/ai-job.model.ts`, `mongodb-ai-jobs.repository.ts`

---

## 14. aiJobQueue
Purpose: Mongo-backed work queue polled by jobs service

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `jobId` | String | | → `aiJobs` |
| `userId` / `workspaceId` | String | | — |
| `type` | Enum | creative \| chat | — |
| `payload` | Object | job input | — |
| `createdAt` | Number | epoch ms | — |

Files: `mongodb-queue.gateway.ts`, `models/ai-job.model.ts` (`JobQueuePayload`)

---

## Enums (summary)

| Enum | Values |
|------|--------|
| Proposal status | pending, sent, endorsed, won, lost |
| Contract status | draft, sent, signed, active, expired |
| AiJob status | pending, processing, completed, failed |
| AiJob type | creative, chat |
| Workspace status | active, inactive |
| Generation status | pending, completed |

## Repository / collection map

| Collection | Repository |
|------------|------------|
| workspaces | MongoWorkspacesRepository |
| user | MongoUserRepository |
| auth_tokens | MongoAuthTokensRepository |
| roles | MongoRolesRepository |
| permissions | MongoPermissionsRepository |
| clients | MongoClientsRepository |
| services | MongoServicesCatalogRepository |
| service-categories | MongoServiceCategoriesRepository |
| proposals | MongoProposalsRepository |
| contracts | MongoLegalContractsRepository |
| settings | MongoSettingsRepository |
| config | MongoConfigRepository / MongoMaintenanceRepository |
| aiJobs | MongoAiJobsRepository |
| aiJobQueue | MongoQueueGateway |
