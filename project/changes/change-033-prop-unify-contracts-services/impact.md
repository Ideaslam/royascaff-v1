# Impact Analysis — change-033-prop-unify-contracts-services

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | complete | `contracts.serviceIds` Mixed; `proposals.services` Mixed | docs already prefer object line items; contracts still assume string IDs |
| Service(s) | partial | `contracts.data.service.ts` `extractServiceIdsFromProposal` + `loadServicesForIds` | `String(object)` → bad ids; SOW empty; ignores snapshot name/price/qty |
| Endpoint(s) | complete | `EP-CONTRACTS-04` create-from-proposal | no route change — behavior fix only |
| Page(s) | complete | FE `createContractFromProposal` | no FE change if BE returns filled HTML |

Feature state: **partial**

## Affected Modules
- Contracts (BE) — service extraction + resolve for SOW/financial
- Proposals — consumer of shared `services` shape (no write changes)
- Services catalog — read-by-id fallback for rich SOW fields

## Pack blueprint files to create
- [x] `blueprint/plan/data-model.md` — contracts.serviceIds + proposal services after-state
- [x] `blueprint/actions/api/services/contracts-services.md`
- [x] `blueprint/actions/api/endpoints/contracts-services.md`
- [x] `blueprint/_index.md` + pack `status.md`
- [ ] pages — skip (no FE change expected)

## Risk
- Complexity: **L**
- Cross-module: **N** (read proposals + catalog)
- Migration: **N** (no rewrite of historical bad `serviceIds`)

## Recommendation
- **Modify**: `extractServiceIdsFromProposal` + new resolve helper merging line-item snapshot with catalog
- **Modify**: `buildFinancialTableRows` to honor `qty` when present
- **Complete**: create-from-proposal SOW for object-shaped services

## Status target (per artifact after implement)
- data-model slice → done
- SVC-CONTRACTS-01 helpers → done
- EP-CONTRACTS-04 notes → done

## Dependencies
- depends-on: change-032 — **merged**
