# Data Model — change-028 (pack slice)

## 12. config (after-state for known keys)

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

## Delta

- **Add** known config key `pipelineModelRouting`
- **Add** seed payload + upsert via `seed-config` / `seedConfigBundle`
- No workspace `settings` field changes
