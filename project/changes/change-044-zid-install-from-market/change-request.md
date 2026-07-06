# Change Request

## Metadata
- **date**: 2026-07-06
- **change-type**: new-feature
- **target-app**: backend + customer-portal
- **affected-repos**: backend + frontend
- **priority**: medium

## Scope
- Module(s): Data (backend), Auth + Data (frontend)
- Feature(s): Zid App Market install flow
- Endpoint(s): New EP-DATA-35 — GET /api/v1/data/zid/install (public, Zid Redirection URL)
- Page(s): New `/app/zid-install` landing page in customer-portal

## Description
Currently, Zid OAuth always starts from inside Dynamo (user is already logged in, clicks "Connect Zid"). If a merchant clicks **Install** from the Zid App Market, Zid redirects them to the **Redirection URL** — but no such endpoint/page exists in Dynamo. The merchant hits a 404, and no OAuth can be initiated.

Desired behaviour:
1. Merchant clicks Install on Zid App Market → Zid redirects to `{API}/api/v1/data/zid/install?shop=...` (or the frontend Redirection URL directly if set to the frontend).
2. The install endpoint detects if the request carries a valid Dynamo JWT (user already logged in) or not.
3. If logged in: redirect the merchant directly to the standard OAuth auth-url flow (EP-DATA-32 → Zid consent → callback → provisioned).
4. If NOT logged in: redirect to Dynamo frontend `/app/zid-install` landing page which prompts login/signup, then continues the OAuth flow after auth.

Frontend `/app/zid-install` page:
- Shows a branded "Connect your Zid store to Roya Dynamo" screen.
- Offers Login and Sign Up options.
- After successful auth, automatically triggers `GET /data/zid/auth-url` and redirects to Zid consent.
- Route is public (no auth guard).

## Acceptance Criteria
1. `GET /api/v1/data/zid/install` exists as a public endpoint (EP-DATA-35).
2. If JWT present in query/cookie: redirects directly to Zid OAuth consent URL.
3. If no JWT: redirects to `/app/zid-install` (frontend landing page).
4. Frontend `/app/zid-install` page renders and allows login/signup.
5. After login/signup on that page, the user is automatically redirected through the Zid OAuth flow.
6. App compiles with no TypeScript errors. Frontend has no hardcoded API URLs.

## Notes
- The Zid Partner Dashboard **Redirection URL** should be set to `{API}/api/v1/data/zid/install`.
- This parallels how Shopify's install URL endpoint works in Shopify's OAuth spec.
- Frontend page reuses the existing auth forms — no duplication of auth logic.
