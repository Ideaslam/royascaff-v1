# Data Model — delta (change-20260727-000020)

## 11. settings

Purpose: per-workspace company + integration settings (Claude key encrypted)

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK (workspace-scoped) | — |
| `workspaceId` | String | | → `workspaces` |
| `apiKeyEncrypted` | String | AES-256-GCM | — |
| `apiKeyMask` | String | UI mask | — |
| `companyName` / `email` / `phone` / `address` | String | | — |
| `logoUrl` | String | S3/R2 public URL; optional | — |
| `tax` / `currency` / `validity` | Mixed | financial | — |
| `model` | String | default Claude model | — |
| `defaultColor` / `defaultFont` | String | theme | — |
| `pipelineV3Enabled` | Boolean | default **`true`** | gates v3 |
| `[key: string]` | Mixed | schema-driven extras | — |

Note: plaintext `apiKey` decrypted at runtime only. `logoUrl` is **not** a schema-driven PATCH field — set only via logo upload/delete endpoints.

Files: `models/settings.model.ts`, `mongodb-settings.repository.ts`, `lib/settings-schema.ts`, `dtos/data/settings.dto.ts`

## Delta

- **Add** `logoUrl?: string` on settings (optional; absent/null = no workspace logo)
- **No** new collection; **no** migration (existing workspaces simply have no logo until upload)
- **Do not** add `logoUrl` to `PatchSettingsDto` / settings schema text fields
