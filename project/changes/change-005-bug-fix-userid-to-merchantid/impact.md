# Impact Analysis — Leftover userId on merchant-owned documents

## Code Reconnaissance

Feature state: **partial** — schemas migrated in change-004; several query/write paths still use `userId`.

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | complete | Payment, Company, Media, Customer, Notification, WebhookEndpoint, GatewayRule, EncryptionKey | ownership field is `merchantId` |
| Service/Repo | partial | list below | still query/write `userId` |
| Endpoint(s) | complete | session + merchant/admin list routes | fail or return empty because of repo filters |
| Page(s) | n/a | — | no FE change |

## Inventory — MUST FIX (wrong field vs schema)

These query or write `userId` on documents that only have `merchantId`.

| # | File | What's wrong | Symptom |
|---|------|----------------|---------|
| 1 | `payup-api-typescript/src/services/payment/payment-session-service.ts` | `create()` used `userId` | **Reproduced:** session create 500 `merchantId is required`. **Already patched in this session** (`merchantId` + `createdBy` from App). Confirm on next run. |
| 2 | `payup-api-typescript/src/services/payment/transaction-session-service.ts` | `buildSessionFilter` and `listSessionsPaginated` set `filter = { userId }` | Merchant payment list/stats empty |
| 3 | `payup-api-typescript/src/services/admin/admin-payment-service.ts` | `query.userId`, projection `userId`, map `session.userId` | Admin payment filter/list shows empty merchantId |
| 4 | `payup-api-typescript/src/repositories/core/company-repository.ts` | `find({ userId })` / `findOne({ userId })` | Company list empty |
| 5 | `payup-api-typescript/src/repositories/notifications/notification-repository.ts` | all inbox queries use `userId` | Inbox / unread count empty |
| 6 | `payup-api-typescript/src/repositories/notifications/webhook-endpoint-repository.ts` | `findByUser` uses `userId` | Admin notification-health by merchant empty |
| 7 | `payup-api-typescript/src/repositories/core/media-repository.ts` | `findByAppId`, `findByAppIdAndType`, `deleteByUrl` filter `userId` | Media list empty (create already writes `merchantId`) |
| 8 | `payup-api-typescript/src/repositories/core/customer-repository.ts` | `findByUserIdAndAppId` queries `{ userId, appId }` | Customer list by app empty |
| 9 | `payup-api-typescript/src/repositories/gateway/gateway-rule-repository.ts` | `findByUserId` queried `userId` | Renamed to `findByMerchantId`; query uses `merchantId`. Unused by GatewayRuleService today |

## Naming leftover (works via adapter — optional rename)

| File | Note |
|------|------|
| `repositories/encryption/db-encryption-key-repository.ts` | Option still named `userId`, mapped to `merchantId` |
| `services/encryption/db-encryption-service.ts` + encryption interfaces | `options.userId` means merchant |
| `services/core/domain-verification-service.ts` | passes `userId: merchantId` into encryption |

## Related logic bug (not a field name on a document)

| File | Note |
|------|------|
| `services/notifications/core/recipient-resolver.ts` | `getMerchantContacts(userId)` loads **User** by id, but callers pass **merchantId** |

## KEEP — legitimate `userId` (do not change)

| Area | Why |
|------|-----|
| `User`, JWT `userId`, `auth-service`, 2FA, passkeys | Personal identity |
| `MerchantMember.userId` | Membership link user ↔ merchant |
| `PasskeyCredential.userId` | Personal auth |
| `Verification` / `VerificationOTP.userId` | Checkout identity / SDK claim |
| `GatewayRequest` history `by.userId` | Actor snapshot, not ownership |
| `tokenize` / `sdk-token-service` JWT claim `userId` | Claim name; value is merchant id — persist as `merchantId` on docs |

## Affected Modules
- Payments — session create + merchant/admin session lists
- Core — Company, Media, Customer lookups
- Notifications — inbox + webhook-by-merchant
- Gateways — unused `findByUserId` on rules
- Encryption — optional rename only

## Plan Docs to Update
- [ ] None required (no new fields/endpoints). Optional note in `project/rules.md` if we add a “never query userId on merchant-owned docs” rule.

## Risk
complexity M, cross-module Y (multiple modules, same leftover), migration N (query/write fix only)

## Recommendation
- **Modify**: the 9 MUST FIX files (item 1 already patched).
- **Optional**: encryption option rename + recipient-resolver merchant lookup.
- **Do not**: change auth/JWT/member/passkey/verification `userId`.

## Implementation notes (2026-08-24)

Items 1–9 applied. Extra caller ripples required for lists to work:

- Inbox routes now pass `req.merchant!.id` (was `req.user!.id`).
- Company profile routes now use `merchantContext` + `req.merchant!.id`.
- Notification worker `createNotification` writes `merchantId`.
- Leftover method names renamed: `findByMerchantId` / `findByMerchantIdAndId` / `findByMerchantIdAndAppId` (company, notification, webhook, customer). Passkey `findByUserId` unchanged.
