# Change Request

## Metadata
- **date**: 2026-07-28
- **change-type**: modify-feature
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: high
- **request-id**: REQ-PROP-UNIFY
- **part**: 3/3
- **depends-on**: change-20260728-000032
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Contracts, Proposals (services shell consumers), Services catalog (read)
- Feature(s): Contract create/SOW/financial table from proposal line items works for object-shaped `services` (v2+v3) and legacy string IDs
- Endpoint(s): existing contract create-from-proposal (+ any thin helpers if needed); no new collections
- Page(s)/View(s): `/contracts` create-from-proposal / edit preview if it surfaces empty SOW
- Service(s): `ContractsDataService.extractServiceIdsFromProposal` / load + render helpers; FE only if it assumes `string[]`

## Description

Close the last REQ-PROP-UNIFY gap: **Contracts** still treat `proposal.services` as a `string[]` of catalog IDs (`String(x)` on objects → useless IDs → empty SOW / financial rows). Unified proposals (v2+v3) store **object line items** `{ id, name, price, qty, … }`.

**This pack (3/3):**
1. Normalize service extraction: accept string IDs **or** objects with `id` (and optional snapshot fields).
2. Prefer proposal line-item snapshots (name/price/qty/descriptions) for SOW + financial table when present; fall back to catalog by id when only IDs exist.
3. Persist `contract.serviceIds` as clean string IDs (not `"[object Object]"`).
4. Keep legacy v2 rows that still use string IDs or `creativeOptions.services.selectedServiceIds`.
5. Smoke FE create-from-proposal for endorsed v3 (and v2) proposals — SOW + totals populated.

**Out of scope:**
- New contract templates / legal wording redesign
- Migrating historical contracts that already stored bad `serviceIds`
- Hard-delete `aiJobs`
- Changing catalog CRUD

## Acceptance Criteria

1. Create contract from an endorsed **v3** proposal with object `services[]` → SOW lists those services and financial table shows prices/qty/totals (not empty).
2. Create contract from an endorsed **v2** (unified) proposal with object line items → same as (1).
3. Legacy proposal with `services: string[]` still creates a contract with catalog-resolved rows.
4. Stored `contract.serviceIds` is `string[]` of real catalog/service ids only.
5. Proposal money fields (`total`/`tax`/`grandTotal`) still drive contract financial footer when present.
6. No regression on contract edit/send/signed upload paths.

## Notes (optional)

- Root cause today: `extractServiceIdsFromProposal` maps `direct.map((x) => String(x))` without unwrapping `{ id }`.
- Prefer complete-in-place on `ContractsDataService` (+ small unit-friendly helpers) over new modules.
