# Verification — Production Platform Seed

## Plan Consistency
- [x] Endpoints — N/A (CLI only; EP-GW16 leftover as merchant/admin “Load Seed Rules”)
- [x] Services in specs — SVC-CO05 `PlatformSeedService` in `actions/backend/services/core.md`
- [x] Data model — unchanged (no new fields)
- [x] Routes — N/A
- [x] Auth — N/A (no HTTP); admin create requires `ADMIN_SEED_*` env
- [x] RULE-024 added
- [x] Recon findings reflected (do not call overwrite local seeds; extract catalogs; no boot change)

## Code Verification
- [x] Endpoints implemented — N/A (no new route; `grep` finds no `PlatformSeedService` in `index.ts` or routes)
- [x] Services implemented — `src/services/core/platform-seed-service.ts` + `src/scripts/seed-production.ts` + `npm run seed:prod`
- [x] Pages/views — N/A (backend CLI)
- [x] Layering: CLI → `PlatformSeedService` → `CurrencyRepository` / `AvailableGatewayService` / `LibraryService` / `AdminUser` / `seedNotificationData`
- [x] Frontend isolation — N/A
- [x] Auth guards — N/A
- [x] Acceptance criteria met (below)
- [x] No regressions — local seed scripts still overwrite + `--clear`; boot still only `seedNotificationData()`
- [x] `npx jest tests/seed/platform-seed-service.test.ts` — 21 passed
- [x] `npx ts-node src/scripts/seed-production.ts --help` — usage printed, exit 0
- [x] `--clear` and `--only=gateway-rules` — refused, exit 1, no DB connect

## Acceptance Criteria
1. `--help` documents `--only`, `--confirm`, `--dry-run` and allowed dataset names — PASS
2. `--dry-run` writes nothing (`create`/`update`/`seedNotifications` not called) — PASS (unit)
3. Writes without `--confirm` refuse and write nothing — PASS
4. `--clear` refused, no deletes — PASS (unit + CLI exit 1)
5. `--only=gateway-rules` / `encryption` / unknown names refuse the run — PASS
6. Currencies: missing codes inserted with ISO exponent + `rateSource: 'seed'`; existing rows keep rate fields — PASS
7. Available gateways: missing paypal/stripe/moyasar/myfatoorah created; existing `enabled: false` not written — PASS
8. Libraries: missing identifiers created; known identifiers may update scopes; extras not deleted — PASS
9. AdminUser: create-if-missing; existing email is skip (no hash/create) — PASS
10. Missing `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` fails `admin-user` (no local hardcoded defaults) — PASS
11. Notifications: idempotent `seedNotificationData` on write; skipped on dry-run — PASS
12. `startServer()` still only calls `seedNotificationData()` — PASS
13. Local `npm run seed` and per-dataset scripts unchanged in policy (catalogs extracted only) — PASS
14. No new HTTP seed route — PASS
15. Summary is created / updated / skipped / failed; process exit 1 if any dataset failed — PASS
16. Password and Mongo URI never printed — PASS (CLI logs dataset counts and email-less admin errors only)

## Result: PASS

**Overall: PASS**
