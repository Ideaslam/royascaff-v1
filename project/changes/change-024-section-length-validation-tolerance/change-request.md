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

2. **Validation** — Soften strict AJV `maxLength` with a **15% ratio** (aligned with legacy creative-pipeline `maxWords * 1.15`): soft max = `ceil(maxLength * 1.15)`. Example: catalog max 40 → accept ≤ 46. Keep hard fail beyond soft max; `minLength` and other schema errors stay strict. Same soft max for section generate + translate via `validateSectionContent`. Catalog maxima remain prompt targets; tolerance is validation-only. **No truncate** on soft-pass (preserve meaning; prompts keep most outputs under hard max).

Out of scope: changing catalog limits themselves, frontend UI, richness min-depth gate, creative-pipeline (legacy already has word overshoot).

## Acceptance Criteria
1. Section prompts (generic + research + translate at minimum) explicitly teach field length budgets and prefer writing under max (target ~85–90% of maxLength).
2. `validateSectionContent` accepts strings whose length is `≤ ceil(maxLength * 1.15)` (`SECTION_MAX_LENGTH_TOLERANCE = 0.15`).
3. Strings longer than the soft max still fail validation and still trigger the existing repair/retry loop.
4. `minLength` and non-length schema errors remain strict (no soft under-length).
5. Unit test covers: exact max → pass; at soft max (+15%) → pass; soft max + 1 → fail.
6. User payload includes compact `lengthBudgets` derived from `contentSchema`.
7. No API contract or frontend changes required.

## Notes (optional)
- **Confirmed practice**: 15% soft max, no truncate — best cost (fewer Claude retries) with acceptable layout risk; prompts are the primary length control.
- Depth-contracts must not push writers to ignore maxLength.
