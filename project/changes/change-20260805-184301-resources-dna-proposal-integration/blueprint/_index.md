# Blueprint Index — change-20260805-184301-resources-dna-proposal-integration

> Pack owns only the artifacts below. Status: `planned` · `partial` · `done` · `deferred`.

| Layer | File (under blueprint/) | IDs / Names | Status | Done/Total | Purpose |
|-------|-------------------------|-------------|--------|-----------|---------|
| data-model | `plan/data-model-delta.md` | project_dna_versions.resources, dna.v2.schema, dnaSnapshot | done | 3/3 | Resources on DNA versions + schema + snapshot |
| service | `actions/api/services/dna-passthrough.md` | mergeDnaAnalyzeSource, buildDnaSkeleton, reconcileDnaPassthrough | done | 3/3 | Skeleton / reconcile carry resources (structured fields with aiHint) |
| service | `actions/api/services/dna-version-resolve.md` | buildDnaSnapshot, resolveDnaForProposal | done | 2/2 | Snapshot + resolve carry resources |
| service | `actions/api/services/dna-slice.md` | buildDnaSlice | done | 1/1 | Pass resources in core slice |
| service | `actions/api/services/projects.md` | create, createDnaVersionInternal, updateDnaVersionInputs, normalizeResourceSnapshots | done | 4/4 | Accept + persist resources (incl. fieldHints) |
| service | `actions/api/services/assemble.md` | enrichResourcesFromCatalog, assemble render context | done | 2/2 | Enrich + inject at render |
| service | `actions/api/services/template-sections.md` | team (pitch), partners (both), HBS partials, map integration | done | 5/5 | New section defs + partials + map hints |
| service | `actions/api/services/resource-types.md` | toResourceTypeLiteItem (aiContext), seedForWorkspace (backfill) | done | 2/2 | Lite endpoint returns aiContext; seed backfills existing records |
| service | `actions/api/services/resources.md` | uploadDynamicPhotos, uploadBase64ToS3 | done | 2/2 | Auto-upload base64 dynamic photos to S3 on save |
| page | `actions/web/pages/project-create.md` | Resources picker step (with fieldHints snapshot) | done | 1/1 | New step 2 in wizard |
| page | `actions/web/pages/project-edit.md` | Resources section (with fieldHints snapshot) | done | 1/1 | Resources picker in edit form |

**Pack Done/Total**: 28/28
