# Services — Contracts services parity · change-20260728-000033

Status: **done**

### SVC-CONTRACTS-01 · ContractsDataService (modify)

**`extractServiceIdsFromProposal(proposal)`**
- If `proposal.services` is array:
  - string/number → `String(id)`
  - object → `String(item.id)` when present
- Else fallback: `creativeOptions.services.selectedServiceIds` (unchanged)
- Filter empties; return unique string ids

**`resolveServicesForContract(proposal)`** (new helper or private method)
1. Collect line items from `proposal.services` (string → `{ id }`, object → keep fields)
2. For each item: load catalog by `id` when available
3. Merge: catalog base + line-item overrides (`name`, `price`, `qty`, `unit`, descriptions)
4. If no `proposal.services` but selectedServiceIds exist → catalog-only rows (legacy)
5. Return `{ serviceIds, services }`

**`createContractFromProposal`**
- Use resolve helper instead of ids-only + `loadServicesForIds`
- Persist clean `serviceIds`

**`buildFinancialTableRows`**
- Line amount = `(price ?? 0) * (qty ?? 1)` when qty present; tax on line amount
- Keep proposal totals fallback when no service rows

## Delta

- Object line items → populated SOW + financial rows
- Legacy string IDs unchanged
