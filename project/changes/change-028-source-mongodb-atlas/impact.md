# Impact Analysis — change-028: MongoDB Atlas Source

## 1. Reconnaissance

### How this differs from SQL Server
| Concern | SQL Server | MongoDB Atlas |
|---|---|---|
| Auth | username/password + host | Connection string URI (SRV or standard) |
| Driver | `mssql` | `mongodb` (native driver) — **already installed** via `mongoose` peer dep |
| Schema | INFORMATION_SCHEMA (rigid) | Schema-on-read — sample documents to infer fields |
| Pagination | `OFFSET FETCH` | `cursor + limit/skip` or `_id`-range paging |
| Incremental | `WHERE col > @lastSync` | `{ _id: { $gt: lastId } }` or `{ updatedAt: { $gt: lastSync } }` |
| Normalization | Flat rows | Nested/array docs → flatten to `Record<string,unknown>` |
| Preview | `SELECT TOP n` | `find().limit(n)` |
| Sub-resource | table name in `sourceRef` | collection name in `sourceRef` |

### Key MongoDB Atlas facts
- `mongodb` package is a peer dependency already installed via `mongoose@9`.
- `MongoClient` from `mongodb` is used directly (separate from Mongoose; no ODM model needed).
- Schema inference: sample the first N documents (`SAMPLE_SIZE = 200`), walk all keys recursively to build `DiscoveredColumn[]` with inferred canonical types.
- Flattening strategy: dot-notation for nested objects (`address.city`), `[0]` index notation for arrays of primitives; nested arrays of objects stay stringified (configurable).
- Watermark: prefer `_id` (ObjectId-based monotonic ordering) for full/incremental; if user provides `updatedAt` column, prefer that.
- IP Allowlist: Atlas requires the server's outgoing IP to be in the access list. We show a warning in the UI during setup with the message.

### Existing infrastructure used
- `ConnectorInterface` — implemented as-is
- `ConnectorRegistry` — auto-registered via `OnModuleInit`
- `DataConnectionDocument` + `credentialsDecrypted` pattern from SQL Server
- `DataConnectionRepository.findById` + `decryptCredentials` in the controller
- `DataModule`, `ConnectorsModule` wiring pattern identical to SQL Server

## 2. New Endpoints

| ID | Method | Path | Description |
|---|---|---|---|
| EP-DATA-37 | POST | `/data/connections/:id/mongodb/collections` | List collections in the Atlas database |
| EP-DATA-38 | POST | `/data/connections/:id/mongodb/preview` | Preview top-N documents from a collection |

## 3. Files to Create

### Backend
| File | Purpose |
|---|---|
| `src/integrations/connectors/mongodb-atlas/mongo-flatten.util.ts` | Recursive document flattener (dot-notation) |
| `src/integrations/connectors/mongodb-atlas/mongo-schema-sampler.ts` | Sample N docs → infer `DiscoveredColumn[]` |
| `src/integrations/connectors/mongodb-atlas/mongodb-atlas.connector.ts` | Full `ConnectorInterface` implementation |
| `src/modules/data/controllers/mongodb-atlas.controller.ts` | EP-DATA-37 + EP-DATA-38 |

### Frontend
| File | Purpose |
|---|---|
| `src/app/pages/data/mongodb-atlas-connect/mongodb-atlas-connect.page.ts` | 4-step wizard |
| `src/app/pages/data/mongodb-atlas-connect/mongodb-atlas-connect.page.html` | Template |

## 4. Files to Modify

| File | Change |
|---|---|
| `src/integrations/connectors/connectors.module.ts` | Provide + export `MongoDbAtlasConnector` |
| `src/modules/data/data.module.ts` | Add `MongoDbAtlasController` to `controllers` |
| `src/app/core/models/data.models.ts` | Add `MongoDbAtlasCollection`, `MongoDbAtlasPreviewResult` |
| `src/app/core/services/data.service.ts` | Add `listMongoCollections`, `previewMongoCollection` methods |
| `src/app/app.routes.ts` | Add `/app/data/mongodb-atlas/connect` route |
| `src/app/pages/data/data-sources/data-sources.page.html` | Add "MongoDB Atlas" connect button |
| `.ai-control/project/changes/change-log.md` | Mark change-028 ✅ PASS |

## 5. New Packages
None — `mongodb` is already available as a dependency of `mongoose`.

## 6. Key Architectural Decisions

### Schema Sampling Strategy
- Sample up to `SAMPLE_SIZE = 200` documents via `$sample` aggregate.
- Walk every key recursively to build a union of all possible fields.
- Infer canonical type from the most-common JS type seen across samples.
- Arrays of scalars → canonical type of scalar; arrays of objects → `string` (stringified JSON).

### Flattening Strategy  
- Nested object `{ address: { city: "Riyadh" } }` → `{ "address.city": "Riyadh" }`
- Array of scalars `{ tags: ["a","b"] }` → `{ "tags": "[\"a\",\"b\"]" }` (JSON string)
- Depth cap: 5 levels to prevent runaway flattening of deeply nested documents.

### Incremental Sync
- Default watermark: `_id` ObjectId ordering (guaranteed monotonic for inserts).
- If `dataset.watermarkColumn` is set to another field (e.g. `updatedAt`), use that instead.
- Fallback: full resync if no watermark available.

### Connection URI safety
- URI stored encrypted with AES-256-GCM (same `credentialsEncrypted` field).
- Database name extracted from URI or stored separately in credentials JSON.
- `MongoClient` is created per-operation and closed immediately (same pool-per-call pattern as SQL Server).

## 7. Risks
| Risk | Mitigation |
|---|---|
| Atlas IP allowlist blocks server | Show clear UI warning; test connection catches `MongoServerSelectionError` |
| Large collections during schema sample | Use `$sample` (reservoir, no full scan); cap at 200 docs |
| Deeply nested / polymorphic schemas | Depth cap + union of all sampled keys; user can always adjust mapping after |
| ObjectId serialization to OLAP | Cast `ObjectId` → hex string in `normalize` |

## 8. Implementation Order
1. `mongo-flatten.util.ts`
2. `mongo-schema-sampler.ts`
3. `mongodb-atlas.connector.ts`
4. `mongodb-atlas.controller.ts`
5. Wire `ConnectorsModule` + `DataModule`
6. Frontend models + service methods
7. SQL Server wizard (4-step) — TS + HTML
8. Route + Data Sources button
9. Compile check (backend + frontend)
10. Update change-log
