# Bug #017 — Admin deployed app fails to load lazy chunk (chunk-CUSLMCGR.js)

## Status
**DONE** — Confirmed by user 2026-07-07

## Reported
- **Date**: 2026-07-07
- **Severity**: high
- **Affected area**: admin-portal/deploy, Dockerfile.build, nginx cache

## Description
On the deployed admin app (`https://dynamo-admin-dev.iilm.io`), navigating/lazy-loading routes throws:

```
TypeError: Failed to fetch dynamically imported module: https://dynamo-admin-dev.iilm.io/chunk-CUSLMCGR.js
```

Works fine locally (`ng serve`).

## Expected Behavior
After deployment, all lazy-loaded routes should load their JS chunks without error.

## Steps to Reproduce
1. Deploy a new build of the admin frontend to the dev server.
2. Open `https://dynamo-admin-dev.iilm.io` in a browser that previously visited the site (or without hard refresh).
3. Navigate to a lazy-loaded route.
4. Console shows `Failed to fetch dynamically imported module: .../chunk-CUSLMCGR.js`.

## Root Cause
After redeploy, Angular generates new content-hashed lazy chunks (`chunk-XXXX.js`) but `main.js` keeps the same filename. Nginx/Cloudflare cached `main.js` with `Cache-Control: public, immutable` (1 year). Browsers that previously visited the site kept the old `main.js`, which references deleted chunks like `chunk-CUSLMCGR.js` → 404 → `Failed to fetch dynamically imported module`.

**Runtime evidence:**
- Different browser works → stale cache in original browser (hypothesis A **CONFIRMED**)
- `chunk-CUSLMCGR.js` returns 404 on server; current `main.js` references different chunks
- Clearing browser cache alone insufficient — Cloudflare edge cache also serves old `main.js` with `immutable`

## Fix Applied
1. `Dockerfile.build` — `no-cache` for entry bundles; `immutable` only for `chunk-*.js`; `ENVIRONMENT` build arg
2. `deploy.sh` / `scripts/post-build.mjs` — cache-bust `index.html` entry bundles on each deploy
3. `Jenkinsfile.dev` — passes `ENVIRONMENT` and `BUILD_ID` as Docker build args
4. `main.ts` — auto-reload once with cache-bust query param on chunk load failure

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-frontend-admin/Dockerfile.build`
- `roya-ai-dynamo-frontend-admin/deploy.sh`
- `roya-ai-dynamo-frontend-admin/src/main.ts`
