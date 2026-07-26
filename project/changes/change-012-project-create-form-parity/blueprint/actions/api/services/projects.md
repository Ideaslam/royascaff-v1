# Services — Safqa API · Projects (pack delta)

## Delta
Ensure create/`info` facts flow into DNA skeleton correctly. Prefer small changes in `buildDnaSkeleton` / create normalize — no new public endpoints.

### SVC-PROJECTS — DNA / create mapping [domain, internal, Projects]
- Status: done
- Methods / behavior:
  - `create(...)` — accept richer `info` (digitalPresence, summary, kpis, budget, duration); normalize `competitors` to `{ url }` (coerce string entries to `{ url }`; drop empty); max 3
  - `buildDnaSkeleton(project, client)` —
    - `digitalPresence` ← `info.digitalPresence` (already)
    - `competitors` ← urls (fix: do not accept name-only as substitute for url)
    - `project.summaryUser` ← `info.summary` or `info.deepSummary` (already)
    - `project.budget` / `duration` ← info (already)
    - If `info.kpis` is a non-empty string: seed `project.kpis` as `[{ name: info.kpis, target: "" }]` OR leave array empty but ensure analyze prompt sees summaryUser + kpis text via summaryUser concatenation — prefer seed one KPI object from string for schema friendliness
    - On reconcile: also re-apply `digitalPresence` from skeleton (today only competitors/services/images/client/project name-type-summaryUser)
- Deps: ProjectsRepository, existing financial helper
- Side effects: none new
- Rules: never invent competitor/social URLs; user-provided only
