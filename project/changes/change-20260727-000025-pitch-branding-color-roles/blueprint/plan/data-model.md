# Data model — DNA branding color roles (pack after-state)

## `dna.data.branding`

| Field | Type | Constraints | Notes |
|-------|------|-------------|--------|
| `colors` | `string[]` | 1–5 hex `#RRGGBB` when present | Ordered source from palette / logo derive / Roya defaults; kept for FE + backward compat |
| `colorRoles` | Object | required whenever `colors` present | Semantic roles for templates (see below) |
| `source` | Enum string | `palette` \| `client_logo` \| `roya_default` | Unchanged |

### `branding.colorRoles`

| Role | Type | Required when colors set | Default / derive rule |
|------|------|--------------------------|------------------------|
| `primary` | `#RRGGBB` | yes | `colors[0]` |
| `secondary` | `#RRGGBB` | yes | `colors[1]` if set; else **darker shade of primary** (not Roya navy) |
| `accent` | `#RRGGBB` | yes | `colors[2]` if set; else mid/light tint of primary (or `colors[1]` if only two) |
| `surface` | `#RRGGBB` | yes | `colors[3]` if set; else **`#FFFFFF`** |
| `text` | `#RRGGBB` | yes | `colors[4]` if set; else **`#1A1A2E`** |

**When `source === 'roya_default'`:** roles may use catalog Roya blues (primary `#47B5E6`, secondary `#114261`, accent `#2C8DBE`, surface white, text near-black).

**When `source` is `palette` or `client_logo`:** never fill missing secondary/accent from Roya blues — always derive from primary (or neutrals for surface/text).

AJV: `branding` stays open object; `colorRoles` documented; strict schema optional.

## Delta

- **Add** `dna.data.branding.colorRoles` with five roles
- **Clarify** assemble/theme consume roles (not only `colors[i]`); incomplete palette slots do not leak Roya blue when source is palette/logo
