# Change Request

## Metadata
- **date**: 2026-07-27
- **change-type**: modify-feature
- **target-app**: api
- **affected-repos**: backend
- **priority**: high
- **request-id**: REQ-PROP-V3
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: verified

## Scope
- Module(s): Pipeline v3 — section generation / validation
- Feature(s): Section AI prompts + post-generation content schema validation
- Endpoint(s): — (no new/changed HTTP contracts)
- Page(s)/View(s): —
- Service(s): `SectionOrchestratorService`, `validateSectionContent`, translate orchestrator (shared validator)

## Description

Pipeline v3 section jobs often succeed at generation but fail validation because string fields slightly exceed catalog `maxLength` (e.g. title max 40, model returns 44). Each failure triggers costly retries (up to 3) and shows as failed validate rows in the AI Requests dashboard.

Two improvements:

1. **Prompts** — Make length budgets first-class: instruct the model to stay within each field’s `minLength`/`maxLength`, prefer ~85–90% of max, and treat overshoot as a hard failure risk. Inject a compact per-field length budget summary (not only the raw JSON schema) into the section user payload where practical.

2. **Validation (aim → soft-accept → clamp)** — For catalog `max` 100:
   - Prompt **aim = 90** (`SECTION_LENGTH_AIM_RATIO = 0.9`)
   - Soft-accept ≤ **110** (`SECTION_MAX_LENGTH_TOLERANCE = 0.10`)
   - On soft-pass, **clamp** stored strings back to catalog `max` (100) so deck layout never receives overshoot
   - Beyond soft max → hard fail → existing repair/retry
   - `minLength` and non-length schema errors stay strict
   - Shared by section generate + translate via `validateAndNormalizeSectionContent`

Out of scope: changing catalog limits themselves, frontend UI, richness min-depth gate, creative-pipeline.

## Acceptance Criteria
1. Section prompts insist writers **stick to `aim`** and never exceed `max` (character count).
2. Soft accept at `max + ceil(max * 0.10)`; hard fail above that.
3. Soft-pass content is clamped to catalog `maxLength` before save (layout-safe).
4. `minLength` and non-length schema errors remain strict.
5. Unit tests: exact max pass; +10% soft-pass + clamp; soft+1 fail; nested clamp.
6. User payload includes `lengthBudgets` with `min` / `max` / `aim` / `softMax`.
7. No API contract or frontend changes required.

## Notes (optional)
- **Confirmed practice (v2)**: 10% soft + clamp-to-max — saves retry cost without page clipping. Prompts are primary control (aim 90%).
- Prior 15%/no-truncate caused layout cut-off; superseded.
