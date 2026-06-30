# Impact — change-002-gateway-catalog-logo-countries

## Feature state
**Partial** — catalog CRUD exists; missing logo, countries, and proper multi-select UI.

## Code changes

| Area | Action | Files |
|------|--------|-------|
| Data model | Modify | `AvailableGateway` model |
| Constants | Create | `country-constants.ts` |
| Service | Modify | `available-gateway-service.ts`, `admin-available-gateway-service.ts` |
| Endpoints | Modify + create | `admin-v1.routes.ts` (schemas, form-options, logo upload) |
| Merchant API | Modify | `gateways.controller.ts` (expose new fields) |
| Seed | Modify | `seed-available-gateways.ts` |
| Admin FE service | Modify | `admin-available-gateways.service.ts` |
| Admin FE page | Modify | `gateway-catalog.component.ts` |
| Plan docs | Modify | `data-model.md`, `admin.md` endpoints, `admin-panel.md` |

## Ripple
- `GET /merchant/v1/gateways/lite` already reads `logo` — will work once field exists.

## Risks
- Logo upload requires S3 configured; falls back to URL input if upload fails.
