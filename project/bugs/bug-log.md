# Bug Log

| # | Date | Severity | Area | Summary | Status | File |
|---|------|----------|------|---------|--------|------|
| 001 | 2026-06-30 | medium | backend/notifications | Delivery redeliver endpoint returned success without resending | DONE | [bug-001-delivery-redeliver-stub.md](./bug-001-delivery-redeliver-stub.md) |
| 002 | 2026-06-30 | high | admin-panel/lists | Admin list pages NG0900 — API wrapped objects passed to p-table | PENDING | [bug-002-admin-list-ngfor-object.md](./bug-002-admin-list-ngfor-object.md) |
| 003 | 2026-08-24 | high | backend/payments | Sandbox tokens queried live gateways when NODE_ENV=production | DONE | [bug-003-sandbox-gateway-production.md](./bug-003-sandbox-gateway-production.md) |
| 004 | 2026-08-24 | high | backend/checkout | OTP verify shared a 5/IP high-sensitive bucket and blocked shoppers | DONE | [bug-004-checkout-otp-rate-limit.md](./bug-004-checkout-otp-rate-limit.md) |
| 005 | 2026-08-24 | high | backend/checkout | B2B session inline product missing createdBy (stamped from App) | DONE | [bug-005-b2b-session-product-createdby.md](./bug-005-b2b-session-product-createdby.md) |
| 006 | 2026-08-26 | critical | portal/lists | App switch + PrimeNG onLazyLoad both called load (infinite list requests) | DONE | [bug-006-payments-app-filter-infinite-loop.md](./bug-006-payments-app-filter-infinite-loop.md) |
| 007 | 2026-08-26 | high | portal/gateway-rules | List failed 400 — GatewayRulesService omitted X-Merchant-Id | DONE | [bug-007-gateway-rules-missing-merchant-header.md](./bug-007-gateway-rules-missing-merchant-header.md) |
| 008 | 2026-08-30 | critical | backend/payments | KWD/BHD/OMR charged at 1/10th — Stripe & Moyasar hardcoded ×100 instead of per-currency exponent | DONE | [bug-008-three-decimal-currency-undercharge.md](./bug-008-three-decimal-currency-undercharge.md) |
| 009 | 2026-09-03 | high | portal/apps | Edit Application loaded list row instead of details — brand name and checkout checkboxes looked unsaved | DONE | [bug-009-app-edit-uses-list-row.md](./bug-009-app-edit-uses-list-row.md) |
| 011 | 2026-09-03 | critical | backend/rate-limiting | Rate limiting silently disabled API-wide — `rate-limiter-flexible` autodetection failed on `redis` v5 (anonymous client class), took the ioredis path, and every `consume()` threw into fail-open | DONE | [bug-011-rate-limiter-fails-open.md](./bug-011-rate-limiter-fails-open.md) |
