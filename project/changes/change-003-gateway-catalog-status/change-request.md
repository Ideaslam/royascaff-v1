# Change Request

## Metadata
- **date**: 2026-06-30
- **change-type**: modify-feature
- **target-app**: admin-panel + customer-portal (backend enforcement)
- **affected-repos**: backend, admin
- **priority**: high

## Scope
- Module: Available Gateways Catalog
- Feature: Catalog status flag (`active` / `inactive`)

## Description
Add an explicit **status** on platform catalog gateways (`AvailableGateway`). When **inactive**:
- Hidden from customer portal catalog lists (add-gateway picker, gateway rules options)
- Not returned by merchant/checkout public catalog APIs
- Cannot be newly configured by merchants
- Excluded from payment gateway selection (even if previously configured on an app)
- Still visible and editable in admin Gateway Catalog

`enabled` remains synced for backward compatibility but `status` is the source of truth.

## Acceptance Criteria
1. `AvailableGateway.status` is `active` or `inactive` (default `active`).
2. Admin can set status on create/edit in Gateway Catalog.
3. Inactive gateways are excluded from merchant portal catalog fetches.
4. Merchants cannot create a new app gateway for an inactive catalog entry.
5. Payment selection and processing skip inactive catalog gateways.
6. Admin list shows all gateways regardless of status.
