# Bug #012 — Financials validation still fails (Arabic comma / bidi marks)

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
1. Hardened `contentContainsAmount` (Arabic digits/comma/bidi) + prompt western-digit rules.
2. **Numeric money parse** so decimals like `9,343.75` match `9343.75` / Arabic forms.
3. **Stamp canonical western totals** from `source.services` onto financials `content` before validate — AI omit/reformat no longer fails the section batch.


## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue


## Related Files
- `roya-sales-ai-api-v2/src/creative-pipeline/validate/validateSectionBundle.ts`
- `roya-sales-ai-api-v2/src/creative-pipeline/validate/validateSectionBundle.spec.ts`
