# Verify Code — change-003-gateway-catalog-status

**Overall: PASS** (implemented via `enabled` only — no separate `status` field)

## Checks
- [x] `AvailableGateway.enabled` is the catalog visibility flag (default `true`)
- [x] `findEnabled()` filters merchant/checkout/payment catalog reads
- [x] Merchant create gateway blocked when catalog disabled (`assertCatalogActive`)
- [x] Payment gateway selection excludes disabled catalog entries (`filterByActiveCatalog`)
- [x] Merchant gateway list/detail hides disabled catalog gateways
- [x] Admin catalog shows Enabled checkbox; lists all gateways (incl. disabled)
- [x] Backend type-check passes

## Note
Change request originally proposed a `status` enum. Implementation uses existing `enabled` boolean as the single source of truth — same behavior, simpler model.

## Acceptance criteria
All 6 criteria from change-request.md — PASS (via `enabled`)
