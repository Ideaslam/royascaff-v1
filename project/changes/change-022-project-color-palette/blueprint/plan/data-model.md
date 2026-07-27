# Data model — projects.colorPalette + DNA branding.colors (pack after-state)

## 15. projects (affected fields)

| Field | Type | Constraints | Notes |
|-------|------|-------------|--------|
| `colorPalette` | `string[]` \| null/absent | optional; when set length **1–5**; each `#RRGGBB` (normalized) | User-chosen project palette; empty/absent → DNA fallback chain |
| `images[]` | Object[] | includes `purpose` from change-021 | Used when palette empty: first `client_logo` for color derivation |
| `dna.data.branding` | Object | see below | Analyze injects colors |

No new collection. No migration — existing projects have no `colorPalette` (treat as empty).

### `dna.data.branding` (after-state)

| Field | Type | Constraints | Notes |
|-------|------|-------------|--------|
| `colors` | `string[]` | 1–5 hex `#RRGGBB` when present | Source: project palette **or** logo extract **or** Roya defaults |
| `source` | Enum string (optional) | `palette` \| `client_logo` \| `roya_default` | Traceability; optional for AJV if keep branding as open object |
| *(other)* | Mixed | optional | Existing open `branding` object may hold more later |

AJV `dna.v2`: keep `branding` as object; document `colors` in pack / comments (strict schema optional).

## Delta

- **Add** top-level `projects.colorPalette?: string[]` (1–5 hex when set)
- **Clarify** `dna.branding.colors` as ordered hex list used by assemble → themeOverrides
- **No** migration job
