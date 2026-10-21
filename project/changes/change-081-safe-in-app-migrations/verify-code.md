# Verification Report — change-081 Safe in-app migrations

- **Date**: 2026-10-21 · **Overall**: **PASS** (user acceptance on dev pending)

## Automated checks
| Check | Result |
|-------|--------|
| API `tsc --noEmit` | PASS (only the 2 pre-existing spec errors) |
| API unit (`npx jest`) | PASS — 28 suites / 178 tests |
| API `npm run build` | PASS — `dist/database/migrations/{migrations,boot,run}.js` emitted; mail templates copied |
| API integration (Docker mongo:7 + redis:7) | PASS — `migrations-boot` 5/5, `subscription-due-transitions` 17/17, `billing-invoice-delivery` 1/1. `test/app.e2e-spec.ts` (Nest starter "Hello World") fails to load an unrelated schema — pre-existing, untouched |
| Admin `ng build --configuration development` | PASS |

## Acceptance criteria
| # | Criterion | Evidence | Status |
|---|-----------|----------|--------|
| 1 | Boot runs migrations before `NestFactory.create`; `false` skips | `main.ts` → `migrateOnBoot()`; e2e "disabled flag does nothing" | PASS |
| 2 | Dry run stores report, changes nothing, app boots | e2e "dry run stores a report…"; runner unit | PASS |
| 3 | Concurrent instances: one applies, other waits | e2e "two instances at once…"; runner unit "waits for another instance…" / "fails … never resolves" | PASS |
| 4 | Failure recorded, lock released, exit non-zero | e2e "a failing migration is recorded… boot hook exits" | PASS |
| 5 | `GET /api/v1/admin/migrations` admin-only status list | `modules/admin/migrations.controller.ts` (`JwtAuthGuard`+`RolesGuard`+`@Roles(ADMIN)`); `listMigrationStatus` covered by e2e | PASS |
| 6 | 005 backups + rollback restoring untouched values; not re-applied while flagged; re-applied after clearing | e2e rollback case (8 backups; restored 7, skipped 1 admin edit; missing field unset again); 005 unit | PASS |
| 7 | Admin Migrations page EN/AR builds | `pages/admin/migrations/migrations.page.ts`, route `/app/migrations`, nav `NAV.MIGRATIONS` | PASS (not browser-tested) |
| 8 | CLI scripts still work; tests pass | `run.ts` thin wrapper over `runMigrationsFromEnv`; suites above | PASS |

## Added safety (beyond the request)
- `SubscriptionLimitService` reads limits with the **pre-005 meaning (`0`/missing = unlimited) until `005-limit-unlimited-sentinel` is recorded applied** (ledger read cached 30 s). A dry-run deploy, a deploy with migrations off, or a 005 rollback therefore never blocks customers. Unit-tested (legacy / applied / ledger unreadable).

## Residual notes
- Merge of `origin/production` must add `004-subscription-period-backfill` to `MIGRATIONS` in `migrations.ts` (before 005); `run.ts` conflict resolves to the new thin wrapper.
- Admin package form still labels a stored `0` "Not included" during the short pre-005 window, while enforcement treats it as unlimited.
