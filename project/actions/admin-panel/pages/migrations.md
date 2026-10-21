# Admin Panel — Migrations *(change-081)*

## Page: Migrations
- **Route**: `/app/migrations` · **Auth**: admin JWT (admin shell guard) · **Nav**: `NAV.MIGRATIONS` (`pi-history`)
- **Purpose**: let operators see database migration state without database access.

### Components
- Header flags: `MIGRATIONS_ENABLED`, dry-run on/off, rollback target (from the endpoint).
- Table (one row per migration, registry order): name, description, status tag (`pending` grey, `dry_run` info, `applied` success, `failed` danger, `rolled_back` warn), appliedAt, duration, stats / dry-run report (expandable JSON), last error (danger text), rolledBackAt.
- Refresh button. No write actions — every change is made by redeploying with flags.

### Service
- `MigrationsAdminService.list()` → `GET ${apiUrl}/admin/migrations` (EP-ADMIN-MIG-1).

### States
- Loading skeleton · empty ("No migrations registered") · error (toast + retry) · success.

### Notes
- EN/AR via `MIGRATIONS.*` keys; RTL follows the shell.
