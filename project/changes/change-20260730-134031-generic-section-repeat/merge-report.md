# Merge Report — change-20260730-134031-generic-section-repeat

- **Merged date**: 2026-08-05
- **pack-status**: merged
- **Verified by**: verify-code.md Overall PASS

## Main files updated

| Main path | Action |
|-----------|--------|
| `project/plan/modules.md` | in-place: Creative §8 any-repeatable-key wording; Templates §4 social_audit max 2 + attribute website lock + ENTITY_DRIVEN |
| `project/actions/api/services/templates.md` | in-place: SVC-TPL-04 social_audit; SVC-TPL-08 attribute lock; new SVC-TPL-11 `deriveArrayCapacityHints` |
| `project/actions/api/services/pipeline-analyze-map.md` | in-place: SVC-PIPE-AM-03 catalog-driven listSplit/clamp/validate (pack Map content remapped from pack `pipeline-sections-engine.md`) |
| `project/actions/api/services/_index.md` | Templates SVC-TPL-01..11 · 11/11 |
| `project/status.md` | Templates 10/10 → 11/11 |

## Skipped (unchanged)

- Assemble / financial HBS / section partition prompts (owned by pack 4; left as merged)
- `project/profile.md` / `project/rules.md`

## Post-merge checks

- [x] Pack Map content landed in `pipeline-analyze-map.md` (not sections-engine)
- [x] Supersedes pack 4 allowlist with catalog-driven repeat + `social_audit`
- [x] No leftover change-* sections appended to main files
- [x] `change-log.md` row moved to Completed with Merged date
- [x] Pack `status.md` + change-request metadata set to `merged`
