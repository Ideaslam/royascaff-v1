# Endpoints Registry — Backend

App key: `backend` · Base: `/api`

| Module | File | Endpoints | Route prefix |
|--------|------|-----------|--------------|
| public-auth | [public-auth.md](./public-auth.md) | 2 | `/api/v1/auth`, `/api/v1/tokenize` |
| public-checkout | [public-checkout.md](./public-checkout.md) | 8 | `/api/v1/checkout` |
| public-payments | [public-payments.md](./public-payments.md) | 3 | `/api/v1/payments` |
| auth | [auth.md](./auth.md) | 30 | `/api/merchant/v1/auth` |
| apps | [apps.md](./apps.md) | 26 | apps, keys, products, tokens, customers |
| gateways | [gateways.md](./gateways.md) | 87 | gateways, transactions, notifications, core, profile, audit, dashboard, health |
| merchant-team | [merchant-team.md](./merchant-team.md) | 17 | `/api/merchant/v1/merchants`, `/team`, `/invites` |
| admin | [admin.md](./admin.md) | 34 | `/api/admin/v1` — platform admin (auth, merchants, onboarding, audit, config, FX sync, payments, notifications health) |

**Total:** ~199 active endpoints
