# Bug #027 — Google OAuth post-callback redirect hits API 404

## Status
**PENDING** — Fix in progress, awaiting confirmation

## Reported
- **Date**: 2026-07-13
- **Severity**: high
- **Affected area**: backend/data/google-oauth, deployment env (vault)

## Description
After completing Google OAuth consent for Google Sheets integration, the browser lands on a 404 on the **API** host instead of the customer portal setup page.

Error:
```
Cannot GET /api/v1/data/google/dynamo.vnod.net/app/data/connect/google_sheets?connectionId=...
```

## Expected Behavior
1. Google redirects to `https://dynamo-api.vnod.net/api/v1/data/google/callback` (API)
2. API exchanges code, creates `DataConnection`, then **302 redirects** to customer portal:
   `https://dash.vnod.net/app/data/connect/google_sheets?connectionId=...`

## Steps to Reproduce
1. Open customer portal → Data → Connect Google Sheets
2. Click "Continue with Google" → approve consent
3. Google redirects to API callback (works)
4. API post-OAuth redirect resolves as relative path → 404 on API host

## Root Cause
**The Google callback URL is correct.** OAuth reaches the API successfully.

The failure is in the **post-OAuth redirect** built in `google-oauth.controller.ts`:

```typescript
return res.redirect(
  `${this.frontendUrl}/app/data/connect/google_sheets?connectionId=${connectionId}`,
);
```

Deployed `FRONTEND_URL` in vault is set to `dynamo.vnod.net` **without** the `https://` scheme. Express treats `res.redirect('dynamo.vnod.net/app/...')` as a **relative path**, so the browser resolves it against the current API URL:

```
https://dynamo-api.vnod.net/api/v1/data/google/ + dynamo.vnod.net/app/data/connect/google_sheets
→ https://dynamo-api.vnod.net/api/v1/data/google/dynamo.vnod.net/app/data/connect/google_sheets
```

Evidence: the malformed path embeds `dynamo.vnod.net` as a path segment — exactly the vault `FRONTEND_URL` value.

Local `.env` already has the correct value: `FRONTEND_URL=https://dash.vnod.net`.

## Fix Applied
**Proposed (awaiting confirmation):**

### 1. Vault / deployment env (primary fix)
Update API deployment secrets:

| Variable | Current (broken) | Required |
|----------|------------------|----------|
| `FRONTEND_URL` | `dynamo.vnod.net` | `https://dash.vnod.net` |
| `GOOGLE_CALLBACK_URL` | (verify) | `https://dynamo-api.vnod.net/api/v1/data/google/callback` |

`GOOGLE_CALLBACK_URL` in Google Cloud Console is already correct — no change needed there.

### 2. Optional code hardening (defensive)
Normalize `FRONTEND_URL` in `config.ts` to auto-prepend `https://` when scheme is missing, preventing this class of misconfiguration.

## Verification
- [ ] Vault `FRONTEND_URL` updated with `https://` prefix
- [ ] API redeployed / env reloaded
- [ ] Google Sheets OAuth flow redirects to customer portal setup page
- [ ] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-api/src/modules/data/controllers/google-oauth.controller.ts` (redirect logic)
- `roya-ai-dynamo-api/src/config/config.ts` (optional normalization)
- Vault / deployment env: `FRONTEND_URL`, `GOOGLE_CALLBACK_URL`
