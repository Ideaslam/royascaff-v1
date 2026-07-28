# Data model — DNA versions (pack after-state)

## 15. projects (shell after-state)

Purpose: container for one client engagement. **Inputs and DNA no longer live on the project document** (migrated to `project_dna_versions`).

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `workspaceId` | String | required, tenant | → workspaces |
| `createdBy` | String | required | → user |
| `clientId` | String | required | → clients |
| `clientName` | String | denormalized | — |
| `name` | String | required | — |
| `type` | Enum/string | branding\|campaign\|social\|…\|other | — |
| `status` | Enum | active\|archived | — |
| `createdAt` / `updatedAt` | Date | auto | — |

**Removed from project (after migration):** `info`, `services`, `financial`, `rfp`, `images`, `colorPalette`, `dna` — may remain temporarily as legacy read-only until backfill; writers must not update them for new flows.

Indexes: `{ workspaceId: 1, updatedAt: -1 }`; `{ workspaceId: 1, clientId: 1 }`.

---

## 15b. project_dna_versions (new)

Purpose: one **versioned snapshot** of project inputs + Analyze DNA for a project. User can keep many; create proposals from any ready version.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `workspaceId` | String | required, tenant | → workspaces |
| `projectId` | String | required | → projects |
| `createdBy` | String | required | → user |
| `title` | String | required, non-empty trim; duplicates allowed | — |
| `info` | Object | same shape as legacy `projects.info` | DNA passthrough |
| `services` | Object[] | snapshot; money source for proposals from this version | — |
| `financial` | Object | code-computed subtotal/tax/grandTotal/currency | — |
| `rfp` | Object\|null | same as legacy project.rfp | S3 keys |
| `images` | Object[] | id, url, key?, name, purpose, userNote? | S3 |
| `colorPalette` | `string[]` \| null | 1–5 `#RRGGBB` when set | branding inject |
| `dna` | Object\|null | see below | AJV `dna.v2` |
| `status` | Enum string | `empty` \| `generating` \| `ready` \| `failed` | derived/set with dna |
| `createdAt` / `updatedAt` | Date | auto | — |

### `dna` wrapper (on version)

| Field | Type | Notes |
|-------|------|-------|
| `schemaVersion` | `"dna.v2"` | |
| `data` | Object\|null | AJV fail-closed on generate write / content PUT |
| `generatedAt` | Date\|string\|null | |
| `runId` | String\|null | active/last analyze run |
| `regenerating` | Boolean | lock for concurrent generate → 409 |

**Status rules:** `empty` = no data & not regenerating; `generating` = regenerating true; `ready` = data present; `failed` = last generate failed (data null).

Indexes: `{ workspaceId: 1, projectId: 1, updatedAt: -1 }`; `{ workspaceId: 1, _id: 1 }`.  
Tenant: register in `TENANT_ISOLATED_COLLECTIONS`.

Relations: project → many DNA versions; proposal → optional `dnaVersionId` + required freeze `dnaSnapshot` at create.

---

## 5. proposals (affected pin fields)

| Field | Type | Constraints | Notes |
|-------|------|-------------|--------|
| `dnaVersionId` | String \| null | → `project_dna_versions._id` | set at create; may point at deleted version |
| `dnaSnapshot` | Object \| null | immutable copy at create/map | **required for v3 create-from-project after this pack** |
| `dnaVersion` | Number \| null | legacy numeric; optional keep for old rows | prefer id + snapshot |

### `dnaSnapshot` (minimum)

```jsonc
{
  "dnaVersionId": "…",
  "title": "DNA v1",
  "dna": { "schemaVersion": "dna.v2", "data": { /* DnaV2 */ }, "generatedAt": "…" },
  "services": [ /* copy */ ],
  "financial": { /* copy */ },
  "images": [ /* copy refs */ ],
  "colorPalette": ["#…"] | null,
  "info": { /* optional slim copy */ }
}
```

Workers resolve DNA/inputs: **proposal.dnaSnapshot first** → else live version by `dnaVersionId` → never only legacy `projects.dna` for new runs.

---

## Migration

Script (dry-run / `--apply`): for each project with legacy inputs and/or `dna`:
1. Insert `project_dna_versions` with title `DNA v1`, copy `info|services|financial|rfp|images|colorPalette|dna`, set `status` from dna.
2. Optionally unset legacy fields on project (or leave until dual-read removed).
3. For proposals with `projectId` + matching numeric `dnaVersion` / existing DNA: backfill `dnaVersionId` + best-effort `dnaSnapshot` from that version (lossy if history was overwritten — accepted).

## Delta

- **Add** collection `project_dna_versions` (full input snapshot + dna + title + status)
- **Narrow** `projects` to shell fields (name, client, type, status, …)
- **Add** `proposals.dnaVersionId` + `proposals.dnaSnapshot`
- **Deprecate** sole reliance on `projects.dna` / numeric-only `proposals.dnaVersion`
- **Add** backfill script
