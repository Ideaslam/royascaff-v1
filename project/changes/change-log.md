# Change Log

| # | Date | Type | Target app | Scope | Outcome | Folder |
|---|------|------|------------|-------|---------|--------|
| 001 | 2026-06-30 | new-app | admin-panel | Full admin panel — 8 modules, `/api/admin/v1`, `payup-frontend-admin` | Phase 2 actions complete | [change-001-admin-panel](./change-001-admin-panel/) |
| 002 | 2026-06-30 | modify-feature | admin-panel | Gateway catalog — logo, countries, multi-select form | Implemented | [change-002-gateway-catalog-logo-countries](./change-002-gateway-catalog-logo-countries/) |
| 003 | 2026-06-30 | modify-feature | admin-panel | Gateway catalog `enabled` — hide disabled from portal & payments | Implemented | [change-003-gateway-catalog-status](./change-003-gateway-catalog-status/) |
| 004 | 2026-06-30 | new-module | all-apps | Merchant workspace — multi-user orgs, roles, invites, AdminUser, ownership migration (userId→merchantId) | Implemented | [change-004-merchant-workspace-module](./change-004-merchant-workspace-module/) |
| 005 | 2026-08-24 | bug-fix | backend | Leftover `userId` queries/writes on merchant-owned documents | Implemented | [change-005-bug-fix-userid-to-merchantid](./change-005-bug-fix-userid-to-merchantid/) |
| 006 | 2026-08-24 | modify-page | customer-portal | Login footer: self-serve “Create an account” instead of request-an-account | Implemented | [change-006-login-register-link](./change-006-login-register-link/) |
| 007 | 2026-08-24 | modify-feature | customer-portal | Password reset: 15m email link + 2FA/passkey step-up | Implemented | [change-007-portal-password-reset](./change-007-portal-password-reset/) |
| 008 | 2026-08-26 | modify-endpoint | api-docs | Align Public + Merchant OpenAPI request/response with live Zod/controllers; review all endpoints | Implemented | [change-008-api-docs-request-response](./change-008-api-docs-request-response/) |
| 009 | 2026-08-26 | modify-page | customer-portal | Detail views (token, product, customer, payment) + sidebar: My Apps after Dashboard, Tokens nested | Implemented | [change-009-portal-detail-views-nav](./change-009-portal-detail-views-nav/) |
| 010 | 2026-08-26 | modify-feature | backend | Session original vs paid amounts + exchange rate (additive fields); OpenAPI docs | Implemented | [change-010-session-paid-currency](./change-010-session-paid-currency/) |
| 011 | 2026-08-30 | new-module | backend | Currency service behind `ICurrencyService`; `rateFromUsd` + `minorUnitExponent`; hourly fastFOREX sync via `fx-rates` queue + Redis cache | Implemented | [change-011-currency-fx-sync-service](./change-011-currency-fx-sync-service/) |
| 012 | 2026-08-30 | modify-feature | backend | Money minor-units foundation — integer minor amounts, `Money` responses, exact line allocation | Planned (blocked on 011) | [change-012-money-minor-units-foundation](./change-012-money-minor-units-foundation/) |
