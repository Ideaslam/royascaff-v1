# AI-Control Redesign — Migration Plan

> Temporary working document. Delete after the migration is complete and verified.
> Goal: split `.ai-control` into a generic **engine/** (control tool) and a self-contained
> **project/** (the single source of truth for this specific system), so the plan always
> reflects the latest state of the app and can be handed to anyone to rebuild it.

---

## 0. Guiding principle

Two zones, strict separation:

- **`engine/`** — the control tool. 100% product-agnostic. Describes *how* to build, never *what* this
  specific system is. Reusable across any product with zero edits.
- **`project/`** — this system's living blueprint. The single source of truth. Describes *what* the
  system is and its current state. Changes mutate these docs in place; `project/changes/` keeps the history.

**Rebuild test (the acceptance goal):** copying `project/` alone must be enough for someone to understand
and rebuild the current app — even after many features/changes. The engine supplies method; the project
supplies truth. No engine file may contain system-specific data.

---

## 1. Target structure

```
.ai-control/
  README.md                        # NEW — explains engine vs project + the rebuild guarantee; points to engine/flow.md
  engine/                          # CONTROL — generic, reusable
    flow.md                        # from start.md (de-contaminated)
    templates/                     # from 2-templates/ (de-contaminated)
      description-template.md
      modules-template.md
      features-template.md
      custom-feature-rules-template.md
      data-model-template.md
      services-template.md
      endpoints-template.md
      pages-template.md
      new-app-template.md
      change-request-template.md
      change-verification-report-template.md
    rules/                         # from 5-rules/ (generic ones only)
      backend-rule.md
      frontend-rule.md
  project/                         # SYSTEM — single source of truth
    profile.md                     # NEW — apps, repos, tech stack, brand tokens, environments, integrations
    description.md                 # from 1-description.md
    rules.md                       # from 5-rules/custom-feature-rules.md (system-specific)
    plan/                          # from 3-plan/
      README.md
      modules.md
      features.md
      data-model.md
      services.md
    actions/                       # from 4-actions/
      README.md
      endpoints.md
      pages.md
    verify/                        # full-system verification reports (greenfield + full re-verify)
      verification-report.md
    changes/                       # from 6-changes/ — incremental change history
      change-request.md
      change-log.md
      verify-plan-change-<N>.md
      verify-code-change-<N>.md
```

Notes:
- `.ai-control/.git/` stays as-is (this folder is its own repo). Use `git mv` to preserve history.
- Greenfield/full verification lives in `project/verify/`; per-change verification lives in
  `project/changes/`. Two semantically distinct homes (initial build vs. incremental change), no longer
  colliding on a numeric prefix.

---

## 2. File-by-file mapping

| Current | Action | Target |
|---------|--------|--------|
| `start.md` | move + de-contaminate | `engine/flow.md` |
| `2-templates/*.md` | move (de-contaminate the 4 flagged) | `engine/templates/*.md` |
| `5-rules/backend-rule.md` | move (already generic) | `engine/rules/backend-rule.md` |
| `5-rules/frontend-rule.md` | move (already generic) | `engine/rules/frontend-rule.md` |
| `5-rules/custom-feature-rules.md` | move (system data) | `project/rules.md` |
| `1-description.md` | move | `project/description.md` |
| `3-plan/README.md` + `*.md` | move (update path refs) | `project/plan/` |
| `4-actions/README.md` + `*.md` | move (update path refs) | `project/actions/` |
| `4-verify/verification-report.md` | move (rename) | `project/verify/verification-report.md` |
| `4-verify/verification-report-post-build.md` | drop (empty, redundant) or merge | — |
| `6-changes/*` | move | `project/changes/` |
| — | create | `project/profile.md` (NEW) |
| — | create | `README.md` (NEW, top-level) |
| `migration-plan.md` | delete at end | — |

---

## 3. De-contamination work (engine files)

These engine files currently hold this specific system's data and must be generalized. They must refer to
values **defined in `project/profile.md`** instead of literals.

### 3.1 `engine/flow.md` (from `start.md`)
- **Phase 5 `target-app` → repo table**: replace the hardcoded table (`customer-portal → roya-ai-dynamo-frontend`, etc.) with: "resolve `target-app` and `affected-repos` against the **Applications** and **Repositories** tables in `project/profile.md`."
- **Repo paths** (`roya-ai-dynamo-api` / `-frontend` / `-frontend-admin`): replace with "the backend/frontend/admin repo defined in `project/profile.md`."
- **Brand colors** (`#ff6043`, `#5922ea`, `#282828`): replace with "the brand tokens defined in `project/profile.md`."
- **Stack literals** (`PrimeNG`, `Angular`, `src/app/...`): replace with "the UI library / framework / source layout declared in `project/profile.md`."
- **Verification check #13** ("Frontend Third-Party Isolation", Angular/R2-specific): generalize to "no hardcoded external URLs in frontend; all API traffic goes through the configured `apiUrl`; provider isolation per `project/rules.md`."
- **Greenfield verification report output**: point Phase 4 to `project/verify/verification-report.md`.
- Update **all** internal path references: `3-plan/*` → `project/plan/*`, `4-actions/*` → `project/actions/*`, `5-rules/backend-rule.md`/`frontend-rule.md` → `engine/rules/*`, `5-rules/custom-feature-rules.md` → `project/rules.md`, `6-changes/*` → `project/changes/*`, `2-templates/*` → `engine/templates/*`, `1-description.md` → `project/description.md`.

### 3.2 `engine/templates/change-request-template.md`
- `target-app` and `affected-repos` value tables: replace literal app/repo names with "the applications/repos listed in `project/profile.md`" + generic placeholders (`<frontend-repo>`, `<api-repo>`).
- Keep `change-type` enum (already generic).
- `tech-stack` examples: keep as clearly-labeled generic examples; remove product-specific framing.
- Filled-in example: keep but relabel as an illustrative example, or swap to a neutral domain.

### 3.3 `engine/templates/new-app-template.md`
- Replace "reuses the existing `roya-ai-dynamo-api` backend" with "reuses the existing backend defined in `project/profile.md`."
- Keep the mobile/example block but mark explicitly as an example.

### 3.4 `engine/templates/change-verification-report-template.md`
- Generalize `app.routes.ts`, `environment.apiUrl`, `src/app/...`, JWT specifics to "the routing/config/source paths declared in `project/profile.md`." Concrete strings allowed only inside clearly-labeled examples.

### 3.5 `engine/templates/pages-template.md`
- Remove system-specific references (flagged by scan); generalize to placeholders.

### 3.6 `engine/rules/backend-rule.md`, `engine/rules/frontend-rule.md`
- No content change needed (already generic). Move only.

---

## 4. New `project/profile.md` (system data home)

This is the new home for everything pulled out of the engine. Sections:

1. **Product** — name + one-line summary.
2. **Applications** — table: `name | type (web/admin/mobile/api) | repo | framework | UI library | auth strategy`.
3. **Repositories** — repo name → role → location.
4. **Brand tokens** — colors, typography, spacing scale.
5. **Environments** — dev/staging/prod, `apiUrl` pattern, config file locations.
6. **Integrations** — providers + isolation notes (e.g. OAuth, object storage, mail, webhooks, payments).
7. **System conventions** — e.g. currency, locale/RTL, naming specifics.

> ⚠️ **Audit decision required:** the current control files reference **roya-ai-dynamo** with a
> dashboards/CSV/Anthropic product and brand colors `#ff6043 / #5922ea / #282828`, but
> `description.md` describes **"Team Circle Tracking"** (Sphere graph, wallets, SAR). These are two
> different products. Before authoring `profile.md` I need you to confirm which is the **current**
> system, so the profile is filled with real values and the stale ones are discarded — not carried over.

---

## 5. New top-level `README.md`
- Explain engine vs project zones.
- State the rebuild guarantee: `project/` is self-contained; engine is method only.
- Entry point: start at `engine/flow.md`.
- Note: `project/` is the single source of truth; `project/changes/` is history.

---

## 6. Consistency fixes (rolled into the moves)
- **Report naming**: standardize on `verify-plan-change-<N>.md` and `verify-code-change-<N>.md` everywhere (flow + template currently disagree).
- **Single verification model**: full-system → `project/verify/`; per-change → `project/changes/`.
- **Drop** the empty redundant `verification-report-post-build.md`.
- **Add a "self-contained blueprint" check** to the verification list: assert no engine file contains
  system-specific data, and `project/` references only `project/` + `engine/rules` — encoding the rebuild test.

---

## 7. Execution order (each step independently auditable)

1. Confirm the product identity question in §4 (you).
2. `git mv` the generic rules → `engine/rules/`; templates → `engine/templates/`; `start.md` → `engine/flow.md`. (No content edits yet.)
3. `git mv` system data → `project/` (description, rules.md, plan/, actions/, verify/, changes/).
4. Create `project/profile.md` from confirmed real values.
5. De-contaminate `engine/flow.md` (§3.1) + update all path references.
6. De-contaminate the 4 flagged templates (§3.2–3.5).
7. Create top-level `README.md`.
8. Apply consistency fixes (§6).
9. Full reference sweep (grep) to confirm: no `roya-ai-dynamo` / brand hex / `PrimeNG` / old paths left in `engine/`; no dangling `3-plan/`, `4-actions/`, `5-rules/`, `6-changes/`, `2-templates/` references anywhere.
10. Delete `migration-plan.md`.

---

## 8. Risk / rollback
- `.ai-control` is its own git repo → every step is a reviewable diff; `git mv` preserves history; revert per commit.
- Plan/action files are currently empty → low migration risk for those.
- Largest content edits are confined to `engine/flow.md` and 4 templates; everything else is a pure move.
