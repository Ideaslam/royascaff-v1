# Bug #010 — Financials section fails on grand total validation (pipeline v2)

## Status
**DONE** — Confirmed 2026-07-28

## Reported
- **Date**: 2026-07-28
- **Severity**: high
- **Affected area**: api / creative-pipeline v2 (`validateSectionBundle`)

## Description
Creating a creative proposal fails at “Collecting section batch results…” with:

`Section batch failed: financials: financials section must include grand total 17,825`

`failureReason: section_validation`, `failedSectionIds: ["financials"]`. Subtotal validation passed for the same run; only grand total failed.

## Expected Behavior
Financials section should accept correct totals even when the model formats numbers with Arabic-Indic digits or alternate thousand separators, so the pipeline continues to HTML assembly.

## Steps to Reproduce (if applicable)
1. Create a creative proposal (pipeline v2) with Arabic output and services whose grand total formats with a thousands separator (e.g. 17,825).
2. Wait for section batch collection.
3. Observe job fail on financials grand-total string match.

## Root Cause
`validateSectionBundle` checks financial accuracy with naive `String.includes` for either the en-US localized amount (`17,825`) or digits with commas stripped (`17825`). Arabic RTL generations often emit Eastern Arabic-Indic digits (`١٧٨٢٥` / `١٧٬٨٢٥`) or separators other than `,` (`.`, narrow space, `٬`). Those forms contain the same numeric value but fail the check, failing the whole job with no repair path.

## Fix Applied
Hardened financial amount matching in `validateSectionBundle` to accept Arabic/Persian digits and common thousand separators; strengthened section-bundle prompt to require western digits as in `source.services`.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-sales-ai-api-v2/src/creative-pipeline/validate/validateSectionBundle.ts`
- `roya-sales-ai-api-v2/src/creative-pipeline/validate/validateSectionBundle.spec.ts`
- `roya-sales-ai-api-v2/src/creative-pipeline/prompts/section.bundle.v1.md`
