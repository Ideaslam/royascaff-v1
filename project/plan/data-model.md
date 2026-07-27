# Data Model

> Persistence: MongoDB via custom Mongoose repositories (`strict: false` flexible schemas).
> Document `_id` is application string ID (UUID-style). Tenant isolation via `workspaceId` on listed collections.
> Source: `src/infrastructure/persistence/providers/mongodb/*`, DTOs, TypeScript models.

## Conventions

- PKs: `_id: string` (stored as Mongo `_id`; app often exposes as `id`)
- Timestamps: typically present as `createdAt` / `updatedAt` (Date) where written by services
- Schema-less: most collections use `flexibleSchema` (`strict: false`) — fields below are observed from DTOs/repos/models, not enforced at DB layer
- Tenant-isolated collections: `clients`, `proposals`, `contracts`, `services`, `service-categories`, `aiJobs`/`ai-jobs`, `user`, `projects`, `pipelineTraces`

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
| `type` | String | Pipeline v3 create-from-project → always `'creative'`; legacy may vary | — |
| `status` | Enum | `pending` \| `sent` \| `endorsed` \| `won` \| `lost` | — |
| `total` / `tax` / `grandTotal` | Number | | — |
| `services` | Mixed | line items | — |
| `creativeOptions` | Mixed | generation inputs | — |
| `jobId` | String \| null | | → `aiJobs` |
| `generationStatus` | Enum | `pending` \| `completed` | — |
| `issuer` | Object | | — |
| `technical` / `financial` | String | HTML bodies (legacy) | — |
| `technicalAr` / `technicalEn` / `financialAr` / `financialEn` | String | | — |
| `technicalUrlByLang` / `financialUrlByLang` | Object | `{ar,en}` S3 URLs; v3 export fills technical (= deck) + financial (standalone) per lang | — |
| `technicalHtmlUrl` / `financialHtmlUrl` | String | latest flat mirrors for send/list | — |
| `technicalHtmlUrlByLang` / `financialHtmlUrlByLang` | Object | mirrors for FE helpers | — |
| `emailSent` / send meta | Mixed | [INFERRED] ProposalEmailSentMeta | — |
| `createdBy` | String | | → `user` |
| `projectId` | String \| null | set for Pipeline v3 create-from-project | → `projects` |
| `templateKey` | String \| null | e.g. `pitch-landscape` \| `pitch-landscape-formal` \| `website-template` | → `templates.key` |
| `templateVersion` | Number \| null | pinned | — |
| `language` | String \| null | `ar` \| `en` (primary / source language) | — |
| `pipelineVersion` | String \| null | `"3"` for v3 runs | — |
| `dnaVersionId` | String \| null | → `project_dna_versions._id` | preferred pin at create |
| `dnaSnapshot` | Object \| null | immutable copy of version DNA + inputs at create | workers prefer snapshot first |
| `dnaVersion` | Number \| null | legacy numeric pin; optional keep | prefer `dnaVersionId` + snapshot |
| `sourceProposalId` | String \| null | sibling / template-switch provenance | → `proposals` |
| `revisions` | Object[] \| null | last **5** archives (newest first) | regen/translate |
| `sectionMap` | Object \| null | `schemaVersion: map.v1` + `sections[]` | Step 2 output |
| `sections` | Object[] \| null | Step 3 content rows (`contentByLang`, status) | — |
| `renderedByLang` | Object \| null | `{ ar\|en: { htmlUrl, pdfUrl, … } }` pitch deck; export also mirrors html into technical URL maps | Steps 4–5 |
| `generation` | Object \| null | pipeline truth (see below) | Redis = work |

### `sections[]` (Step 3)

```jsonc
{
  "instanceId": "sec_01",
  "key": "cover",
  "order": 1,
  "status": "pending" | "running" | "ready" | "failed",
  "attempts": 0,
  "error": null | { "code", "message" },
  "contentByLang": {
    "ar": { /* AJV vs catalog contentSchema */ },
    "en": { /* optional after translate */ }
  }
}
```

### `revisions[]` item

```jsonc
{
  "id": "rev_…",
  "archivedAt": "ISO",
  "reason": "regenerate" | "translate" | "manual",
  "runId": "uuid",
  "language": "ar",
  "sectionMap": { /* optional snapshot */ },
  "sections": [ /* prior sections */ ],
  "renderedByLang": { /* prior artifacts */ },
  "technicalUrlByLang": { /* optional */ },
  "financialUrlByLang": { /* optional */ },
  "technicalHtmlUrlByLang": { /* optional */ },
  "financialHtmlUrlByLang": { /* optional */ }
}
```

**v3 dual-doc / language rules:** Export for language `L` upserts `renderedByLang[L]` + technical/financial URL keys for `L` only. Translate keeps source lang keys. Regenerate clears only the regenerated language keys (does not null entire maps).

### `generation` (Pipeline v3 — through export)

```jsonc
{
  "pipelineVersion": "3",
  "status": "queued" | "analyzing" | "mapping" | "generating_sections"
         | "assembling" | "exporting" | "ready" | "failed" | "partially_failed",
  "language": "ar",
  "runId": "uuid",
  "mode": null | "translate",
  "translate": null | {
    "sourceLang": "ar",
    "targetLang": "en",
    "total": 12,
    "completed": 10,
    "failed": [{ "instanceId": "sec_07", "error": "…" }]
  },
  "steps": {
    "dna": { "status": "pending|running|done|failed", "attempts": 0 },
    "map": { "status": "pending|running|done|failed", "attempts": 0 },
    "sections": {
      "status": "pending|running|done|failed|partial",
      "total": 14,
      "completed": 12,
      "failed": [{ "instanceId": "sec_07", "error": "…" }]
    },
    "assembly": { "status": "pending|running|done|failed", "attempts": 0 },
    "export": { "status": "pending|running|done|failed", "attempts": 0 }
  },
  "staging": null | { "htmlUrl", "pdfUrl", "language", … },
  "error": null | { "code", "message" }
}
```

**Rules:** Mongo = truth; Redis = work. Section failures with ≥1 ready → `partially_failed` after export. Financial money injected at assemble from services — never from AI. `generation.language` = language for the active run (translate/rerender). DNA pin: `regenerate-dna` bumps project version only; proposals remapped only on explicit regenerate.

Relations: client, aiJob, contracts, project (v3)
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
| `logoUrl` | String | S3/R2 public URL; optional; set via logo upload/delete only (not PATCH) | — |
| `tax` / `currency` / `validity` | Mixed | financial | — |
| `model` | String | default Claude model | — |
| `defaultColor` / `defaultFont` | String | theme | — |
| `pipelineV3Enabled` | Boolean | default **`true`** (soft cutover); explicit `false` = legacy creative escape hatch | gates v3 create + soft-blocks new creative jobs |
| `[key: string]` | Mixed | schema-driven extras | — |

Note: plaintext `apiKey` decrypted at runtime only  
Files: `models/settings.model.ts`, `mongodb-settings.repository.ts`, `lib/settings-schema.ts`, `dtos/data/settings.dto.ts`

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

## 15. projects
Purpose: container for one client engagement (shell + optional legacy mirrored inputs). **Canonical inputs + DNA live on `project_dna_versions`** (change-026).

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `workspaceId` | String | required, tenant | → workspaces |
| `createdBy` | String | required | → user |
| `clientId` | String | required | → clients |
| `clientName` | String | denormalized | — |
| `name` | String | required | — |
| `type` | Enum/string | branding\|campaign\|social\|…\|other | — |
| `info` | Object | create-form facts (see below) | **legacy/mirror** during transition; prefer DNA version |
| `services` | Object[] | snapshot; line items may override catalog | **legacy/mirror**; money for proposals from DNA version |
| `financial` | Object | code-computed subtotal/tax/grandTotal/currency | **legacy/mirror** |
| `rfp` | Object\|null | `fileKey`, `extractedTextKey`, `status` parsed\|failed | S3; prefer version-scoped |
| `images` | Object[] | id, url, key?, name, **purpose**, userNote? | S3; prefer version-scoped |
| `colorPalette` | `string[]` \| null/absent | 1–5 `#RRGGBB` when set | prefer DNA version palette |
| `dna` | Object\|null | legacy single blob | shim / mirror of latest generate; prefer version |
| `status` | Enum | active\|archived | — |
| `createdAt` / `updatedAt` | Date | auto | — |

Relations: one project → many `project_dna_versions` → many proposals.  
Create: writes first DNA version (+ may mirror inputs on project).  
Rules: pipeline resolve DNA via `proposal.dnaSnapshot` → version by `dnaVersionId` → legacy `projects.dna`.

### `projects.info` (create / DNA passthrough)

| Field | Type | Constraints | DNA mapping |
|-------|------|-------------|-------------|
| `digitalPresence` | Object | website, instagram, twitter, linkedin, tiktok, snapchat (optional) | → `dna.digitalPresence` |
| `competitors` | Array≤3 | `{ url }` required (name/platform optional); normalize strings → `{ url }` | → `dna.competitors` |
| `summary` | String | required on create (project description) | → `dna.project.summaryUser` |
| `kpis` | String \| Array | optional; string seeds one KPI | → `dna.project.kpis` |
| `budget` / `duration` | String \| Object | select values from Creative options | → `dna.project.budget` / `duration` |
| `researchOptions` | String[] | market\|competitor\|audience\|trends\|benchmarks\|case-studies\|social-analysis\|action-plan | → `dna.research.selectedOptions` |

### `dna.data.branding` (Analyze inject)

| Field | Type | Constraints | Notes |
|-------|------|-------------|--------|
| `colors` | `string[]` | 1–5 hex `#RRGGBB` when present | Ordered source; precedence: `project.colorPalette` → derive from first `client_logo` → Roya defaults (`#47B5E6`, `#114261`, `#2C8DBE`) |
| `colorRoles` | Object | required whenever `colors` present | Semantic roles for templates (see below) |
| `source` | Enum string (optional) | `palette` \| `client_logo` \| `roya_default` | Traceability; force-reconciled after AI merge so Claude cannot drop/overwrite |
| *(other)* | Mixed | optional | Open object; may hold more later |

#### `branding.colorRoles`

| Role | Type | Required when colors set | Default / derive rule |
|------|------|--------------------------|------------------------|
| `primary` | `#RRGGBB` | yes | `colors[0]` |
| `secondary` | `#RRGGBB` | yes | `colors[1]` if set; else darker shade of primary (**not** Roya navy when source is palette/logo) |
| `accent` | `#RRGGBB` | yes | `colors[2]` if set; else light tint of primary |
| `surface` | `#RRGGBB` | yes | `colors[3]` if set; else `#FFFFFF` |
| `text` | `#RRGGBB` | yes | `colors[4]` if set; else `#1A1A2E` |

When `source === 'roya_default'`, secondary/accent may keep catalog Roya blues. When `source` is `palette` or `client_logo`, missing secondary/accent always derive from primary (neutrals for surface/text).

AJV `dna.v2`: `branding` remains an object; `colors` / `colorRoles` / `source` documented (strict schema optional). Assemble maps `colorRoles` → `themeOverrides.primary|secondary|accent|surface|text` (legacy DNA with only `colors[]` derives roles at assemble).

Relations: one project → many DNA versions → many proposals (v3 create-from-project; proposals get `type: 'creative'`).  
Indexes: `{ workspaceId: 1, updatedAt: -1 }`; `{ workspaceId: 1, clientId: 1 }`.  
Files: `mongodb-projects.repository.ts`, `mongodb-project-dna-versions.repository.ts`, `services/data/projects.data.service.ts`, `modules/data/projects.controller.ts`, `pipeline-v3/analyze/dna-passthrough.ts`, `pipeline-v3/analyze/branding-colors.ts`, `pipeline-v3/analyze/dna-version-resolve.ts`  
Rules: Redis jobs are work; Mongo DNA **versions** + `proposal.dnaSnapshot` / `sectionMap` / `generation` are truth; never invent competitor/social URLs; generate must not fail solely for missing palette/logo.

---

## 15b. project_dna_versions
Purpose: versioned snapshot of project inputs + Analyze DNA. Many per project; proposals pin a version (+ frozen snapshot).

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `workspaceId` | String | required, tenant | → workspaces |
| `projectId` | String | required | → projects |
| `createdBy` | String | required | → user |
| `title` | String | required, non-empty trim; duplicates allowed | — |
| `info` | Object | same shape as `projects.info` | DNA passthrough |
| `services` | Object[] | money source when creating proposals from this version | — |
| `financial` | Object | code-computed totals | — |
| `rfp` | Object\|null | same as project.rfp | S3 |
| `images` | Object[] | purpose + userNote | S3 |
| `colorPalette` | `string[]` \| null | 1–5 `#RRGGBB` | branding inject |
| `dna` | Object\|null | `schemaVersion`, `data`, `generatedAt`, `runId`, `regenerating?`, `version?` | AJV `dna.v2` |
| `status` | Enum string | `empty` \| `generating` \| `ready` \| `failed` | derived/set with dna |
| `createdAt` / `updatedAt` | Date | auto | — |

Indexes: `{ workspaceId: 1, projectId: 1, updatedAt: -1 }`. Tenant: `TENANT_ISOLATED_COLLECTIONS`.  
Migration: `scripts/backfill-project-dna-versions.js` (dry-run / `--apply`).

---

## 16. templates
Purpose: catalog metadata for hand-crafted proposal templates; disk assets under `templates/<key>/v<version>/`.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `key` | String | required | e.g. `pitch-landscape`, `pitch-landscape-formal`, `website-template` |
| `version` | Number | required; proposals pin later | — |
| `status` | Enum | active\|draft\|deprecated | — |
| `name` | Object | `{ ar, en }` | website: `{ ar: "موقع — صفحة هبوط", en: "Website — Landing" }` |
| `engine` | String | `handlebars.v1` | — |
| `type` / `orientation` | String | presentation/landscape **or** website/portrait | — |
| `page` / `theme` / `assets` / `rules` | Object | geometry or `renderMode: landing` + fluid; tokens; disk paths | — |
| `sections` | Object[] | Section Definitions (abstract + contentSchema); shared catalog **20** keys; `rules.maxSections` 28 | — |
| `createdAt` / `updatedAt` | Date | auto | — |

Indexes: unique `{ key: 1, version: 1 }`; `{ status: 1 }`.  
Files: `mongodb-templates.repository.ts`, `pitch-landscape.catalog.ts`, disk `templates/pitch-landscape/v1/` + `templates/website-template/v1/` (not tenant-isolated — global catalog). Formal reuses pitch disk `basePath` with distinct theme tokens. Website is continuous landing HTML (`page.renderMode: landing`).

**Shared v1 section keys (20):** cover, executive_summary, client_context, objectives_kpis, services, methodology, timeline, insights_divider, market_analysis, competitor_analysis, audience_insights, market_trends, benchmarks, case_studies, **testimonial**, social_audit, action_plan, financial, next_steps, footer.

---

## 17. pipelineTraces
Purpose: every Pipeline v3 AI call/action with full parsed JSON I/O, tokens, cost.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `workspaceId` | String | required, tenant | — |
| `projectId` / `proposalId` | String | optional | → projects / proposals |
| `runId` | String | required | — |
| `seq` | Number | auto-increment within runId | — |
| `step` | Enum | analyze\|map\|sections\|assemble\|export | — |
| `action` | Enum | ai_call\|validation\|repair\|…\|error | — |
| `label` | String | e.g. `1a.core_dna` | — |
| `ai` | Object\|null | model, input, output, usage, cost | — |
| `validation` | Object\|null | passed, errors, schema | — |
| `status` | Enum | success\|failed\|retrying | — |
| `error` | Object\|null | code, message, stack? | — |
| `startedAt` / `finishedAt` / `createdAt` / `updatedAt` | Date | — | — |
| `sectionInstanceId` / `sectionKey` / `researchModuleKey` / `language` | String | optional | — |

Indexes: `{ proposalId, seq }`, `{ runId, seq }`, `{ workspaceId, createdAt }`, `{ workspaceId, action, status }`, `{ "ai.model", createdAt }`, `{ proposalId, step, action }`.  
Files: `mongodb-pipeline-traces.repository.ts`, `pipeline-trace.service.ts`

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
| Project status | active, archived |
| Template status | active, draft, deprecated |
| Pipeline trace status | success, failed, retrying |
| Pipeline step | analyze, map, sections, assemble, export |

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
| projects | MongoProjectsRepository |
| templates | MongoTemplatesRepository |
| pipelineTraces | MongoPipelineTracesRepository |
