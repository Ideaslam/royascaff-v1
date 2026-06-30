# Change Request

## Metadata
- **date**: 2026-06-30
- **change-type**: modify-feature
- **target-app**: admin-panel
- **affected-repos**: backend, admin
- **priority**: high

## Scope
- Module(s): Available Gateways Catalog (Module 14)
- Feature(s): Gateway catalog admin form — logo, countries, multi-select currencies/methods
- Endpoint(s): EP-AD29–32 (extend), EP-AD33 (form options), EP-AD34 (logo upload)
- Page(s)/View(s): admin-panel: Gateway Catalog (`/gateways/catalog`)
- Service(s): AdminAvailableGatewayService, AvailableGatewayService

## Description
Extend the platform `AvailableGateway` catalog so admins can set a gateway **logo** and **available countries**, and manage **currencies** and **payment methods** via PrimeNG multi-select controls instead of comma-separated text inputs.

Merchants and checkout flows that read the catalog should receive `logo` and `availableCountries` where applicable.

## Acceptance Criteria
1. `AvailableGateway` stores optional `logo` (public URL) and `availableCountries` (ISO 3166-1 alpha-2 codes).
2. Admin create/update endpoints accept and persist `logo` and `availableCountries`.
3. Admin can upload a logo image; upload returns a URL stored on the gateway.
4. Admin Gateway Catalog form uses multi-select for currencies, countries, and payment methods.
5. Gateway catalog table shows logo thumbnail and countries column.
6. Merchant available-gateway responses include `logo` and `availableCountries` when set.

## Notes
- Currencies options loaded from admin `/currencies` endpoint.
- Payment methods and countries exposed via admin form-options endpoint.
