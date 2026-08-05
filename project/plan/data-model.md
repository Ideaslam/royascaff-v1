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
| `revenueType` | String | enum wire: `project`\|`recurring`\|`retainer`\|`one-time`\|`hourly`\|`ratio` (`RevenueType`) | — |
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

**Shared collection for Pipeline v2 + v3.** Archive / editor / list / send consumers use one **shared shell**; engines differ only in how content is produced and which engine-specific fields they fill (`REQ-PROP-UNIFY` / change-20260728-000031).

**Shared shell** (both engines when data exists): `client*`, `projectName`/`title`, money fields, `services`, `pipelineVersion`, `projectId`, `dnaVersionId`/`dnaSnapshot`, `language`, `generationStatus`, technical/financial URL maps (+ html mirrors), `generation`.

**Engine-specific (nullable):** v2 — `creativeOptions`, inline `technical`/`financial`/`*Ar`/`*En`, `generation.creativePipeline` / batch ids. v3 — `templateKey`/`templateVersion`, `sectionMap`, `sections[]`, `renderedByLang`, `generation.steps`. Legacy: `jobId` → `aiJobs` (new creative creates set `jobId: null`).

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `workspaceId` | String | tenant | → `workspaces` |
| `clientId` | String | | → `clients` |
| `clientName` | String | denormalized | — |
| `projectName` | String | | — |
| `title` | String | | — |
| `date` | String | | — |
| `type` | String | Pipeline v3 create-from-project → always `'creative'`; v2 unified create also `'creative'`; legacy may vary | — |
| `status` | Enum | `pending` \| `sent` \| `endorsed` \| `won` \| `lost` | — |
| `total` / `tax` / `grandTotal` | Number | | — |
| `services` | Mixed | object line items preferred `{ id, name, price, qty, … }`; string IDs accepted for legacy v2; **contracts create** unwraps `{ id }` and prefers snapshot name/price/qty | — |
| `creativeOptions` | Mixed | v2 wizard inputs (nullable for v3) | — |
| `jobId` | String \| null | **null** on new unified v2 creates; legacy rows may still point → `aiJobs` | → `aiJobs` |
| `generationStatus` | Enum | `pending` \| `completed` | — |
| `issuer` | Object | | — |
| `technical` / `financial` | String | HTML bodies (legacy / edit cache) | — |
| `technicalAr` / `technicalEn` / `financialAr` / `financialEn` | String | | — |
| `technicalUrlByLang` / `financialUrlByLang` | Object | `{ar,en}` S3 URLs; v3 export fills technical (= deck) + financial (standalone) per lang | — |
| `technicalHtmlUrl` / `financialHtmlUrl` | String | latest flat mirrors for send/list | — |
| `technicalHtmlUrlByLang` / `financialHtmlUrlByLang` | Object | mirrors for FE helpers | — |
| `emailSent` / send meta | Mixed | [INFERRED] ProposalEmailSentMeta | — |
| `createdBy` | String | | → `user` |
| `projectId` | String \| null | shared shell; required on new v2+v3 creates → `projects` | → `projects` |
| `templateKey` | String \| null | e.g. `pitch-landscape` \| `pitch-landscape-formal` \| `website-template` \| `roya-presentation` | → `templates.key` |
| `templateVersion` | Number \| null | pinned | — |
| `language` | String \| null | `ar` \| `en` (primary / source language); list summary includes | — |
| `pipelineVersion` | String \| null | `"2"` \| `"3"`; list summary includes | — |
| `dnaVersionId` | String \| null | → `project_dna_versions._id` | preferred pin at create |
| `dnaSnapshot` | Object \| null | immutable copy of version DNA + inputs at create | workers prefer snapshot first |
| `dnaVersion` | Number \| null | legacy numeric pin; optional keep | prefer `dnaVersionId` + snapshot |
| `sourceProposalId` | String \| null | sibling / template-switch provenance | → `proposals` |
| `revisions` | Object[] \| null | last **5** archives (newest first) | regen/translate |
| `sectionMap` | Object \| null | `schemaVersion: map.v1` + `sections[]` | Step 2 output |
| `sections` | Object[] \| null | Step 3 content rows (`contentByLang`, status) | — |
| `renderedByLang` | Object \| null | `{ ar\|en: { htmlUrl, pdfUrl, … } }` pitch deck; export mirrors into technical URL maps; technical editor save syncs `htmlUrl` | Steps 4–5 + archive edit |
| `generation` | Object \| null | pipeline truth (see below) | Redis = work |

**List summary projection** (`SUMMARY_PROJECTION`): money/status/URL maps + `pipelineVersion`, `projectId`, `language` (no HTML bodies / `sections[]`).

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

### `generation` (Pipeline v2 — creative section→HTML)

```jsonc
{
  "pipelineVersion": "2",
  "status": "queued" | "sections_batch_submitted" | "sections_ready"
         | "final_render_submitted" | "assembling" | "ready" | "failed",
  "language": "ar" | "en",
  "runId": "uuid",
  "batchId": null, // optional active Claude batch id
  "creativePipeline": { /* CreativePipelineState — phases, batch ids, theme, trace ids */ },
  "progress": 0,
  "stepName": null,
  "error": null | { "code", "message" },
  "updatedAt": "ISO"
}
```

Pending v2 batch poller: `pipelineVersion: "2"` AND non-terminal `generation.status` AND (`generation.batchId` OR `creativePipeline.sectionBatchId` / `htmlBatchId`).

**AI observability (`pipelineTraces`, `step: "creative_v2"`):**
- AI calls (model set): `creative_v2.sections_batch`, `creative_v2.html_batch`, optional `creative_v2.html_repair` — terminal status must be `success`/`failed` once generation is terminal (never leave open/`retrying` after fail).
- Actions/phases: `created`, `sections_batch_submitted`, `sections_ready`, `page_input_ready`, `html_batch_submitted`, `html_generated`, `html_repair_submitted`, `html_repaired`, `uploaded`, `completed`, `failed` (prefix `creative_v2.`).
- Validations: `creative_v2.section_validation`, `creative_v2.page_input_validation`, `creative_v2.html_validation`.
- Trace ids on `creativePipeline`: `sectionsBatchTraceId`, `htmlBatchTraceId`, `repairBatchTraceId` (+ `*BatchStartedAt`). Poller/orchestrator fail paths call `failCreativeV2OpenAiTraces` → close open AI rows + emit `creative_v2.failed`.

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

**Rules:** Mongo = truth; Redis = work (v3). Section failures with ≥1 ready → `partially_failed` after export. Financial money injected at assemble from services — never from AI. `generation.language` = language for the active run (translate/rerender). DNA pin: `regenerate-dna` bumps project version only; proposals remapped only on explicit regenerate. v2 batch wait uses Claude Message Batches + dual poller (proposals + legacy aiJobs).

Relations: client, contracts, project (v2+v3); legacy `jobId` → aiJobs optional
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
| `serviceIds` | String[] | clean catalog/service ids only (from string or object `.id` on proposal.services); never `"[object Object]"` | → `services` |
| `templateId` | String | id of `contract_templates` doc used to render `contract` HTML; recorded for traceability/regeneration | → `contract_templates` |
| `notes` | String | optional free text; rendered into the template's `{{contract_notes}}` block | — |
| `createdBy` | String | | → `user` |

**Create-from-proposal:** resolve SOW/financial from proposal line-item snapshots merged with catalog by id; legacy `creativeOptions.services.selectedServiceIds` still supported. Financial line amount = `price × (qty || 1)`.

Files: `mongodb-legal-contracts.repository.ts`, `dtos/data/contracts.dto.ts`, `contracts.data.service.ts`

---

## 10a. contract_templates
Purpose: admin-managed, global catalog of HTML contract templates (not workspace-scoped, mirrors `templates`) with `{{lower_snake_case}}` placeholder tokens; exactly one is the system default used by "New Contract" unless overridden.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `key` | String | unique slug, e.g. `roya-default` | — |
| `name` | String | display name (AR) | — |
| `nameEn` | String | optional display name (EN) | — |
| `description` | String | optional, shown in list/picker | — |
| `content` | String | full HTML document (head+style+body) with `{{lower_snake_case}}` tokens | — |
| `isDefault` | Boolean | exactly one `true` among `status: active` docs | — |
| `status` | Enum | `active` \| `inactive` | — |
| `createdAt` / `updatedAt` | String (ISO) | | — |

**Rules:** setting `isDefault: true` clears it on all others; deleting the default template is blocked while other templates exist; the last remaining template cannot be deleted. Seeded with one template (`roya-default`, migrated verbatim from the legacy static `contract_template.html`) via `npm run seed:contract-templates`.

**Placeholder token catalog** (authoritative — editor's clickable token picker + `renderContractHtml`): `workspace_name` / `workspace_logo` / `workspace_email` / `workspace_phone` / `workspace_address` / `workspace_formal_name` / `workspace_cr` / `workspace_representative` / `workspace_city` (from `settings` — brand name vs legal party block; see §11), `client_name` / `client_address` / `client_cr` / `client_representative` / `client_contact_name` / `client_contact_phone`, `contract_number` (short 8-char deterministic display code derived from the internal id, e.g. `QK7XZV3M` — not the raw id) / `contract_date` / `contract_duration` / `contract_notes` / `technical_appendix_number` / `ad_commission_percent`, `services` / `financial_table` (computed SOW/financial HTML) / `contract_total` (grand-total figure, same as `financial_table`'s totals), `client_signature_label`, and a **Design / Branding** group — `document_font_link` / `document_font` (from `settings.defaultFont`) and `brand_primary` / `brand_secondary` / `brand_accent` / `brand_surface` / `brand_text` (from `settings.colorRoles`, Roya-default fallback). Any other `{{token}}` is a free override key via the existing `overrides: Record<string,string>` mechanism.

Files: `mongodb-contract-templates.repository.ts`, `dtos/data/contract-templates.dto.ts`, `contract-templates.data.service.ts`, seed: `scripts/seed-contract-templates.js` + `scripts/contract-templates/roya-default.html`

---

## 11. settings
Purpose: per-workspace company + integration settings (Claude key encrypted)

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK (workspace-scoped) | — |
| `workspaceId` | String | | → `workspaces` |
| `apiKeyEncrypted` | String | AES-256-GCM | — |
| `apiKeyMask` | String | UI mask | — |
| `companyName` | String | brand / trade name → `{{workspace_name}}` | — |
| `companyFormalName` | String | optional; legal CR company name → `{{workspace_formal_name}}` (fallback → `companyName`) | — |
| `companyCr` | String | optional; commercial registration number → `{{workspace_cr}}` | — |
| `companyRepresentative` | String | optional; legal signatory → `{{workspace_representative}}` | — |
| `companyCity` | String | optional; city in formal party clause → `{{workspace_city}}` | — |
| `email` / `phone` / `address` | String | contact; `address` = full postal/street line | — |
| `logoUrl` | String | S3/R2 public URL; optional; set via logo upload/delete only (not PATCH) | — |
| `tax` / `currency` / `validity` | Mixed | financial | — |
| `model` | String | default Claude model | — |
| `defaultColor` / `defaultFont` | String | theme; `defaultColor` = alias of `colorRoles.primary`; `defaultFont` one of `Cairo` \| `Tajawal` \| `Amiri` (schema-driven — allowed values validated dynamically against `config/settingsSchema`'s `select` options, not hardcoded in the DTO) | — |
| `colorPalette` | `string[]` \| null | 1–5 hex `#rrggbb` when set | theme |
| `colorRoles` | Object \| null | `primary` / `secondary` / `accent` / `surface` / `text`; derived from palette (same rules as DNA) | theme |
| `pipelineV3Enabled` | Boolean | default **`true`** (soft cutover); explicit `false` = legacy creative escape hatch | gates v3 create + soft-blocks new creative jobs |
| `[key: string]` | Mixed | schema-driven extras | — |

Note: plaintext `apiKey` decrypted at runtime only. Theme hydrate on GET: palette → roles → legacy `defaultColor`. PATCH via `applyThemeBrandingPatch` (`lib/settings-branding.ts`).  
Files: `models/settings.model.ts`, `mongodb-settings.repository.ts`, `lib/settings-schema.ts`, `lib/settings-branding.ts`, `dtos/data/settings.dto.ts`

---

## 12. config
Purpose: global/system config docs (seeded design styles, AI providers, settings schema, maintenance flags, **pipeline model routing**)

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` / `key` | String | doc key | — |
| `value` | Mixed | payload | — |

Known keys: `designStyles`, `pageDepth`, `themeConfigs`, `servicePricing`, `settingsSchema`, `aiProviders`, **`pipelineModelRouting`**, maintenance fields
Files: `mongodb-config.repository.ts`, `mongodb-maintenance.repository.ts`, `scripts/config-seed-data.js`, `scripts/seed-config.js`

### `pipelineModelRouting` document shape

Stored as `config` collection doc `_id: "pipelineModelRouting"` (fields at top level of the doc, same pattern as other config keys).

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `defaultModel` | String | Claude model id | Medium default for unknown request types |
| `byRequestType` | Object | map of `PipelineRequestType` → model id | Concrete model IDs |

Seed defaults:

| Key | Model |
|-----|-------|
| `defaultModel` | `claude-sonnet-5` |
| `research.market` … `research.action-plan`, `research.other` | `claude-opus-5` |
| `section.research` | `claude-opus-5` |
| `dna.core` | `claude-sonnet-5` |
| `map` | `claude-sonnet-5` |
| `section` | `claude-sonnet-5` |
| `vision` | `claude-sonnet-5` |
| `translate` | `claude-haiku-4-5-20251001` |
| `repair` | `claude-haiku-4-5-20251001` |

---

## 13. aiJobs
Purpose: legacy async AI job records (in-flight creative + chat)

**Rules (REQ-PROP-UNIFY part 2):** No **new** creative rows from unified `/creative` create. Chat / non-creative unchanged. In-flight creative rows remain readable/processable via dual poller until drained. Hard-delete deferred.

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
| `creativePipeline` | Object \| null | CreativePipelineState (legacy; new v2 uses `proposal.generation.creativePipeline`) | — |
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
Purpose: container for one client engagement (shell + optional legacy mirrored inputs). **Canonical inputs + DNA live on `project_dna_versions`** (change-20260727-000026).

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
| `colors` | `string[]` | 1–5 hex `#RRGGBB` when present | Ordered source; precedence: `project.colorPalette` → first `client_logo` → workspace `colorPalette`/`colorRoles`/`defaultColor` → Roya defaults (`#47B5E6`, `#114261`, `#2C8DBE`) |
| `colorRoles` | Object | required whenever `colors` present | Semantic roles for templates (see below) |
| `source` | Enum string (optional) | `palette` \| `client_logo` \| `workspace` \| `roya_default` | Traceability; force-reconciled after AI merge so Claude cannot drop/overwrite |
| *(other)* | Mixed | optional | Open object; may hold more later |

#### `branding.colorRoles`

| Role | Type | Required when colors set | Default / derive rule |
|------|------|--------------------------|------------------------|
| `primary` | `#RRGGBB` | yes | `colors[0]` |
| `secondary` | `#RRGGBB` | yes | `colors[1]` if set; else darker shade of primary (**not** Roya navy when source is palette/logo/workspace) |
| `accent` | `#RRGGBB` | yes | `colors[2]` if set; else light tint of primary |
| `surface` | `#RRGGBB` | yes | `colors[3]` if set; else `#FFFFFF` |
| `text` | `#RRGGBB` | yes | `colors[4]` if set; else `#1A1A2E` |

When `source === 'roya_default'`, secondary/accent may keep catalog Roya blues. When `source` is `palette`, `client_logo`, or `workspace`, missing secondary/accent always derive from primary (neutrals for surface/text).

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
| `key` | String | required | e.g. `pitch-landscape`, `pitch-landscape-formal`, `website-template`, `roya-presentation` |
| `version` | Number | required; proposals pin later | — |
| `status` | Enum | active\|draft\|deprecated | — |
| `name` | Object | `{ ar, en }` | website: `{ ar: "موقع — صفحة هبوط", en: "Website — Landing" }`; roya: `{ ar: "عرض تقديمي — رويا", en: "Roya Presentation" }` |
| `engine` | String | `handlebars.v1` | — |
| `type` / `orientation` | String | presentation/landscape **or** website/portrait | — |
| `page` / `theme` / `assets` / `rules` | Object | geometry or `renderMode: landing` + fluid; tokens; optional `theme.lockPalette`; disk paths | — |
| `sections` | Object[] | Section Definitions (abstract + contentSchema); shared base **21** keys; each template + local `banner`/`full_bleed_banner`/`images_gallery` (**24**); `roya-presentation` **26** (+ `team`, `risks`); `rules.maxSections` **32** | — |
| `createdAt` / `updatedAt` | Date | auto | — |

Indexes: unique `{ key: 1, version: 1 }`; `{ status: 1 }`.  
Files: `mongodb-templates.repository.ts`, per-template catalogs under `src/pipeline-v3/templates/<key>/`, disk `templates/pitch-landscape/v1/` + `templates/website-template/v1/` + `templates/roya-presentation/v1/` (not tenant-isolated — global catalog). Formal reuses pitch disk `basePath` with distinct theme tokens. Website is continuous landing HTML (`page.renderMode: landing`). Roya-presentation is HAIA-from-scratch 16:9 with `theme.lockPalette: true`.

**Shared v1 section keys (21):** cover, executive_summary, client_context, objectives_kpis, services, methodology, timeline, insights_divider, market_analysis, competitor_analysis, audience_insights, market_trends, benchmarks, case_studies, **testimonial**, social_audit, action_plan, financial, next_steps, **about_workspace**, footer.

**Template-local visual keys (all four templates, not in SHARED):** `banner` (`imageRef`), `full_bleed_banner` (`title`, `subtitle?`, `imageRef`), `images_gallery` (`title`, `intro?`, `images[2..6]` of image ids). Repeatable; optional. Formal reuses pitch disk partials.

**Roya-presentation local extras:** `team`, `risks` (optional; not in `SHARED_SECTION_KEYS`).

---

## 17. pipelineTraces
Purpose: Pipeline v3 AI call/action rows + Creative Pipeline v2 observability (`step: creative_v2`) with I/O, tokens, cost where applicable.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `workspaceId` | String | required, tenant | — |
| `projectId` / `proposalId` | String | optional | → projects / proposals |
| `runId` | String | required | — |
| `seq` | Number | auto-increment within runId | — |
| `step` | Enum | analyze\|map\|sections\|assemble\|export\|creative_v2 | — |
| `action` | Enum | ai_call\|validation\|repair\|…\|error | — |
| `label` | String | e.g. `1a.core_dna` | — |
| `ai` | Object\|null | model, input, output, usage, cost | — |
| `validation` | Object\|null | passed, errors, schema | — |
| `status` | Enum | success\|failed\|retrying | — |
| `error` | Object\|null | code, message, stack? | — |
| `startedAt` / `finishedAt` / `createdAt` / `updatedAt` | Date | — | — |
| `sectionInstanceId` / `sectionKey` / `researchModuleKey` / `language` | String | optional | — |

Indexes: `{ proposalId, seq }`, `{ runId, seq }`, `{ workspaceId, createdAt }`, `{ workspaceId, projectId, createdAt }`, `{ workspaceId, proposalId, createdAt }`, `{ workspaceId, step, createdAt }`, `{ workspaceId, action, createdAt }`, `{ workspaceId, status, createdAt }`, `{ workspaceId, action, status }`, `{ "ai.model", createdAt }`, `{ proposalId, step, action }`.  
Query rules: every list/count/aggregate `$match` includes `workspaceId`; date range on `createdAt`; `callType=ai|non-ai` maps to `action`; list uses lean projection; totals via Mongo `$group`/`$facet`.  
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
| Pipeline step | analyze, map, sections, assemble, export, creative_v2 |

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
| contract_templates | MongoContractTemplatesRepository |
| settings | MongoSettingsRepository |
| config | MongoConfigRepository / MongoMaintenanceRepository |
| aiJobs | MongoAiJobsRepository |
| aiJobQueue | MongoQueueGateway |
| projects | MongoProjectsRepository |
| templates | MongoTemplatesRepository |
| pipelineTraces | MongoPipelineTracesRepository |
| resource-types | MongoResourceTypesRepository |
| resources | MongoResourcesRepository |

---

## 15. resource_types
Purpose: workspace-scoped configurable type definitions for resource catalog items

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `workspaceId` | String | tenant | → `workspaces` |
| `key` | String | required, unique per workspace | — |
| `name` | String | required (AR) | — |
| `nameEn` | String | optional (EN) | — |
| `description` | String | optional (AR) | — |
| `descriptionEn` | String | optional (EN) | — |
| `icon` | String | PrimeNG icon class | — |
| `aiContext` | String | AI hint for DNA/proposal | — |
| `fields` | Array\<ResourceTypeField\> | see sub-table | — |
| `sortOrder` | Number | display order | — |
| `isActive` | Boolean | soft archive, default true | — |
| `createdBy` | String | auto-injected | → `user` |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

### ResourceTypeField (embedded)

| Field | Type | Constraints |
|-------|------|-------------|
| `key` | String | required, unique within type |
| `label` | String | required (AR) |
| `labelEn` | String | optional (EN) |
| `dataType` | Enum | `text` \| `textarea` \| `photo` \| `photo-list` \| `url` \| `list` \| `number` \| `email` \| `phone` \| `social-links` |
| `required` | Boolean | default false |
| `aiHint` | String | how AI should use this field |
| `sortOrder` | Number | field display order |

Relations: one workspace → many resource_types; one resource_type → many resources
Tenant-isolated: **yes**
Files: `mongodb-resource-types.repository.ts`, `dtos/data/resource-types.dto.ts`

---

## 16. resources
Purpose: workspace-scoped catalog items belonging to a resource type

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `workspaceId` | String | tenant | → `workspaces` |
| `typeId` | String | required | → `resource_types` |
| `typeKey` | String | denormalized for filtering | — |
| `name` | String | required (primary display) | — |
| `nameEn` | String | optional (EN) | — |
| `photo` | String | S3 URL | — |
| `summary` | String | optional (AR) | — |
| `summaryEn` | String | optional (EN) | — |
| `data` | Object | dynamic fields per type definition | — |
| `tags` | String[] | cross-type tagging | — |
| `isActive` | Boolean | soft archive, default true | — |
| `createdBy` | String | auto-injected | → `user` |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

Relations: belongs to resource_type (via typeId); one workspace → many resources
Tenant-isolated: **yes**
Files: `mongodb-resources.repository.ts`, `dtos/data/resources.dto.ts`
