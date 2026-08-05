# Pack Status — change-20260805-184301-resources-dna-proposal-integration

- **pack-status**: merged
- **request-id**: REQ-CATALOG
- **depends-on**: change-20260805-184300 (merged)
- **Artifacts done**: 28/28

## Artifacts

| ID / Name | Layer | Status | Notes |
|-----------|-------|--------|-------|
| project_dna_versions.resources field | data-model | done | add resources[] to DNA version persistence |
| dna.v2.schema.json resources block | data-model | done | optional resources block with structured fields array |
| proposal.dnaSnapshot resources | data-model | done | carry resources in snapshot |
| mergeDnaAnalyzeSource (resources) | service | done | merge version/project resources |
| buildDnaSkeleton (resources) | service | done | embed resources with structured fields (key, label, dataType, aiHint, value) |
| reconcileDnaPassthrough (resources) | service | done | lock resources (code-owned) |
| buildDnaSnapshot (resources) | service | done | include resources in snapshot |
| resolveDnaForProposal (resources) | service | done | resolve resources from all paths |
| buildDnaSlice (resources) | service | done | pass resources to section prompts |
| ProjectsDataService.create (resources) | service | done | accept + persist resources (incl. fieldHints) |
| createDnaVersionInternal (resources) | service | done | carry resources in seed |
| updateDnaVersionInputs (resources) | service | done | handle resources in patch |
| normalizeResourceSnapshots | service | done | validate + normalize helper (preserves fieldHints) |
| enrichResourcesFromCatalog | service | done | refresh photo/data from catalog |
| assemble render context (resources) | service | done | inject resources into sections |
| team section (pitch-landscape) | service | done | new catalog section + HBS |
| partners section (pitch-landscape) | service | done | new catalog section + HBS |
| partners section (roya-presentation) | service | done | new catalog section + HBS |
| roya-presentation team (modify) | service | done | add name/photo, resource-backed |
| map integration (resource hints) | service | done | conditional team/partners in map |
| toResourceTypeLiteItem (aiContext) | service | done | lite endpoint returns aiContext |
| seedForWorkspace (aiContext backfill) | service | done | backfill aiContext on existing records |
| uploadDynamicPhotos | service | done | auto-upload base64 dynamic photos to S3 on save |
| uploadBase64ToS3 | service | done | S3 upload helper for dynamic photo fields |
| Project create resources step | page | done | new step 2: type-tabbed picker with fieldHints |
| Project edit resources section | page | done | resources picker in edit form with fieldHints |
| dna.core.v1.md prompt update | service | done | AI instructions for fields/aiHint structure |
| dna.v2.schema.json fields array | data-model | done | updated schema for fields array per resource |

## Blockers

- None

## Next action

- Merged ✓
