# Impact Analysis — Revenue type as unit

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | complete | API services DTO/model already has `unit` + `revenueType`; project `services[]` is loose `Record[]` | No new fields; keep `unit` for legacy consumers |
| Service(s) | complete | `services.data.service.ts`, `projects.data.service.ts`, `dna-passthrough` passes project.services through | No BE behavior change required if FE sends derived `unit` |
| Endpoint(s) | complete | EP-SERVICES create/update; EP-PROJECTS create/update | Already accept both fields |
| Page(s) | partial | `service-edit` has Unit free-text + Revenue type; `services` list shows both columns; `project-create` / `project-edit` overrides = name/price/qty only | Remove Unit UI; add revenue-type select to project overrides; derive `unit` on save |

Feature state: **partial**

## Affected Modules
- **Services (web)** — remove Unit input + list column; derive `unit` from `REVENUE_TYPE_OPTIONS` label when saving
- **Projects (web)** — Create (`PG-PROJECTS-02`) + Edit (`PG-PROJECTS-04`) override rows gain revenue-type select; sync `unit` when select changes; price display prefers revenue-type label
- **Shared constants** — reuse `REVENUE_TYPE_OPTIONS` (optionally small helper `revenueTypeToUnitLabel`)
- **API** — no required change (passthrough). Optional tiny normalize later — **out of pack** unless FE-only derivation proves insufficient

## Pack blueprint files to create
- [ ] `blueprint/actions/web/pages/services.md` — PG-SERVICES-01/02 after-state (unit removed)
- [ ] `blueprint/actions/web/pages/projects.md` — PG-PROJECTS-02 + PG-PROJECTS-04 override row after-state
- [ ] `blueprint/_index.md` + pack `status.md` refresh

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Code files likely modified (implement step)
| Repo | File | Change |
|------|------|--------|
| web | `pages/services/service-edit/service-edit.component.ts` | Remove Unit input; on save set `unit` from revenueType label |
| web | `pages/services/services.component.ts` | Drop Unit column |
| web | `pages/projects/project-create/project-create.component.ts` | Add `p-select` revenueType in override row; derive unit; display helper |
| web | `pages/projects/project-edit/project-edit.component.ts` | Same override UX as create |
| web | `core/constants/creative-form-options.ts` | Optional helper `getRevenueTypeLabel(value)` if not already shared |

## Risk: **L**, cross-module **Y** (services + projects, same pattern), migration **N**

## Recommendation
- **Modify**: PG-SERVICES-01/02, PG-PROJECTS-02, PG-PROJECTS-04
- **Create**: none (no new pages/endpoints)
- **Complete**: project override unit control (missing today)
- **Ripple**: Creative legacy wizard still has its own service display — leave alone unless shared helper is reused; contracts/PDF keep reading `unit` string

## Status target (per artifact in the pack after implement)
- PG-SERVICES-01 → done
- PG-SERVICES-02 → done
- PG-PROJECTS-02 → done
- PG-PROJECTS-04 → done

## Dependencies
- depends-on: — (none)
- Note: change-20260726-000014 (project edit) is `verified` not yet `merged`; Edit page exists in code — safe to modify in parallel
