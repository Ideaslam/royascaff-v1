# Services — Safqa API · Contracts

### SVC-CONTRACTS-01 · ContractsDataService [domain, internal, Contracts]
- Status: done
- Methods: list/search/get/create/patch/delete; send; update status; upload signed file; `createContractFromProposal`
- Deps: LegalContractsRepository, ServicesCatalogRepository, ProposalsDataService, ClientsDataService, S3Service, MailjetService
- Side effects: email, file
- Notes (REQ-PROP-UNIFY part 3):
  - `extractServiceIdsFromProposal` accepts string ids **or** `{ id }` objects
  - `resolveServicesForContract` merges proposal line-item snapshots with catalog for SOW + financial
  - `buildFinancialTableRows` uses `price × (qty || 1)`
  - Persists clean `serviceIds: string[]`
