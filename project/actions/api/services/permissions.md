# Services — Safqa API · Permissions

### SVC-PERMS-01 · PermissionsDataService [domain, internal, Permissions]
- Status: done
- Methods: list/getById/getByKey/create/upsert/delete
- Deps: PermissionsRepository
- Side effects: none

### SVC-PERMS-SEED-01 · Config seed catalog [domain, internal, Permissions]
- Status: done
- Methods: N/A (seed data in `scripts/config-seed-data.js` + workspace_owner defaults)
- Deps: seed / `seedConfigBundle`
- Side effects: none until seed run
- Rules: includes `projects.create|view|edit|delete` and `pipeline-traces.read`; grants on `admin` / `sales_manager` (all) and `sales_user` (projects without delete, no traces)
