# Verification — change-20260728-000033-prop-unify-contracts-services

## Plan Consistency
- [x] Pack blueprint covers extract/resolve/qty + endpoint notes
- [x] No main blueprint edits before merge
- [x] depends-on change-20260728-000032 merged

## Code Verification

| Check | Result |
|-------|--------|
| `extractServiceIdsFromProposal` unwraps `{ id }` | PASS |
| `resolveServicesForContract` merges snapshot + catalog | PASS |
| `createContractFromProposal` uses resolve helper | PASS |
| Financial rows honor `qty` | PASS |
| Legacy `selectedServiceIds` / string[] still work | PASS |
| FE unchanged (BE returns filled HTML) | PASS |
| API `tsc --noEmit` | PASS |

## Acceptance Criteria

1. v3 object services → SOW/financial populated — PASS (resolve path)
2. v2 unified object line items — PASS (same path)
3. Legacy string[] — PASS (`serviceIdFromProposalEntry` + catalog load)
4. `serviceIds` clean strings — PASS
5. Proposal totals footer fallback kept — PASS (`buildFinancialTableRows`)
6. Edit/send/signed untouched — PASS

## Result: **PASS**

## Manual smoke
- [ ] Endorse a v3 proposal with object services → create contract → SOW lists services
- [ ] Endorse a v2 unified proposal → create contract → financial rows present
- [ ] Legacy string-id proposal still creates contract
