# Project Layout — Blueprint Contract

The product ships **`engine/` only**. There is no pre-seeded `project/` folder and no placeholder READMEs.

`project/` is **generated output** — the living blueprint for *this* system. The engine creates it on demand during Phase 0–4 or Phase R.

**Read this file whenever you need to know what to create and where.**

---

## Product model

| Zone | Shipped with RoyaScaff? | Role |
|------|-------------------------|------|
| `engine/` | **Yes** — the product | How to build (flows, templates, rules, this layout) |
| `project/` | **No** — created by the engine | What this system is (SSOT blueprint) |

**Rebuild test** (after merge): copying `project/` alone (main blueprint) must be enough to understand and rebuild the **implemented** app.

**Engine purity**: `engine/` never contains system-specific data. Those live only in generated `project/profile.md`.

---

## Isolation invariant (Phase 5 / P / 6 Path A)

**Main blueprint = implemented reality only.**

- In-flight work lives only inside a **change work pack** under `project/changes/change-<NNN>-<slug>/`.
- Do **not** edit `project/plan/`, `project/actions/`, `project/rules.md`, `project/profile.md`, or `project/description.md` until **merge** (after verify PASS).
- Main files may be **read** for existing context while drafting/implementing a pack.
- `project/status.md` reflects **merged** artifacts only. In-flight work is tracked in `project/changes/change-log.md` + the pack's `status.md`.

---

## Bootstrap gate (run before any phase that writes blueprint files)

1. Check whether `project/` exists next to `engine/` (same workspace root as RoyaScaff, or the path the user designated as the blueprint root).
2. **If missing** — create the **root skeleton** below (directories only; no README placeholders). Then continue the active flow, creating each file from its template when that step runs.
3. **If present** — do not recreate.
4. **Phase 5 / P / 6** require an existing blueprint. If `project/profile.md` is missing, stop and route to Phase 0 or Phase R.

Default blueprint root: `<workspace>/project/` beside `<workspace>/engine/`.

---

## Root skeleton (create on first bootstrap)

```text
project/
  plan/
  actions/
  changes/
  bugs/
  verify/
  docs/
```

Do **not** create placeholder READMEs. Structure and purpose are defined here and in the templates.

---

## Full layout (files the engine creates over time)

```text
project/
  profile.md
  description.md
  rules.md
  status.md                  # MERGED build-state only
  plan/
    modules.md
    data-model.md
    roles-and-authorization.md
  actions/
    <api-app-key>/
      services/_index.md + <module>.md
      endpoints/_index.md + <module>.md
    <web-app-key>/
      pages/_index.md + <module>.md
    <mobile-app-key>/
      views/_index.md + <module>.md
  changes/
    change-log.md            # LIVE INDEX — all changes + pack-status
    change-<NNN>-<slug>/     # work pack (see below)
  bugs/
    bug-log.md               # LIVE INDEX — PENDING | DONE | ESCALATED
    bug-<NNN>-<slug>.md      # Path B direct fixes
  verify/
    verification-report.md
    reverse-engineer-report.md
  docs/
```

---

## Change work pack layout

```text
project/changes/change-<NNN>-<slug>/
  change-request.md      # metadata, acceptance criteria, request-id, depends-on, pack-status
  impact.md
  status.md              # pack dashboard: per-artifact planned/partial/done
  blueprint/             # SELF-CONTAINED delta specs — implement from here
    plan/                # only touched slices (modules, data-model, rules excerpts)
    actions/
      <api>/services/<module>.md
      <api>/endpoints/<module>.md
      <web>/pages/<module>.md
      <mobile>/views/<module>.md
    _index.md            # what this pack owns + Done/Total
  verify-plan.md         # optional
  verify-code.md
  merge-report.md        # written at merge time
```

**Implementer load set** (any chat/user): `change-request.md` + `blueprint/` + `impact.md` + `status.md`.

**Delta writing rule:**

| Layer | Inside pack `blueprint/` | On merge into main |
|-------|--------------------------|--------------------|
| Data model | After-state of affected entity + short `## Delta` note | In-place update — never append a change section at bottom of main |
| Services / endpoints / pages | Only artifacts owned by this change (after-state entries) | Merge rows into main module files; refresh `_index.md` |
| Unchanged main content | Not copied | Untouched |

---

## Change log index contract

`project/changes/change-log.md` is a **live registry**, not a finished-work archive. Template: `engine/templates/change-log-template.md`.

### Pack-status vocabulary

| Status | Meaning |
|--------|---------|
| `drafted` | Request + pack blueprint written; code not started |
| `in-progress` | Implementation started |
| `verified` | `verify-code.md` PASS; not yet merged into main |
| `merged` | Main blueprint updated; pack is historical record |
| `cancelled` | Abandoned; main never touched |
| `blocked` | Waiting on `depends-on` part(s) not yet `verified`/`merged` |

### Sync rules (mandatory)

1. Creating a change folder → immediately add/update the row (`drafted`).
2. Every pack-status transition → update the **same row** (never leave index stale).
3. Mirror pack `Done/Total` into the In flight table's Artifacts done column.
4. Resume any change/polish work → **read `change-log.md` first**, then open the folder.
5. Main `project/status.md` = merged only; in-flight = change-log + pack `status.md`.

### Multi-part features

Flat folders with shared `request-id` in metadata (e.g. `REQ-7`). Optional `depends-on: change-014`. Each part has its own pack and its own change-log row. Independent parts may run in parallel; dependent parts stay `blocked` until deps are `verified`/`merged`.

---

## When each path is created

| Path | Created by | Template |
|------|------------|----------|
| Root skeleton dirs | Bootstrap gate | — |
| `profile.md` | Phase 0 / R.0 | `profile-template.md` |
| `description.md` | Phase 0 / R | `description-template.md` |
| `plan/*`, `rules.md` | Phase 1 / R | modules / data-model / custom-feature-rules |
| `actions/<key>/…` | Phase 2 / R | services / endpoints / pages / views + index |
| `status.md` | Phase 2+ / R.Done / **after merge** | `status-template.md` |
| `changes/change-log.md` | First Phase 5 / P / 6 Path A | `change-log-template.md` |
| `changes/change-<NNN>-…/` | Phase 5 / P / 6 Path A | change-request, impact, change-status, blueprint index, merge-report |
| `bugs/…` | Phase 6 | `bug-report-template.md` |
| `verify/…` | Phase 4 / R.3 | `verification-template.md` |

---

## Actions layout rules (main blueprint)

| App type | Folder | Spec structure |
|----------|--------|----------------|
| API | `actions/<api-key>/` | `services/_index.md` + per-module · `endpoints/_index.md` + per-module |
| Web | `actions/<web-key>/` | `pages/_index.md` + per-module |
| Mobile | `actions/<mobile-key>/` | `views/_index.md` + per-module |

**Call chain:** `pages/*` or `views/*` → `endpoints/*` → `services/*` → repositories / providers

**IDs:** `SVC-<MODULE>-NN` / `EP-<MODULE>-NN` (see `engine/conventions.md`).

---

## Bugs

### `project/bugs/`

- `bug-log.md` — live index: `PENDING` · `DONE` · `ESCALATED` (+ link to change folder when escalated)
- `bug-<NNN>-<slug>.md` — Path B direct fixes (no main plan edits)
- Path A escalates to a change work pack (`change-type: bug-fix`); main untouched until that pack merges

---

## Resume rule

1. If working on changes/polish/bugs: read `project/changes/change-log.md` (and `project/bugs/bug-log.md` if bugs) **first**.
2. Then read `project/status.md` for merged build state.
3. If `project/` does not exist: start Phase 0 or Phase R — do not invent product facts.
