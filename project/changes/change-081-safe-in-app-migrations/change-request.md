# Change Request

## Metadata
- **date**: 2026-10-21
- **change-type**: modify-feature
- **target-app**: all-apps
- **affected-repos**: backend+admin
- **priority**: high

## Scope
- Module(s): Database migrations (SVC-MIGRATE), Admin
- Endpoint(s): **new** `GET /api/v1/admin/migrations` (JWT + admin)
- Page(s)/View(s): admin-panel: **new** Migrations page (read-only)
- Service(s): SVC-MIGRATE (runner, ledger, registry), migration `005-limit-unlimited-sentinel`, app bootstrap (`main.ts`)

## Description
Nobody has direct database access in dev or production — only the app does. Dev deploys with a plain `docker run` (no `initContainer`), so ledgered migrations never run there automatically. The owner wants migrations to run **from the app itself**, controlled by environment flags, with no risk of booting against a half-migrated database and with a way to see results and undo without database access.

Desired behaviour:
1. **Run at boot, before anything else**: `main.ts` runs pending migrations before the Nest app is created (no HTTP, workers or schedulers yet). The CLI runner (`migrate:run*`) and the production `initContainer` keep working through one shared registry/runner.
2. **Flags** (all optional): `MIGRATIONS_ENABLED` (existing; default `true`) gates everything. `MIGRATIONS_DRY_RUN=true` computes and **stores** what each pending migration would change, changes nothing, then boots. `MIGRATIONS_ROLLBACK=<name>` runs that migration's undo step from its backup and marks it rolled back.
3. **Wait instead of skip**: if another instance holds a migration's lock, wait until it is applied (or the lock goes stale and is taken over), up to 10 minutes; then exit non-zero. No instance boots while a migration is incomplete.
4. **Visibility without DB access**: the ledger stores per migration: status (`pending | dry_run | applied | failed | rolled_back`), timestamps, duration, stats, last dry-run report, last error. `GET /api/v1/admin/migrations` returns the registry merged with the ledger; a read-only admin "Migrations" page shows it (EN/AR).
5. **Backup + rollback**: migrations may define `down`. Migration 005 records every field it changes (collection, `_id`, path, previous value) in `migration_backups` before changing it; its `down` restores only fields that still hold the migrated value (`-1`), so later admin edits are never overwritten. A rolled-back migration is not re-applied while `MIGRATIONS_ROLLBACK` names it; clearing the flag with migrations enabled re-applies it. Migrations 001–004 (already run in production) get no `down`.
6. **Failure**: lock released, error recorded in the ledger, process exits non-zero (never boots half-migrated). Recovery without DB: redeploy with `MIGRATIONS_ENABLED=false`, read the error on the admin page.

Out of scope: removing the production `initContainer` (kept; app-boot run becomes a no-op there); `down` for 001–004; editing migrations from the UI.

## Acceptance Criteria
1. With `MIGRATIONS_ENABLED=true` the API applies pending migrations before `NestFactory.create`; with `false` it logs "migrations disabled" and boots without connecting for migrations.
2. With `MIGRATIONS_DRY_RUN=true` no data changes; each pending migration's would-change report is stored and visible via the endpoint; the app boots.
3. Two instances started concurrently: exactly one applies each migration; the other waits and boots only after it is applied.
4. A failing migration leaves its ledger status `failed` with the error message, releases the lock, and the process exits non-zero.
5. `GET /api/v1/admin/migrations` (admin only; 403 for non-admins) lists every registered migration with status, appliedAt, durationMs, stats, dryRunReport, lastError.
6. Migration 005 writes one backup row per changed field; `MIGRATIONS_ROLLBACK=005-limit-unlimited-sentinel` restores them (skipping fields no longer `-1`) and marks it `rolled_back`; it is not re-applied while the flag is set.
7. The admin Migrations page shows the endpoint data (EN/AR) and builds.
8. CLI `migrate:run` / `migrate:run:dry-run` / `migrate:run:prod` still work; unit + Mongo integration tests pass.

## Notes
- Prerequisite unchanged: merge `origin/production` into `dev` so `004-subscription-period-backfill` is in the registry before 005.
- Updates RULE-GLOBAL-013 (migrations may also run at app boot; dry-run, rollback, admin visibility).
