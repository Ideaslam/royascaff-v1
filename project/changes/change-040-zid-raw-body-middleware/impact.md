# Impact Analysis — change-040: Raw body middleware

## Feature State
`partial` — webhook endpoints exist and attempt to read `req.rawBody`, but `main.ts` never enables raw body preservation, so the value is always `undefined` and HMAC validation always fails.

## Code Reconnaissance
| File | Finding |
|------|---------|
| `src/main.ts` | `NestFactory.create(AppModule, { logger: [...] })` — missing `rawBody: true` |
| `src/modules/data/controllers/shopify.controller.ts` | reads `(req as any).rawBody` — will work once enabled |
| `src/modules/data/controllers/salla.controller.ts` | reads `(req as any).rawBody` — will work once enabled |
| `src/modules/data/controllers/zid.controller.ts` | reads `(req as any).rawBody` — will work once enabled |

## Impact Map

### Backend — Modify
| File | Action |
|------|--------|
| `src/main.ts` | Add `rawBody: true` to `NestFactory.create()` options |

### Planning docs to update
None — this is a bootstrap configuration fix; no endpoint spec changes required.

## Risks
None — `rawBody: true` simply attaches an extra `Buffer` to each request; has no effect on normal (non-webhook) endpoints and no memory overhead for small payloads.
