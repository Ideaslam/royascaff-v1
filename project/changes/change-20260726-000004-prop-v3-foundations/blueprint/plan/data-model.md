# Data Model — Delta (REQ-PROP-V3 Phase 0)

> After-state for entities owned by this pack. Full narrative: `docs/refactor-proposal-generator.md` §4, §7.4.
> Tenant isolation: add collection names to `TENANT_ISOLATED_COLLECTIONS` where workspace-scoped.

## Delta

| Entity | Action |
|--------|--------|
| `projects` | **Add** collection |
| `templates` | **Add** collection |
| `pipelineTraces` | **Add** collection (+ indexes; optional 90d TTL) |
| `proposals` | **No change in this pack** (additive fields in later packs) |
| `aiJobs` / `aiJobQueue` | **Unchanged** (legacy v2) |

---

## 1. projects

Purpose: container for one client engagement — raw `info`, services/financials, RFP/images, and versioned DNA (filled in Phase 2+).

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId/string | PK | — |
| `workspaceId` | String | required, tenant | → workspaces |
| `createdBy` | String | required | → user |
| `clientId` | String | required | → clients |
| `clientName` | String | denormalized | — |
| `name` | String | required | — |
| `type` | Enum/string | branding\|campaign\|social\|performance\|content\|website\|comprehensive\|seo\|events\|pr\|ecommerce\|app\|other | — |
| `info` | Object | required — raw create-form input | see below |
| `services` | Object[] | snapshot at creation; source of truth for money | — |
| `financial` | Object | code-computed: subtotal, taxRate, tax, grandTotal, currency | — |
| `rfp` | Object\|null | fileName, fileKey, mime, extractedTextKey, status | S3 keys |
| `images` | Object[] | id, url, name, userNote | S3 URLs |
| `dna` | Object\|null | version, generatedAt, model, schemaVersion, data | Phase 2 fills `data` |
| `status` | Enum | active\|archived | — |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

### `info` (user truth — never invent URLs/services in DNA)

| Field | Type | Notes |
|-------|------|-------|
| `summary` | String | free text |
| `type` | String | same enum as project.type |
| `budget` / `budgetNote` | String | range key or free text |
| `duration` / `startPreference` | String | optional |
| `kpis` / `objectivesText` / `targetAudienceText` | String | optional |
| `geography` | String[] | markets |
| `industryHints` | String[] | optional |
| `digitalPresence` | Object | website + social URLs |
| `competitors` | Object[] | `{ url, label? }` — **max 3** at launch |
| `researchOptions` | String[] | launch subset: `market`, `competitor`, `audience` (schema may allow more for later) |

### `services[]` item

`id`, `name`, `nameEn`, `price`, `unit`, `qty`, `category`, `revenueType`, `description`

Relations: one project → many proposals (later).  
Indexes: `{ workspaceId: 1, updatedAt: -1 }`; `{ workspaceId: 1, clientId: 1 }`.

---

## 2. templates

Purpose: catalog metadata for hand-crafted proposal templates. Disk assets under `templates/<key>/v<version>/` (design-first). Phase 0 may seed a **shell** document for `pitch-landscape` without full section defs.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId/string | PK | — |
| `key` | String | required, unique | e.g. `pitch-landscape` |
| `version` | Number | required; proposals pin version later | — |
| `status` | Enum | active\|draft\|deprecated | — |
| `name` | Object | `{ ar, en }` | — |
| `engine` | String | `handlebars.v1` | — |
| `type` | String | launch: `presentation` | — |
| `orientation` | String | launch: `landscape` | — |
| `page` | Object | format 16:9, widthMm, heightMm, safeAreaMm | — |
| `theme` | Object | tokens, modes, direction | — |
| `assets` | Object | basePath, cssFile, partialsDir, layoutFile, previewImageUrl, fonts[] | disk |
| `sections` | Object[] | Section Definitions — may be `[]` until Phase 1 | — |
| `rules` | Object | min/max sections, requiredKeys, researchCoverageRequired | — |
| `createdAt` / `updatedAt` | Date | auto | — |

Indexes: unique `{ key: 1, version: 1 }`; `{ status: 1 }`.

---

## 3. pipelineTraces

Purpose: every AI call and pipeline action with full parsed JSON I/O, tokens, cost — queryable audit (replaces file logs for v3).

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `workspaceId` | String | required, tenant | — |
| `projectId` | String | optional until projects wired | → projects |
| `proposalId` | String | optional until proposals v3 | → proposals |
| `runId` | String | required; groups one pipeline execution | — |
| `seq` | Number | auto-increment within runId | — |
| `step` | Enum | analyze\|map\|sections\|assemble\|export | — |
| `action` | Enum | ai_call\|validation\|repair\|passthrough_inject\|richness_gate\|overflow_shrink\|s3_upload\|error | — |
| `label` | String | e.g. `1a.core_dna` | — |
| `ai` | Object\|null | model, provider, attempt, maxTokens, temperature, input, output, durationMs, cost | when ai_call/repair |
| `validation` | Object\|null | passed, errors[], schema | when validation/richness_gate |
| `status` | Enum | success\|failed\|retrying | — |
| `error` | Object\|null | code, message, stack? | — |
| `startedAt` / `finishedAt` | Date | — | — |
| `sectionInstanceId` / `sectionKey` / `researchModuleKey` / `language` | String | optional context | — |
| `createdAt` / `updatedAt` | Date | auto | — |

Indexes:

- `{ proposalId: 1, seq: 1 }`
- `{ runId: 1, seq: 1 }`
- `{ workspaceId: 1, createdAt: -1 }`
- `{ workspaceId: 1, action: 1, status: 1 }`
- `{ "ai.model": 1, createdAt: -1 }`
- `{ proposalId: 1, step: 1, action: 1 }`

TTL: optional expire after 90 days (configurable); document in env notes.

---

## Persistence rules

- Custom mongoose repositories (same pattern as proposals) — not `@nestjs/mongoose`.
- Workspace-scoped collections registered for tenant isolation.
- Schema-less flexible documents OK; **JSON Schema (AJV)** validates DNA/map/slots at pipeline boundaries (schema files in code, not Mongo validators).
