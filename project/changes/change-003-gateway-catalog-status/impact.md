# Impact — change-003-gateway-catalog-status

## Feature state
**Partial** — `enabled` boolean exists but is not enforced on payment selection or merchant gateway create/list for previously configured gateways.

## Changes
| Layer | Files |
|-------|-------|
| Model | `AvailableGateway.ts`, `gateway-constants.ts` |
| Repository | `available-gateway-repository.ts` |
| Service | `available-gateway-service.ts`, `gateway-service.ts`, `gateway-selection-service.ts`, `admin-available-gateway-service.ts` |
| Routes | `admin-v1.routes.ts` (schemas) |
| Admin FE | `gateway-catalog.component.ts`, `admin-available-gateways.service.ts` |
| Seed | `seed-available-gateways.ts` |
| Plan | `data-model.md`, `admin.md` endpoints |

## Ripple
- `AppGatewayService` already uses `getAvailableGateways()` — inherits active filter.
- Customer portal filters `enabled` — add `status === 'active'` defensively.
