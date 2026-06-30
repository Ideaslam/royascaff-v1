# Endpoints — Public Auth & Tokenize

## Module: Public Auth

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-PA01 | POST | /api/v1/auth | Bearer `sk_*` + `x-public-key` | — | 200 SDK JWT | `ApiKeyService`, `SdkTokenService` | Backend SDK token exchange |

## Module: Public Tokenize

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-PT01 | POST | /api/v1/tokenize | Header `x-client-token` (`tk_*`); Origin required | — | 200 SDK JWT | Token lookup, `DomainVerificationService`, `SdkTokenService` | Frontend SDK init; domain must be verified |