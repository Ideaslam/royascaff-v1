# Verification — Section length prompts + soft maxLength

## Plan Consistency (pre-build)
- [x] Soft max + lengthBudgets in pack service blueprint
- [x] Rules delta documents 15% / no truncate
- [x] Recon findings reflected (pipeline-v3 only)

## Code Verification (post-build)
- [x] `SECTION_MAX_LENGTH_TOLERANCE = 0.15`; soft schema via `withSoftMaxLength`
- [x] `validateSectionContent` used by section + translate (shared)
- [x] `lengthBudgets` injected in section + translate user payloads
- [x] Prompts updated: generic, research, translate, depth-contracts
- [x] Unit tests: exact max / +15% / +15%+1 / minLength still strict — **5/5 PASS**
- [x] No API/FE contract changes
- [x] Acceptance criteria met

## Acceptance criteria check
1. Length-budget prompt language — PASS
2. Soft max `ceil(max * 1.15)` — PASS
3. Beyond soft max still fails — PASS (date 47 fails)
4. minLength strict — PASS
5. Unit tests — PASS
6. `lengthBudgets` in payloads — PASS
7. No FE/API contract change — PASS

## Result: PASS

**Overall: PASS**
