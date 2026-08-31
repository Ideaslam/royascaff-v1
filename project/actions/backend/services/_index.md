# Services Registry — Backend

App key: `backend` · Repo: `payup-api-typescript`

| Module | File | Services | Purpose |
|--------|------|----------|---------|
| auth | [auth.md](./auth.md) | 6 | Register, login, 2FA, passkeys, OAuth, password reset |
| apps | [apps.md](./apps.md) | 4 | Apps, settings, API keys, account settings |
| payments | [payments.md](./payments.md) | 8 | Sessions, money module, merchant session queries, processing, status sync, SDK tokens |
| gateways | [gateways.md](./gateways.md) | 9 | Gateway adapters, rules, selection, onboarding |
| notifications | [notifications.md](./notifications.md) | 14 | Event bus, channels, webhook endpoints, merchant CRUD, inbox, workers |
| merchant-team | [merchant-team.md](./merchant-team.md) | 5 | Merchant CRUD, membership, invites, admin user, context middleware |
| admin | [admin.md](./admin.md) | 10 | Platform admin: auth, dashboard, merchants, onboarding, audit, config, payments health |
| core | [core.md](./core.md) | 19 | Dashboard, products, tokens, customers, profile, verification, currency, FX rate sync, audit, email, storage, encryption, domain, media, libraries, rate limit |

**Total:** 8 module files · ~75 service classes
