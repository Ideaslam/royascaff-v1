# Change Request

## Metadata
- **date**: 2026-08-26
- **change-type**: modify-endpoint
- **target-app**: api-docs
- **affected-repos**: new-repo:api-docs
- **priority**: high

## Scope
- Module(s): All modules documented in `api-docs/openapi/` (Auth, Apps, Products, Customers, Payments & Checkout, Tokens, Gateways, Notifications, Profile, Merchant team surfaces present in the specs)
- Feature(s): Exhaustive review + correction of published OpenAPI request/response contracts
- Endpoint(s): **Every** mounted Public (`/api/v1/*`) and Merchant (`/api/merchant/v1/*`) route in `payup-api-typescript`, checked one-by-one against `payup-public.yml` and `payup-merchant.yml`. No endpoint skipped.
- Page(s)/View(s): none (Redoc is generated from the YAML; no Docusaurus page rewrite)
- Service(s): none (documentation only — source of truth is existing Zod schemas + controller JSON in `payup-api-typescript`)

## Description

**Problem.** The published API docs (`api-docs` Docusaurus + Redoc) do not match the live backend contracts. Request bodies and response shapes were copied from frontend form/service models (and leftover `userId` ownership fields) instead of the Express/Zod handlers. Integrators following the docs send the wrong payload (for example a portal/web session body on a backend session route, or a UI form model on a merchant write).

**Desired behavior.** Review **all** Public and Merchant endpoints — not a sample. For each live route, compare method, path, auth, query/path params, request body, and success/error response to the OpenAPI operation. Record the verdict (match / mismatch / documented-but-not-mounted / mounted-but-undocumented). Then fix every mismatch so the spec matches what `payup-api-typescript` validates and returns.

Frontend-only fields stay off backend/public write schemas. Server-stamped fields (`merchantId`, `createdBy`, `storeCode`, `_id`) are documented on responses only, never as required request fields.

**Who is affected.** External integrators and merchants reading Public + Merchant OpenAPI. No runtime change for portal, checkout, admin, or API servers.

**User story (happy).** A backend integrator copies `POST /api/v1/checkout/backend/session` from the docs, sends the backend session body (`products` as link and/or inline `{ name, price, quantity }`, optional `customer` `{ email, phone }`), and the request matches Zod. A merchant-API client creating a product sends the Zod `createProductSchema` fields, not a flattened Angular form.

**User story (edge).** Docs must not require `merchantId` / `createdBy` on public session or merchant create bodies. Response models use the real document shape (`_id`, `merchantId`, `createdBy`) instead of portal leftovers (`userId`, synthetic `id` when the API returns `_id`).

**Permissions.** Unchanged. Document existing auth as implemented (API keys, client token, SDK JWT, merchant JWT). Do not invent new scopes or publicize admin routes.

**Data changes.** None.

**Out of scope.** Changing backend or frontend code; adding/removing endpoints; documenting `/api/admin/v1`; rewriting Docusaurus prose except where an OpenAPI description is factually wrong; updating portal TypeScript interfaces.

## Acceptance Criteria
1. A written review in this change folder lists **every** mounted Public and Merchant route (method + path) with a verdict: match, mismatch (what is wrong), documented-but-not-mounted, or mounted-but-undocumented. No route is omitted.
2. Every path in `api-docs/openapi/payup-public.yml` has request and response schemas that match the corresponding Zod schema and `res.json` / `res.status` shape in `payup-api-typescript` public routes.
3. Every path in `api-docs/openapi/payup-merchant.yml` has request and response schemas that match the corresponding Zod schema and controller response in merchant-panel routes.
4. No merchant or public **request** schema includes frontend-only form fields, or server-stamped fields (`merchantId`, `createdBy`, `userId`, `storeCode`) as required input.
5. Public **web** session (`POST /checkout/web/session`) documents only linked products (`storeCode`, `quantity`) and no `customer` object; public **backend** session (`POST /checkout/backend/session`) documents linked + inline products and optional `{ email, phone }` customer.
6. Resource responses that the API returns as Mongoose documents document `_id` (and `merchantId` / `createdBy` where the model has them), not `userId` as the owner field.
7. Error responses stay the existing shared Unauthorized / Forbidden / Validation / NotFound / ServerError shapes already used by the specs; no new error envelope is invented.
8. No new endpoints, no backend/frontend code changes, and `/api/admin/v1` remains undocumented.

## Notes
- Source of truth order: route Zod (`validateBody` / `safeParse`) → controller status/body → Mongoose model fields on GET/create responses. Frontend services are **not** the source of truth.
- Known drift already spotted: `ProductInput` / `Product` / `Customer` / `App` / `Company` still expose `userId`; `ProductInput` omits backend fields `publishing`, `productOrganization`, `themeTemplate`.
- Planning registry tables in `.ai-control/project/actions/backend/endpoints/` stay as-is unless recon finds a documented I/O field that contradicts the code.
