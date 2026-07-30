# Bug 20260729-190500 — R2 URLs inject static `roya-sales-ai` folder

## Status
**DONE** — Confirmed 2026-07-29

## Reported
- **Date**: 2026-07-29
- **Severity**: high
- **Affected area**: API S3/R2 (`environment.ts` + `s3-service.ts`)

## Description
Production media URLs are correct without an app folder prefix, e.g.:

`https://sales-ai-media.roya.marketing/workspaces/{id}/{file}`

The API still prefixes object keys and public URLs with `roya-sales-ai` (static default / env fallback), producing broken links like:

`…/roya-sales-ai/workspaces/{id}/{file}`

## Expected Behavior
Object keys and public URLs use only `AWS_S3_BASE_FOLDER` from env (empty = bucket/public root). Same code path for every environment — no hardcoded folder name, no special-case defaults.

## Steps to Reproduce (if applicable)
1. Upload a workspace logo (or any `uploadFile` media).
2. Observe returned URL includes `roya-sales-ai/` even when production objects live at `workspaces/...` under the public CDN.

## Root Cause
1. `config.aws.baseFolder` defaulted to the literal `"roya-sales-ai"` when env was unset.
2. `||` treated an empty `AWS_S3_BASE_FOLDER=` as falsy, so empty env still fell through to that default.
3. `S3Service.objectKey` / `publicUrlForKey` prepended that folder; `uploadHtml` / `uploadUtf8` ignored `baseFolder`.

## Fix Applied
- `environment.ts`: `baseFolder` from `AWS_S3_BASE_FOLDER ?? AWS_S3_APP_FOLDER ?? ""` (no static default; empty env honored).
- `s3-service.ts`: prefix only when `baseFolder` is non-empty; all upload helpers use `objectKey` + `publicUrlForKey`; public URL path = object key (delete via `extractKeyFromUrl` stays correct).
- `.env.example` + local `.env`: document empty = root.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-sales-ai-api-v2/src/config/environment.ts`
- `roya-sales-ai-api-v2/src/services/s3-service.ts`
- `roya-sales-ai-api-v2/.env.example`
- `roya-sales-ai-api-v2/.env` (local: cleared base folder)
