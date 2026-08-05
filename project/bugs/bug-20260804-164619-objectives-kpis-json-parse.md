# Bug 20260804-164619 — objectives_kpis JSON parse fails (Pipeline V2)

## Status
**PENDING** — Fix implemented; awaiting user confirmation

## Reported
- **Date**: 2026-08-04
- **Severity**: high
- **Affected area**: api / creative-pipeline v2 (`extractJsonObject` → section batch collect)

## Description
Creating a proposal via Pipeline V2 fails during the section batch phase with:

`objectives_kpis: JSON parse Expected double-quoted property name in JSON at position 154 (line 1 column 155)`

## Expected Behavior
Section batch JSON from Claude (including `objectives_kpis`) should parse successfully when the payload is valid JSON with common LLM artifacts (trailing commas, optional fences / surrounding text).

## Steps to Reproduce (if applicable)
1. Create / generate a proposal with Pipeline V2 (creative pipeline).
2. Wait for section batch results.
3. Observe job failure when `objectives_kpis` batch text cannot be `JSON.parse`d.

## Root Cause
`collectSectionBundles` calls `extractJsonObject(text)`, which only strips optional markdown fences then runs `JSON.parse`.

Claude often emits near-JSON with **trailing commas** after the last property/array element (e.g. `{"metric":"x",}` or `{"a":1,}`). Node’s `JSON.parse` reports that as exactly:

`Expected double-quoted property name in JSON at position N`

Position ~154 is early in a `SectionBundle` (`schema` / start of `content`), so a first nested trailing comma is enough to fail the whole section and abort the batch.

Pipeline v3 already has a slightly richer extractor (`parseJsonFromLlm`) but still does **not** strip trailing commas; v2’s helper is even thinner. No repair path exists before fail.

## Fix Applied
Hardened `extractJsonObject` (Path B):
1. Unwrap markdown fences (full-body or inline).
2. Retry parse after stripping trailing commas before `}` / `]`.
3. Fallback: extract outermost `{...}` (+ trailing-comma strip) when prose surrounds JSON.
4. Unit tests cover trailing commas, fences, surrounding prose, and the Node error signature.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced (`jsonExtract.spec` passes)
- [ ] User confirmed fix resolves the issue

## Related Files
- `roya-sales-ai-api-v2/src/creative-pipeline/utils/jsonExtract.ts`
- `roya-sales-ai-api-v2/src/creative-pipeline/utils/jsonExtract.spec.ts` (new)
- `roya-sales-ai-api-v2/src/creative-pipeline/orchestrate/processCreativePipelineAfterBatch.ts` (caller unchanged)
