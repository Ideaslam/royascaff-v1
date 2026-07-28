# Data Model — Delta (cutover)

## Delta

- **settings.`pipelineV3Enabled`**: default changes `false` → **`true`**
- **proposals.`projectId`**: backfill for legacy rows missing it (additive; no schema migration)
- **projects**: new wrapper docs created by backfill (best-effort fields from proposal)

---

## 11. settings _(after-state)_

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `pipelineV3Enabled` | Boolean | default **`true`** | gates v3; escape hatch set false for legacy create |

## 15. projects _(backfill)_

Backfill creates minimal active projects:
- `workspaceId`, `createdBy` (from proposal), `clientId` / `clientName`, `name` (proposal title or `Legacy: {id}`), `services`/`financial` if present, `info` stub, `status: active`
- No DNA required for wrap (legacy HTML stays on proposal)

## Proposals _(link)_

| Field | Change |
|-------|--------|
| `projectId` | Set when missing; never overwrite existing |
