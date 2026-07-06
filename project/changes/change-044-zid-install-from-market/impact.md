# Impact Analysis — change-044: Install-from-Zid App Market flow

## Feature State
`none` — no Zid Redirection URL handler exists. Merchants arriving from Zid App Market get a 404.

## Code Reconnaissance
| File | Finding |
|------|---------|
| `zid.controller.ts` | Has `GET /data/zid/auth-url` (JWT-guarded) and `GET /data/zid/callback` (public). No install/redirect handler. |
| `zid-oauth.service.ts:buildAuthUrl()` | Builds Zid consent URL from workspaceSlug+userId; already works for logged-in flow. |
| `app.routes.ts` | `/app/data/connect/:type` exists; no `/app/zid-install` route. |
| `auth.service.ts` | JWT issue/validation in place; can be reused. |
| Existing Shopify install | `GET /data/shopify/install-url` (JWT-guarded) — no public install handler there either (Shopify embed flow differs). |

## Impact Map

### Backend — Modify
| File | Action |
|------|--------|
| `src/modules/data/controllers/zid.controller.ts` | Add `GET /data/zid/install` (EP-DATA-35) — public; reads optional JWT from `Authorization` header; if valid JWT redirects to Zid consent URL; if no JWT redirects to `{frontendUrl}/app/zid-install` |

### Frontend — Create New
| File | Action |
|------|--------|
| `src/app/pages/zid-install/zid-install.page.ts` | New public landing page: "Connect Zid Store to Roya" with Login / Sign Up buttons |

### Frontend — Modify
| File | Action |
|------|--------|
| `src/app/app.routes.ts` | Add `{ path: 'app/zid-install', ... }` (public, no auth guard) |

### Planning docs to update
| Doc | Update |
|-----|--------|
| `project/actions/backend/endpoints/data.md` | Add EP-DATA-35 |
| `project/actions/customer-portal/pages/data.md` | Add `/app/zid-install` page entry |
| `project/plan/modules.md` | Update feature #1 note in Data module |

## Risks
- JWT reading from Authorization header on a redirect-based endpoint requires special handling (Zid may not carry the header). In practice, the frontend landing page approach (no-JWT path) is the primary path.
- Page needs to store redirect intent (proceed to Zid OAuth after login) in `sessionStorage` to survive the auth redirect loop.
