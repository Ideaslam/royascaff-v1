# Data Model Delta — Resources DNA + Proposal Integration

## Modify: project_dna_versions

Add `resources` field alongside existing `services`.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `resources` | Array\<ResourceSnapshot\> | optional, default `[]` | → `resources` (catalog ID) |

### ResourceSnapshot (embedded)

| Field | Type | Notes |
|-------|------|-------|
| `id` | String | catalog resource ID for enrichment |
| `typeId` | String | resource_type ID |
| `typeKey` | String | denormalized type key |
| `typeName` | String | denormalized type name (AR) |
| `typeNameEn` | String | optional EN type name |
| `name` | String | resource display name |
| `nameEn` | String | optional EN name |
| `photo` | String | S3 URL at selection time |
| `summary` | String | AR summary |
| `summaryEn` | String | EN summary |
| `data` | Object | dynamic fields snapshot |
| `aiContext` | String | type's AI hint for proposal generation |

Snapshot freezes catalog data at selection time. `id` retained for assemble-time enrichment (photo URL refresh).

## Modify: dna.v2.schema.json

Add optional `resources` block (NOT in `required`):

```json
"resources": {
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["typeKey", "name"],
        "properties": {
          "id": { "type": "string" },
          "typeKey": { "type": "string" },
          "typeName": { "type": "string" },
          "name": { "type": "string" },
          "photo": { "type": "string" },
          "summary": { "type": "string" },
          "data": { "type": "object" },
          "aiContext": { "type": "string" }
        }
      }
    }
  }
}
```

## Modify: proposal.dnaSnapshot

Add `resources` alongside `services` in the snapshot shape (same pattern).

## Delta

- **Modified**: `project_dna_versions` — add `resources: ResourceSnapshot[]`
- **Modified**: `dna.v2.schema.json` — add optional `resources` block
- **Modified**: `proposal.dnaSnapshot` — carry `resources` in snapshot
