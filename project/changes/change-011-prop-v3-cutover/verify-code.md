# Verify Code — change-011-prop-v3-cutover

- **date**: 2026-07-26
- **result**: PASS
- **request-id**: REQ-PROP-V3 (part 8/8)

## Checks

| Acceptance | Evidence | Status |
|------------|----------|--------|
| Backfill script dry-run/apply + idempotent | `scripts/backfill-legacy-proposals-to-projects.js`; npm `backfill:legacy-projects` | PASS |
| Flag default true + seed field | `settings-schema.ts` default true; seed `system.pipelineV3Enabled`; FE state default true | PASS |
| Flag on → Creative demoted | sidebar hides `/creative`; page banner + disabled generate | PASS |
| Flag on → new creative creates rejected | `ai-jobs.controller` `assertLegacyCreativeAllowed` → 403 | PASS |
| Flag off → legacy escape hatch | gate only when `isPipelineV3Enabled`; nav shows Creative when false | PASS |
| Builds; poller not deleted | API + FE `npm run build` exit 0; `poll-batch-jobs` untouched | PASS |

## Gaps / notes

- Backfill not executed against a live DB in this verify (script present; ops run separately).
- Existing workspace docs that already store `pipelineV3Enabled: false` stay off until patched.
- Hard delete of batch poller deferred.

## Verdict

**PASS** — ready for merge gate (Step 5.6).
