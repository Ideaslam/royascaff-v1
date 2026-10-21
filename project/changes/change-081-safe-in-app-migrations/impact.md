# Impact Analysis — change-081 Safe in-app migrations

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Runner | complete | `api/src/database/migrations/migration-runner.ts` | skips (not waits) on foreign lock; no dry-run persistence; no failure record; no rollback |
| Ledger | complete | `api/src/database/migrations/migration-ledger.ts` (`schema_migrations`, unique `name`, 15-min stale lock) | needs `status`, `lastError`, `dryRunReport`, `rolledBackAt`, wait helper |
| Registry / CLI | complete | `api/src/database/migrations/run.ts` (registry + CLI in one file) | registry must be shared with boot |
| Migration type | complete | `migration.types.ts` (`up` only) | optional `down` |
| Migration 005 | complete | `005-limit-unlimited-sentinel.ts` | no backup, no `down` |
| Boot | complete | `api/src/main.ts` | no migration hook |
| Flags | partial | `api/src/config/migrations.config.ts`, `env.validation.ts`, `config.ts` | add `MIGRATIONS_DRY_RUN`, `MIGRATIONS_ROLLBACK` |
| Admin endpoint | none | `api/src/modules/admin/` (pattern: `sync-health.controller.ts`) | new controller |
| Admin page | none | `admin/src/app/pages/admin/`, `app.routes.ts`, `layouts/app-shell/app-shell.ts` nav | new page + service + i18n |

Feature state: partial (modify runner/ledger/005; create endpoint + page).

## Affected Modules
- Database migrations (SVC-MIGRATE) — runner, ledger, registry, 005.
- Admin (API) — new read-only controller.
- admin-panel — new page, route, nav item, service, i18n.

## Plan Docs to Update
- [ ] `rules.md` — RULE-GLOBAL-013 (boot run, flags, wait-on-lock, dry-run, rollback, admin visibility).
- [ ] `actions/backend/services/subscriptions.md` — SVC-MIGRATE.
- [ ] `plan/data-model.md` — `schema_migrations` new fields; new `migration_backups` collection.
- [ ] `actions/backend/endpoints/admin.md` + `_index.md` — EP-ADMIN-MIG-1.
- [ ] `actions/admin-panel/pages/` — new `migrations.md` + `_index.md` row.
- [ ] `profile.md` — env flags (if the env table lists them).

## Risk: complexity M, cross-module Y (backend + admin), migration N (no new data migration; 005 gains backup/down before it has ever run in an environment)

## Recommendation
- **Create**: `migrations/migrations.ts` (registry + `runMigrations`), `migrations/boot.ts` (boot hook), `admin/migrations.controller.ts`, admin `migrations` page + service.
- **Modify**: runner (wait, status, dry-run report, failure record, rollback), ledger, types (`down`), 005 (backup + down), `run.ts` (thin CLI), `main.ts`, config/env validation.
- **Ripple**: existing runner/ledger/005 specs.
