# Bug 20260729-193600 — Visual section imageRef fails richness (too thin)

## Status
**DONE** — Confirmed 2026-07-29

## Reported
- **Date**: 2026-07-29
- **Severity**: high
- **Affected area**: API Pipeline v3 sections / `richness.gate.ts`

## Description
Visual sections (`banner`, and sometimes other image-only content) fail validation with `content too thin (N chars)` because project image IDs are short (`img_` + 8 hex = 12 chars, e.g. `img_52479576`).

## Expected Behavior
Valid visual content that only carries known `imageRef` / `images[]` IDs should pass richness. Short ID refs are intentional, not thin prose.

## Steps to Reproduce (if applicable)
1. Project has DNA images with ids like `img_52479576`.
2. Map includes a `banner` section.
3. Section writer emits `{ "imageRef": "img_52479576" }`.
4. Validation fails: `banner: content too thin (27 chars)` (threshold 40).

## Root Cause
`assertRichness` applies a global `JSON.stringify(content).length < 40` check to every section. Banner schema is image-only (`imageRef` min 1 / max 80). A typical blob is `{"imageRef":"img_52479576"}` → **27 chars**, so a valid visual section is rejected.

## Fix Applied
Skip the global 40-char blob richness check for visual section keys (`banner`, `full_bleed_banner`, `images_gallery`). Short `img_…` ID refs remain valid; title/prose checks still apply when those fields are present.

## Verification
- [x] Fix implemented in code
- [x] Unit tests added (`richness.gate.spec.ts`)
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-sales-ai-api-v2/src/pipeline-v3/section/richness.gate.ts`
- `roya-sales-ai-api-v2/src/pipeline-v3/section/richness.gate.spec.ts`
- `roya-sales-ai-api-v2/src/pipeline-v3/templates/shared/visual-sections.ts` (keys reference)
