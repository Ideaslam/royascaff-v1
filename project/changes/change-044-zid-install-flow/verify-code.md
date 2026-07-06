# Verify Code — change-044: Zid install-from-App-Market flow

## Checks

### 1. Backend — install endpoint
- [x] `GET /api/v1/data/zid/install` (EP-DATA-35) added to `ZidController` ✓
- [x] `@Public()` decorator — no JWT required ✓
- [x] Redirects to `{frontendUrl}/app/zid-install` (uses already-fixed `app.frontendUrl`) ✓

### 2. Frontend — landing page
- [x] `src/app/pages/zid-install/zid-install.page.ts` created ✓
- [x] Public route `/app/zid-install` registered before guarded `app` block in `app.routes.ts` ✓
- [x] If authenticated: calls `getZidAuthUrl()` and redirects to Zid OAuth ✓
- [x] If not authenticated: shows "Log in" and "Create account" buttons with `returnUrl=/app/zid-install` ✓
- [x] Error states handled (spinner + error banner) ✓

### 3. Planning docs
- [x] EP-DATA-35 added to `data.md` endpoints ✓
- [x] `ZidInstallPage` added to `customer-portal/pages/data.md` ✓

### 4. TypeScript compile
- [x] Backend `npx tsc --noEmit` → exit 0 ✓
- [x] Frontend `npx tsc --noEmit` → exit 0 ✓

### 5. Acceptance criteria
1. [x] Merchant visiting `GET /api/v1/data/zid/install` is redirected to frontend install page ✓
2. [x] Unauthenticated merchant sees login/register CTAs ✓
3. [x] Authenticated merchant is auto-forwarded to Zid OAuth consent ✓

## Overall: PASS
