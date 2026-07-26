# Services — Safqa API · Permissions (seed delta)

> Extends main seed in `scripts/config-seed-data.js` (+ admin seed path). Dotted keys match existing catalog style.

## Delta

- **Add** permission catalog entries
- **Grant** to roles `admin` and `sales_manager` (product “sales-lead”)
- `sales_user` gets project CRUD without delete; **no** `pipeline-traces.read`

---

### SVC-PERMS-SEED-01 · Config seed permissions for Projects + Traces [domain, internal, Permissions]
- Status: planned
- Methods: N/A (seed data change)
- Deps: `scripts/config-seed-data.js`, `MongoConfigRepository.seedConfigBundle`
- Side effects: none until seed/re-seed run
- Rules:

**New permission keys**

| Key | Purpose |
|-----|---------|
| `projects.create` | Create projects |
| `projects.view` | View / list projects |
| `projects.edit` | Update projects |
| `projects.delete` | Archive/delete projects |
| `pipeline-traces.read` | List/view pipeline traces + I/O |

(`projects:*` in the change request = the four `projects.*` keys above.)

**Role grants**

| Role | Grants |
|------|--------|
| `admin` | all `projects.*` + `pipeline-traces.read` |
| `sales_manager` | all `projects.*` + `pipeline-traces.read` |
| `sales_user` | `projects.create`, `projects.view`, `projects.edit` only |

Guard enforcement on thin trace endpoints uses `pipeline-traces.read` (permission mixin), not role name alone.
