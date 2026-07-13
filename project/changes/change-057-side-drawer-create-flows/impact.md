# Impact Analysis — Side Drawer Create Flows

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | none (N/A) | — | UI-only |
| Service(s) BE | complete | unchanged | no API changes |
| Endpoint(s) | complete | unchanged | no API changes |
| Frontend services | complete | `core/services/{projects,dashboards,data}.service.ts` | reuse as-is |
| Page — Projects List | complete | `pages/projects/projects-list/` | uses centered `p-dialog` for create |
| Page — Project Detail | complete | `pages/projects/project-detail/` | create dashboard uses 2-step `p-dialog` + lite dataset picker |
| Page — Data Sources | complete | `pages/data/data-sources/` | connect type picker uses centered `p-dialog` |
| Shared drawer shell | none | `shared/components/` | no `p-drawer` wrapper yet; PrimeNG 21 `DrawerModule` available |
| i18n / RTL | complete | `core/services/i18n.service.ts` sets `documentElement.dir` | drawer must use end-edge (right LTR / left RTL) |

Feature state: **complete** (modify presentation only)

### Plan-vs-code drift (note)
- `project/actions/customer-portal/pages/projects.md` still describes a change-049 **template chooser** wizard for New Dashboard. Current code is the AI describe flow (info + dataset picker) only. This change updates the AI create flow to a drawer; template branch remains out of scope unless already present in code.

## Affected Modules
- **Projects** — Create Project + Create Dashboard UI shell
- **Data** — Connect Source type-picker UI shell
- **Shared UI** — new reusable drawer shell component

## Plan Docs to Update
- [x] `project/actions/customer-portal/pages/projects.md` — dialog → side drawer; dashboard create = continuous scroll
- [x] `project/actions/customer-portal/pages/data.md` — Connect Source dialog → side drawer
- [x] `project/actions/customer-portal/pages/_index.md` — note shared drawer shell if listed components matter (optional one-line)
- [ ] endpoints / services / data-model / rules / description — **skip** (UI-only)

## Code Impact Map

| Action | Item |
|--------|------|
| **Create** | `shared/components/side-drawer/side-drawer.component.ts` (+ html/scss) — wraps `p-drawer`, inputs: `visible`, `header`, `styleClass`, width/breakpoints; RTL-aware `position`; content + footer projections |
| **Modify** | `projects-list.page.{ts,html,scss}` — replace create `p-dialog` with shared drawer |
| **Modify** | `project-detail.page.{ts,html,scss}` — replace wizard dialog with single-scroll drawer; drop step chrome (`p-steps`) |
| **Modify** | `data-sources.page.{ts,html,scss}` — replace connect `p-dialog` with shared drawer |
| **Modify** | `public/i18n/en.json` + `ar.json` — any drawer-specific labels if needed (mostly reuse existing) |
| **Ripple — none** | Confirm dialogs, dashboard-viewer dialogs, workspace create, batch panel left as dialogs |

## Risk
- **Complexity:** Low–Medium (shared component + 3 page migrations + responsive CSS)
- **Cross-module:** Yes (Projects + Data pages) but UI-only
- **Migration:** No
- **Auth / API:** Unchanged

## Recommendation
- **Create**: shared `SideDrawerComponent`
- **Modify**: projects-list, project-detail, data-sources pages + page specs
- **Leave**: confirm dialogs and other out-of-scope popups
