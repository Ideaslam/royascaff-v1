# Data model — proposals shared shell · change-031

## Entity — proposals (after-state for archive consumers)

Collection: `proposals` · Repo: `MongoProposalsRepository`  
Engines **v2** and **v3** share this collection. Archive / editor / list / send read one shell.

### Shared shell (both engines — set when data exists)

| Field | Type | Notes |
|-------|------|--------|
| `clientId` / `clientName` | String | |
| `projectName` / `title` | String | |
| `date` / `type` / `status` | Mixed | v3 create → `type: 'creative'` |
| `total` / `tax` / `grandTotal` | Number | |
| `services` | Mixed[] | **object line items preferred** `{ id, name, price, qty, … }`; string IDs still accepted for legacy v2 |
| `pipelineVersion` | String \| null | `"2"` \| `"3"` (list projection includes) |
| `projectId` | String \| null | → `projects` (Part 2 fills for new v2; list projection includes) |
| `dnaVersionId` / `dnaSnapshot` | Mixed | preferred when project-linked |
| `language` | String \| null | primary lang `ar` \| `en` |
| `generationStatus` | Enum | `pending` \| `completed` |
| `technicalUrlByLang` / `financialUrlByLang` | Object | `{ ar?, en? }` S3 URLs |
| `technicalHtmlUrl*` / `financialHtmlUrl*` | Mixed | flat + by-lang mirrors |
| `generation` | Object \| null | run/step truth (Part 2 expands for v2) |

### Engine-specific (nullable; not required on the other)

| Field | Engine | Notes |
|-------|--------|--------|
| `creativeOptions` | v2 | wizard inputs |
| `jobId` | v2 legacy | → `aiJobs` (Part 2 stops new writes) |
| `technical` / `financial` / `*Ar` / `*En` | v2 (+ edit cache) | inline HTML optional |
| `templateKey` / `templateVersion` | v3 | |
| `sectionMap` / `sections[]` | v3 | |
| `renderedByLang` | v3 | pitch deck per lang; technical URL maps mirror html |

### List summary projection (after-state)

`SUMMARY_PROJECTION` **includes** (in addition to existing money/URL/status fields):

- `pipelineVersion`
- `projectId`
- `language`

Does **not** need full HTML bodies or full `sections[]`.

## Delta

- **Add to list projection:** `pipelineVersion`, `projectId`, `language`
- **Clarify:** shared shell vs engine-specific fields (no new collections)
- **Clarify:** `services` may be objects; consumers must resolve `id` (edit info this pack; contracts Part 3)
