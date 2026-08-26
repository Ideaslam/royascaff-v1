# Impact Analysis — Fix API-docs request/response contracts

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | complete | `payup-api-typescript` Zod in controllers; Mongoose models (`merchantId`/`createdBy`, no `userId` on Product) | OpenAPI schemas do not match Zod / models |
| Service(s) | complete | Existing merchant + public services — **no service changes** | — |
| Endpoint(s) | complete | `payup-api-typescript/src/routes/public-api/`, `merchant-panel/` | Live routes exist; published I/O is wrong or missing |
| Page(s) | n/a | `api-docs` Redoc from YAML only | — |
| Published spec | partial | `api-docs/openapi/payup-public.yml` (~13 ops), `payup-merchant.yml` (~166 ops) | Frontend-shaped bodies, `userId` owner fields, missing mounted routes |

Feature state: **complete** (APIs and specs exist) — this change **modifies** published contracts and **completes** undocumented mounted routes in OpenAPI.

## Affected Modules

All merchant + public modules whose routes are documented (or should be) in `api-docs`. Admin (`/api/admin/v1`) is out of scope.

## Plan vs Code Drift

| Finding | Evidence |
|---------|----------|
| Planning `auth.md` omits live email-verify routes | Code: `POST /auth/verify-email`, `POST /auth/resend-verification` in `auth.controller.ts`. Not in `endpoints/auth.md` or OpenAPI. |
| Merchant workspace is in plan, not in OpenAPI | `endpoints/merchant-team.md` EP-MT01–22 vs zero `/merchants`, `/team`, `/invites` paths in `payup-merchant.yml`. |
| Portal refund is in plan, not in OpenAPI | `EP-PY01` `POST /payments/:paymentId/refund` in `endpoints/apps.md`; mounted in `payments.controller.ts`; missing from YAML. |
| `AppInput.webhookUrl` in OpenAPI is not on create/update Zod | `createAppSchema` in `apps.controller.ts` has no `webhookUrl` (webhooks live under notifications). |
| Resource responses use `userId` / synthetic `id` | OpenAPI `App`, `Product`, `Customer`, `Company` — models use `_id`, `merchantId`, `createdBy`. |
| `ProductInput` is a flattened/partial frontend shape | Zod has `publishing`, `productOrganization`, `themeTemplate` + nested `inventory`/`shipping`/`variants`/`seo`; OpenAPI omits the first three and uses `additionalProperties: true` bags. |
| Public session docs vs Zod | `createSessionSchema` in `base-session.controller.ts` matches current public YAML split (web vs backend) — keep; do not copy portal product form onto either session body. |
| Empty public stubs | `payment-methods.routes.ts` and `checkout/ui/ui.controller.ts` mount but define no handlers — stay undocumented. |
| Gateway inbound webhooks | Mounted (`/v1/webhooks` → stripe/paypal). Out of public payment-surface spec (same as current checklist). |

## Plan Docs to Update

- [x] `project/actions/backend/endpoints/auth.md` — add verify-email + resend-verification
- [x] `project/actions/backend/endpoints/_index.md` — bump auth count
- [ ] services, pages, data-model, rules, description — no
- [ ] `merchant-team.md` / `apps.md` — already list the missing OpenAPI routes; I/O tables stay unless a field contradicts code

Published YAML is **api-docs code**, not a planning file. Updated in Step 5.4.

## Code files to change (Step 5.4)

| Action | File |
|--------|------|
| Modify | `api-docs/openapi/payup-public.yml` |
| Modify | `api-docs/openapi/payup-merchant.yml` |
| Create | `project/changes/change-008-api-docs-request-response/endpoint-review.md` (every mounted Public + Merchant route + verdict) |
| Modify | `api-docs/scripts/route-checklist.md` if the inventory changes |

No changes in `payup-api-typescript`, portal, checkout, or admin apps.

## Ripple Map

| Affected item | Type | Relationship | Breaks if changed? | Action needed |
|---------------|------|--------------|:------------------:|---------------|
| Portal / checkout / SDK HTTP clients | caller | consume live API, not Redoc | no | leave |
| Redoc Public + Merchant pages | viewer | generated from YAML | no (docs only) | regenerate with spec |
| Shared OpenAPI component schemas (`Product`, `App`, `Customer`, …) | shares-model | many merchant ops `$ref` them | yes (doc accuracy) | modify schemas in place |
| Admin OpenAPI | none | not published | — | leave |
| Runtime Zod / controllers | callee | source of truth | no | leave |

- Shared DTOs: OpenAPI components only.
- Auth: document existing schemes only.
- Async/webhooks: do not add public webhook ops.
- Data migration: no.

## Reuse Opportunities

- Reuse existing Zod objects in controllers as the field list (do not invent schemas).
- Reuse existing shared error responses in both YAML files.
- Reuse `endpoints/*.md` route tables as the inventory checklist; verify against routers.

## Risk

complexity **M** (volume: ~180 merchant + 13 public ops), cross-module **Y** (docs only), migration **N**

## Mounted-but-undocumented (add to Merchant OpenAPI)

| Method | Path |
|--------|------|
| POST | `/auth/verify-email` |
| POST | `/auth/resend-verification` |
| POST | `/payments/{paymentId}/refund` |
| POST | `/merchants` |
| GET | `/merchants/check-slug/{slug}` |
| GET | `/merchants/my` |
| GET | `/merchants/current` |
| PUT | `/merchants/current` |
| PATCH | `/merchants/current/onboarding` |
| DELETE | `/merchants/current` |
| GET | `/team/members` |
| PATCH | `/team/members/{memberId}/role` |
| DELETE | `/team/members/{memberId}` |
| POST | `/team/leave` |
| POST | `/invites` |
| GET | `/invites` |
| DELETE | `/invites/{inviteId}` |
| GET | `/invites/validate/{token}` |
| POST | `/invites/accept/{token}` |

## Recommendation

- **Create:** `endpoint-review.md` (full per-route verdict); OpenAPI operations for the 19 mounted-but-undocumented merchant routes above.
- **Complete:** every existing Public + Merchant operation’s request/response against Zod + `res.json`.
- **Modify:** `payup-public.yml`, `payup-merchant.yml` component schemas (`userId` → `merchantId`/`createdBy`/`_id`; drop frontend-only request fields such as `AppInput.webhookUrl`; expand `ProductInput` to Zod).
- **Leave:** backend/frontend/admin code; empty public stubs; inbound gateway webhooks; `/api/admin/v1`.
