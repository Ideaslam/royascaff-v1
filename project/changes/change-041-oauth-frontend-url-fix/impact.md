# Impact Analysis — change-041: OAuth frontend URL fix

## Feature State
`complete` (with bug) — all four OAuth callback controllers exist and redirect correctly in concept, but silently fall back to `localhost:4200` in production because the config key is wrong.

## Code Reconnaissance
| File | Bug location |
|------|-------------|
| `src/modules/data/controllers/zid.controller.ts:32` | `config.get<string>('frontendUrl')` → undefined in production |
| `src/modules/data/controllers/salla.controller.ts:32` | `config.get<string>('frontendUrl')` → undefined in production |
| `src/modules/data/controllers/shopify.controller.ts:34` | `config.get<string>('frontendUrl')` → undefined in production |
| `src/modules/data/controllers/google-oauth.controller.ts:32` | `config.get<string>('frontendUrl')` → undefined in production |
| `src/config/config.ts:80` | Correct key: `app.frontendUrl` |

Services that already use the correct key (reference pattern): `auth.service.ts`, `sharing.service.ts`, `payment-checkout.service.ts`, `workspace-invitation.service.ts` — all use `config.get<string>('app.frontendUrl')`.

## Impact Map

### Backend — Modify
| File | Action |
|------|--------|
| `src/modules/data/controllers/zid.controller.ts` | Change `config.get<string>('frontendUrl')` → `config.get<string>('app.frontendUrl')` |
| `src/modules/data/controllers/salla.controller.ts` | Same |
| `src/modules/data/controllers/shopify.controller.ts` | Same |
| `src/modules/data/controllers/google-oauth.controller.ts` | Same |

### Planning docs to update
None — no endpoint behaviour changes, only a runtime bug fix.

## Risks
None — the correct env var (`FRONTEND_URL`) was always read; only the config lookup key path was wrong. No data migration needed.
