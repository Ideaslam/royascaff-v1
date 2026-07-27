# Data model — projects.images (pack after-state)

## projects.images[]

Purpose: uploaded project assets for DNA / pitch placement.

| Field | Type | Constraints | Notes |
|-------|------|-------------|--------|
| `id` | String | required, e.g. `img_*` | stable key |
| `url` | String | required, S3/R2 public URL | — |
| `key` | String | optional storage key | existing |
| `name` | String | original filename | — |
| `purpose` | Enum string | `client_logo` \| `product` \| `reference` \| `other` | **required after this change**; default `other` |
| `userNote` | String | optional free text | keep; UI optional |

DNA skeleton `images[]` mirrors `{ id, url, name, purpose, userNote }` (no storage key required in DNA).

No new collection. Existing rows without `purpose` → treat as `other` at read/assemble time.

## Delta

- **Add** `purpose` on `projects.images[]` (enum above; default `other`)
- **Clarify** `userNote` remains optional free text (not a substitute for purpose)
- **No** migration job — lazy default at runtime
