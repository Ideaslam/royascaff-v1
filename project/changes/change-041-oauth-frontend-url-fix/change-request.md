# Change Request

## Metadata
- **date**: 2026-07-06
- **change-type**: modify-feature
- **target-app**: backend
- **affected-repos**: backend
- **priority**: high

## Scope
- Module(s): Data (OAuth controllers)
- Feature(s): OAuth callbacks for Zid, Salla, Shopify, Google Sheets
- Endpoint(s): EP-DATA-25, EP-DATA-27, EP-DATA-30, EP-DATA-33
- Service(s): —

## Description
All four OAuth callback controllers read `config.get<string>('frontendUrl')` to build post-OAuth redirect URLs. However, the frontend URL is registered in config under the nested key `app.frontendUrl` (not a top-level `frontendUrl`). As a result, `config.get('frontendUrl')` always returns `undefined`, the fallback `?? 'http://localhost:4200'` applies, and in production every OAuth callback redirects merchants to `localhost:4200` instead of the real frontend.

Fix: change all four controllers to use `config.get<string>('app.frontendUrl')` — consistent with how auth, sharing, payments, and workspace-invitation services already read this key.

Affected controllers:
- `zid.controller.ts`
- `salla.controller.ts`
- `shopify.controller.ts`
- `google-oauth.controller.ts`

## Acceptance Criteria
1. All four controllers use `config.get<string>('app.frontendUrl')` (not `'frontendUrl'`).
2. With `FRONTEND_URL=https://app.example.com` set, post-OAuth redirects resolve to `https://app.example.com/app/data/...`.
3. App compiles with no TypeScript errors.
