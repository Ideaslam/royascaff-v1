# Endpoints Registry — Backend

App key: `backend` · Base: `/api`

| Module | File | Endpoints | Route prefix |
|--------|------|-----------|--------------|
| public-auth | [public-auth.md](./public-auth.md) | 2 | `/api/v1/auth`, `/api/v1/tokenize` |
| public-checkout | [public-checkout.md](./public-checkout.md) | 8 | `/api/v1/checkout` |
| public-payments | [public-payments.md](./public-payments.md) | 3 | `/api/v1/payments` |
| auth | [auth.md](./auth.md) | 28 | `/api/merchant/v1/auth` |
| apps | [apps.md](./apps.md) | 26 | apps, keys, products, tokens, customers |
| gateways | [gateways.md](./gateways.md) | 87 | gateways, transactions, notifications, core, profile, audit, dashboard, health |

**Total:** ~146 active endpoints · Stubs: `/api/v1/webhooks`, `/api/v1/payment-methods`, `/api/v1/checkout/ui`, `/api/admin`
