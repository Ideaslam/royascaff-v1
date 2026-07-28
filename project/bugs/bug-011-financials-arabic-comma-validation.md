# Bug #011 — Financials validation still fails (Arabic comma / bidi marks)

## Status
**PENDING** — Fix in progress

## Reported
- **Date**: 2026-07-28
- **Severity**: high
- **Affected area**: api / creative-pipeline v2 (`validateSectionBundle`)

## Description
After bug-010 digit normalization, creative generation still fails with:

`Section batch failed: financials: financials section must include subtotal 15,500; financials section must include grand total 17,825`

Both amounts fail together (not only grand total).

## Expected Behavior
Accept common Arabic formatting of the same numeric totals (Arabic thousands comma `،`, bidi/ZW marks between digits).

## Root Cause
`contentContainsAmount` allowed `,` / `٬` but not Arabic comma `،` (U+060C), and did not strip bidi/zero-width characters (RLM/ZWSP) between digits — common in RTL HTML/JSON from the model.

## Fix Applied
1. Hardened `contentContainsAmount`: strip bidi/zero-width chars; treat Arabic comma `،` (U+060C) and `_`/`/`/`-` as thousand separators. Added unit tests for Arabic-comma totals.
2. Prompt guardrails: section + final HTML + repair instruct the model to use **Western digits only (0-9)** and copy financial amounts literally from source (no ٠-٩ / Arabic comma in numbers).


## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue


## Related Files
- `roya-sales-ai-api-v2/src/creative-pipeline/validate/validateSectionBundle.ts`
- `roya-sales-ai-api-v2/src/creative-pipeline/validate/validateSectionBundle.spec.ts`
