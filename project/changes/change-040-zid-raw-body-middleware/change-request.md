# Change Request

## Metadata
- **date**: 2026-07-06
- **change-type**: modify-feature
- **target-app**: backend
- **affected-repos**: backend
- **priority**: high

## Scope
- Module(s): App bootstrap (main.ts)
- Feature(s): Webhook HMAC validation (Shopify, Salla, Zid)
- Endpoint(s): POST /data/shopify/webhook, POST /data/salla/webhook, POST /data/zid/webhook
- Service(s): —

## Description
Webhook controllers for Shopify, Salla, and Zid all validate HMAC signatures using the raw request body (`req.rawBody`). However, `main.ts` does not configure Express raw body preservation — so `req.rawBody` is always `undefined` and all webhooks log "no raw body available" and reject with `{ ok: false }`, silently breaking incremental sync.

Fix: pass `rawBody: true` to `NestFactory.create()` options — this instructs the NestJS/Express HTTP adapter to preserve a `Buffer` copy of the raw body on every request so `RawBodyRequest<Request>.rawBody` is populated.

## Acceptance Criteria
1. `NestFactory.create(AppModule, { rawBody: true, ... })` is set in `main.ts`.
2. A webhook POST with a correct HMAC signature reaches the handler with `req.rawBody` populated (non-undefined).
3. App compiles with no TypeScript errors.
