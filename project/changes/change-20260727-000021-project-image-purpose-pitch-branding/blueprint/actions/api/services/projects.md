# Services — Safqa API · Projects (pack delta)

### SVC-PROJECTS-03 · ProjectImagesService (via ProjectsDataService) [domain, internal, Projects]
- Status: planned
- Methods:
  - `uploadImages(workspaceId, projectId, files[], meta?)` — S3 `projects/{id}/images/` → append `images[]`
    - Each row: `{ id, url, key, name, purpose, userNote }`
    - `purpose` from parallel multipart field (default `other`); validate enum
    - `userNote` from parallel field (default `""`)
  - `patchImages(workspaceId, projectId, updates: { id, purpose?, userNote? }[])` — merge metadata by id; 404 if unknown id; return full `images[]`
- Deps: S3Service, ProjectsRepository
- Side effects: file (S3) on upload only
- Rules:
  - Allowed purpose: `client_logo` | `product` | `reference` | `other`
  - Invalid purpose → 400
  - Multiple `client_logo` allowed in storage; assemble uses **first**
  - No dataURLs in AI payloads (unchanged)

### DNA passthrough (Analyze)
- Status: planned
- Include `purpose` (and `userNote`) on skeleton `images[]` in `buildDnaSkeleton` / dna-passthrough

## Delta

- **Extend** `uploadImages` to persist `purpose` + `userNote`
- **Add** `patchImages` for post-upload purpose/note edits
- **Extend** DNA image mapping with `purpose`
