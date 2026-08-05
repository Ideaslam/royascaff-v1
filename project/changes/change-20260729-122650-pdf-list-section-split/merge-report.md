# Merge Report — change-20260729-122650-pdf-list-section-split

- **Merged date**: 2026-08-05
- **pack-status**: merged
- **Verified by**: verify-code.md Overall PASS

## Main files updated

| Main path | Action |
|-----------|--------|
| `project/plan/modules.md` | in-place: Creative §8/10/11 list-split + financial part/full + partitionRows; Templates §4 presentation flags |
| `project/actions/api/services/templates.md` | in-place: SVC-TPL-02 financial context; SVC-TPL-04 list-split + financial_part/full |
| `project/actions/api/services/pipeline-analyze-map.md` | in-place: SVC-PIPE-AM-03 presentation listSplit + financial XOR validation |
| `project/actions/api/services/pipeline-sections-engine.md` | in-place: SVC-PIPE-S3-05 `partitionRows` + financial inject; SVC-PIPE-S3-09 partition prompts |

## Skipped (unchanged)

- `project/plan/data-model.md` — presentation-local catalog keys only
- No main `pipeline-assemble.md` (Assemble stays in sections-engine)
- Pack 5 later generalizes allowlist wording on the same surfaces

## Post-merge checks

- [x] No leftover change-* sections appended to main files
- [x] Pack assemble content landed in `pipeline-sections-engine.md` SVC-PIPE-S3-05
- [x] `change-log.md` row moved to Completed with Merged date
- [x] Pack `status.md` + change-request metadata set to `merged`
