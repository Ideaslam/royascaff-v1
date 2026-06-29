# AI-Control Engine — Change Mode (Phase 5)

Incrementally add new features/modules or modify existing ones, keeping all `project/` planning docs in sync with the codebase. The plan must always equal the latest state of the code, so `project/` stays a self-contained, rebuildable blueprint.

Phase 5 is independent of Phases 0–4. Use it any time after the initial app exists.

---

## Flow Selection

Before starting, evaluate the change against Fast-Track criteria:

### Fast-Track Criteria (ALL must be true)

1. Change touches ≤ 1 module
2. No new data model entities or fields
3. No new services or endpoints (modifying existing is OK)
4. Frontend-only OR backend-only (not both, unless endpoint already exists)
5. User provides a clear, complete change description

**If ALL criteria met** → use **Fast-Track Flow** below.
**If ANY criterion fails** OR user says "use full flow" → use **Standard Flow** below.

---

## Fast-Track Flow (4 steps, 1 gate)

### FT-5.0 — Understand

- **Input**: User's change description
- **Actions**: Read `change-request.md` or user description. Resolve `target-app` and `affected-repos` against `project/profile.md`. No discovery interview — description is sufficient.
- **Done when**: Change is fully understood, scope is clear.

### FT-5.1 — Quick Recon + Impact

- **Input**: Resolved scope + affected repos + `project/plan/modules.md` + relevant `_index.md` registries
- **Output**: `project/changes/change-<NNN>-<slug>/impact.md` (abbreviated)
- **Scope rule**: Look up `_index.md` registries to find exact files for the affected module. Load ONLY those files. Do NOT load unrelated modules.
- **Actions**:
  1. Confirm the target endpoint/page/service exists in code and specs.
  2. Check for obvious ripple effects (callers/callees in the same module).
  3. Record findings in `impact.md` — feature state, files to change, any ripple items.
- **Done when**: Target artifacts confirmed to exist, impact is documented.

### FT-5.2 — Update Plan + Implement Code

- **Input**: `impact.md` + relevant planning docs + affected code
- **Scope rule**: Resolve affected module(s) from FT-5.1, look up `_index.md` registries for exact files. Load ONLY those module files.

#### ⛔ Confirmation Gate (MANDATORY)

Present a brief summary of what will change (plan docs + code files) and ask: **"Can I proceed?"**
Wait for explicit confirmation.

- **Actions**:
  1. Update only the affected sections of planning docs (in-place, no appended change sections).
  2. Implement code changes following `engine/rules/backend-rule.md` / `engine/rules/frontend-rule.md` + `project/rules.md`.
- **Done when**: Plan docs updated, code changes implemented, app compiles.

### FT-5.3 — Verify + Archive

- **Input**: Updated plan + implemented code
- **Output**: `project/changes/change-<NNN>-<slug>/verify-code.md`
- **Actions**:
  1. Run post-build checks (scoped to changed areas): endpoints in code, pages in code, code layering, frontend isolation, auth, acceptance criteria.
  2. Append row to `project/changes/change-log.md`.
- **Done when**: `verify-code.md` shows PASS, `change-log.md` has the new row.

---

## Standard Flow (7 steps, 2 gates)

### Entry Point

Each change gets its own folder under `project/changes/`:

```
project/changes/change-<NNN>-<slug>/
  change-request.md     # the filled request (kept permanently)
  impact.md             # code recon + impact analysis (Step 5.1)
  verify-code.md        # post-build report (Step 5.5)
```

- `<NNN>` = next change number (zero-padded) from `project/changes/change-log.md`.
- `<slug>` = short kebab-case summary.

To start: create the folder, copy `engine/templates/change-request-template.md` as `change-request.md`, fill it, and tell the AI **"Start Phase 5"**. Or just describe the change in plain language — the AI runs the discovery interview (Step 5.0).

---

### Step 5.0 — Understand the Change + Discovery Interview

- **Input**: `project/changes/change-<NNN>-<slug>/change-request.md` (or user's plain-language description)
- **Output**: A complete, confirmed `change-request.md`

#### 5.0.1 — Read & Resolve Scope

1. Read `change-request.md` fully. Note `change-type`, `target-app`, `affected-repos`.
2. Resolve `target-app` and `affected-repos` against `project/profile.md`.
3. If `change-type` is `new-app`: read the **New App Definition** section; check listed modules/features against `project/plan/modules.md`.
4. If not `new-app`: read relevant sections of `project/description.md`, `project/plan/modules.md`, and the affected `endpoints/_index.md` and `pages/` that match scope.
5. If the description is complete, skip to Phase D (confirmation). If thin or ambiguous, run the discovery interview below.

#### 5.0.2 — Discovery Interview

Ask every question in order. Present each section as a clearly labelled group. Wait for answers before moving to the next section.

**Section 1 — Business Context** _(always)_
Ask the "Business Context" block from the template (motivation, who is affected, desired outcome, out-of-scope, constraints, priority).

**Section 2 — Type-Specific Technical Details** _(always)_
Ask the type-specific block for the identified `change-type` from the template.

**Section 3 — Data & Integrations** _(CONDITIONAL)_
- **Skip if** `change-type` is `modify-page`, `modify-endpoint` (I/O changes only), or `refactor`
- Otherwise: ask the "Data & Integrations" block (new fields/entities, external providers, async jobs, AI usage)

**Section 4 — Security & Permissions** _(CONDITIONAL)_
- **Skip if** auth level is unchanged AND no new endpoints are being created
- Otherwise: ask the "Security & Permissions" block (who can trigger, role/ownership checks, sensitive data, audit trail)

**Section 5 — Edge Cases & Errors** _(CONDITIONAL)_
- **Skip if** change is purely UI (no backend logic or data changes)
- Otherwise: ask the "Edge Cases & Errors" block (invalid input, empty states, concurrent actions, failure handling, rollback)

**Section 6 — Frontend Style** _(only when frontend is touched)_
If `affected-repos` includes `frontend` or `admin`, ask the "Frontend Style" block (pages, design system, reference screenshot/Figma, layout, states, RTL).

**Rules**: Present all questions for a section together. Wait for answers before next section. Follow up on unclear answers. Do not draft `change-request.md` until all applicable sections are answered.

#### 5.0.3 — Draft the Change Request

1. Create folder `project/changes/change-<NNN>-<slug>/` (next number from `change-log.md`).
2. Draft `change-request.md` using the template's Change Request Block. Fill every field: `metadata`, `scope`, `description`, `acceptance-criteria`, `notes`. For `new-app`, fill New App Definition too.
3. `description` must capture: problem, desired behavior, who is affected, user story (happy + edge), permissions, data changes, out-of-scope.
4. `acceptance-criteria` must be numbered **testable, observable outcomes**.

#### 5.0.4 — ⛔ Confirmation Gate (MANDATORY)

Present the full drafted `change-request.md` section by section. Ask:

> **"Does this change request look correct? Please confirm to proceed, or tell me what to correct."**

- Do **not** proceed until user explicitly confirms.
- If corrections requested: apply, re-present, ask again.
- **Do not interpret silence, ambiguous replies, or follow-up questions as confirmation.**
- For frontend changes: confirm visual approach explicitly.

- **Done when**: `change-request.md` saved and user has explicitly confirmed.

---

### Step 5.1 — Code Recon + Impact Analysis

Runs **before any endpoint or page is decided**. Base decisions on the real code.
Skip recon portion for `change-type: new-app` (no existing code to review).

- **Input**: Resolved scope from Step 5.0 + repos in `project/profile.md` + `project/plan/` + `project/actions/`
- **Template**: `engine/templates/impact-template.md`
- **Output**: `project/changes/change-<NNN>-<slug>/impact.md`
- **Scope rule**: Resolve affected module(s), look up `_index.md` registries for exact files. Load ONLY those module files. Do NOT load unrelated modules.

#### 5.1.1 — Code Reconnaissance

1. Search affected module(s) in **actual code** across every layer — schema, repository, service, controller/endpoint, frontend service, page/component, route.
2. Determine **feature state**: `none` (greenfield), `partial` (list implemented vs missing), `complete` (modification).
3. Record **plan-vs-code drift**: code not in plan, plan entries with no code.
4. Build **ripple/impact map**: every caller/callee that this change could affect, with action needed.
5. Note **reuse opportunities**: existing services/endpoints/components to reuse.
6. Capture **risks**: auth implications, async jobs/webhooks, data migration needed.

#### 5.1.2 — Impact Classification

For each affected area, classify using the recon verdict:
- **Create new** — recon found nothing in code
- **Complete in place** — recon found partial implementation (extend, never duplicate)
- **Modify** — recon found complete implementation that this change alters
- Always include **ripple-affected** items from the impact map

Then map `change-type` to required doc updates:

| Change type | `modules.md` | `data-model.md` | `services/` | `endpoints/` | `pages/` / `views/` | `rules.md` | `description.md` |
|-------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `new-app` | maybe | — | — | — | ✓ new file | maybe | ✓ |
| `new-module` | ✓ | maybe | ✓ | ✓ | maybe | maybe | ✓ |
| `new-feature` | maybe | maybe | maybe | maybe | maybe | maybe | ✓ |
| `modify-feature` | ✓ | maybe | maybe | maybe | maybe | maybe | maybe |
| `modify-endpoint` | — | maybe | maybe | ✓ | maybe | — | — |
| `modify-page` | — | — | — | maybe | ✓ | — | — |
| `modify-service` | — | maybe | ✓ | maybe | — | maybe | — |
| `modify-data-model` | — | ✓ | maybe | maybe | maybe | — | maybe |
| `refactor` | — | — | maybe | maybe | maybe | — | — |
| `bug-fix` | see Phase 6 | | | | | | |
| `general` | assess | assess | assess | assess | assess | assess | assess |

Legend: ✓ = always, maybe = if touched, — = skip, assess = case-by-case

(Plan docs under `project/plan/`; action docs per app under `project/actions/<app-key>/`; `services/`/`endpoints/` refer to the API app's folder; `pages/`/`views/` refer to the frontend app's folder.)

- **Output**: `impact.md` — which docs change, which code files change, ripple set with create/complete/modify classification.
- **Done when**: Every affected doc and code location identified, every ripple item scheduled or judged safe.

---

### Step 5.1b — New App Definition (only when `change-type` is `new-app`)

Skip if `change-type` ≠ `new-app`.

- **Input**: New App Definition from `change-request.md` + `project/plan/modules.md` + `project/profile.md`
- **Template**: `engine/templates/new-app-template.md`
- **Actions**:
  1. **Resolve included modules** — map against `project/plan/modules.md`. Flag backend-only modules.
  2. **Resolve included features** — list in-scope features per module. `excluded` features documented but not implemented.
  3. **Identify new modules/features** — items not in `modules.md` must be flagged for addition in Step 5.3.
  4. **Determine endpoint reuse** — identify existing endpoints the new app will call; flag features needing new/modified endpoints.
  5. **Generate new app client spec** — create `project/actions/<app-key>/` with `pages/` (web, using `engine/templates/pages-template.md`) or `views/` (mobile, using `engine/templates/views-template.md`).
  6. **Determine new repo structure** — confirm tech stack, folder layout, shared vs separate backend. Record in `project/profile.md`.
- **Output**: Confirmed list of included modules, features, reused endpoints, new endpoints needed, new client spec file. Note if Step 5.3 must add new modules/features to `modules.md`.
- **Done when**: Complete client spec for the new app is ready before Step 5.3.

---

### Step 5.2 — ⛔ Plan Confirmation Gate (MANDATORY)

Present the impact analysis results and proposed plan updates for user approval before modifying any planning documents.

**What to present**:
1. **Impact summary** — which planning docs will be updated and what changes
2. **Code impact** — which code files will be created/modified/completed
3. **Ripple effects** — other endpoints/services/pages affected

End with: **"Can I proceed with updating the planning documents?"**

Wait for explicit confirmation. Do not interpret silence or ambiguous replies as confirmation.

---

### Step 5.3 — Update Planning Documents

Update only the sections identified in Step 5.1. Do not rewrite entire files.

> **No Appended Change Sections**: Never create or append separate `change-<NNN>` sections at the end of planning/action files. All edits must be applied **directly in-place**. These files must remain a consolidated, up-to-date single source of truth. Change history is tracked in `project/changes/`.

- **Scope rule**: Resolve affected module(s) from Step 5.1, look up `_index.md` registries for exact files. Load ONLY those module files. Do NOT load unrelated modules.

Honor the `impact.md` verdict:
- **Partial implementation found** — update existing plan entry to complete it; no duplicate entries.
- **Ripple items** — also update plan entries for every flagged endpoint/service/page.
- **Plan-vs-code drift** — bring drifted entries in line with code.

#### Rules for each document

- **`project/plan/modules.md`** (new-module, new-feature): Add/update module and feature entries following existing format.
- **`project/plan/data-model.md`** (when data changes): Add collections or update field tables following existing format.
- **`project/actions/<api-app>/services/`** (when services change): Add/update service entries. Follow existing format: type, methods, dependencies.
- **`project/actions/<api-app>/endpoints/`** (when endpoints change): Add/update endpoint entries. Follow existing format: method, route, auth, input, output, rules, services called.
- **`project/actions/<app-key>/pages/`** (web, when pages change): Add/update page entries in affected app's folder.
- **`project/actions/<app-key>/views/`** (mobile, when screens change): Add/update screen entries following `engine/templates/views-template.md`.
- **`project/rules.md`** (new integration/security/async rules): Add under relevant module section.
- **`project/profile.md`** (new app/repo/integration/stack change): Update relevant table.
- **`project/description.md`** (new features/modules only): Extend relevant section — preserve existing content.

#### Optional: Pre-Build Plan Verification

If the change is complex (touches ≥ 3 planning docs or introduces new entities), run these checks before proceeding to Step 5.4:
1. Feature coverage — new features have endpoints (if BE) and pages (if FE)
2. Service coverage — endpoints reference existing services
3. Data model consistency — entities/DTOs referenced in endpoints/pages exist in `data-model.md`
4. Endpoint-page linking — routes match
5. Auth declarations — new endpoints/pages declare auth
6. Custom rules coverage — new integrations/async behaviors covered

If issues found: fix and re-check. Output to `project/changes/change-<NNN>-<slug>/verify-plan.md` (optional).

- **Done when**: All identified planning docs updated and internally consistent.

---

### Step 5.4 — ⛔ Code Confirmation Gate + Implement Code

- **Scope rule**: Resolve affected module(s) from Step 5.1, look up `_index.md` registries for exact files. Load ONLY those module files. Do NOT load unrelated modules.

#### ⛔ Confirmation Gate (MANDATORY — do not skip)

Before writing or modifying **any** code, present:

1. **What will be applied** — every file to create/modify, using the create/complete/modify list from `impact.md` plus ripple set.
2. **Target repos/folders** — exact paths from `project/profile.md`.
3. **Frontend style** — if frontend is in scope: app/pages, design system/brand tokens, reference screenshot/mockup/Figma. If none provided, state existing design system will be followed.

End with: **"Can I proceed with implementing the code?"**

Wait for explicit confirmation. This gate is **separate from** Step 5.2 — the plan may have evolved, so re-confirm the concrete code-level scope.

#### Backend changes

- Apply to backend repo per `project/profile.md`.
- Follow `engine/rules/backend-rule.md` + `project/rules.md`.
- Layered architecture: controller → service → repository.
- Schemas in `src/modules/<module>/schemas/`, services in `services/`, controllers in `controllers/`.
- Wire new modules into application root.
- Integration providers isolated in integrations layer.

#### Frontend changes

- Apply to frontend app per `project/profile.md` for resolved `target-app`.
- Follow `engine/rules/frontend-rule.md` + `project/rules.md`.
- Pages in frontend pages folder, services in core services folder.
- Pages call frontend services only — no direct HTTP in components.
- Register new routes. No hardcoded external URLs.

#### Admin / additional app changes

Same rules, applied to the app/repo per `project/profile.md`.

#### New app creation (`change-type: new-app`)

- Create repo/folder with tech stack from New App Definition / `project/profile.md`.
- Match folder structure patterns from existing apps.
- Implement only pages/views from new app's client spec.
- Reuse existing backend endpoints — no business logic duplication.
- If new endpoints were flagged in Step 5.1b, implement those in backend first.
- Apply declared auth strategy.
- Frontend isolation: no direct external API calls.

#### UI Screenshot Review (frontend apps only)

After frontend code is implemented, screenshots can be submitted for review. The AI checks:
1. Layout matches app spec (tables, forms, buttons, headers, empty states present)
2. UI states reachable (loading, empty, error, success)
3. Correct route matches spec
4. No obvious regressions
5. RTL support correct (if applicable per `project/profile.md`)
6. Brand consistency with `project/profile.md` tokens

Screenshots are optional. If not provided, UI check marked "skipped" and does not block verification.

- **Done when**: All code changes implemented, apps compile, any submitted screenshots reviewed.

---

### Step 5.5 — Post-Build Code Verification

- **Input**: Implemented code + updated planning docs
- **Template**: `engine/templates/verification-template.md`
- **Output**: `project/changes/change-<NNN>-<slug>/verify-code.md`
- **Checks** (scoped to changed areas):
  1. **Endpoints in code** — new/modified endpoints exist with correct method/route
  2. **Pages/views in code** — new/modified pages exist at correct routes
  3. **Code layering (BE)** — controllers delegate to services only
  4. **Frontend isolation** — no hardcoded external URLs; all calls through `apiUrl`
  5. **Auth implementation** — guards/decorators applied as declared
  6. **Acceptance criteria** — every item from `change-request.md` verifiably met; unmet items explicitly deferred with justification
  7. **UI screenshots** — if submitted, verify against spec; otherwise mark skipped
- **If issues found**: fix code and re-run checks. Do not proceed until PASS.
- **Done when**: `verify-code.md` shows **Overall: PASS**.

---

### Step 5.6 — Archive

1. Open `project/changes/change-log.md`.
2. Append one row: `# | Date | Type | Target app | Scope | Outcome | Folder` — `Folder` links to `change-<NNN>-<slug>/`.
3. Change folder (`change-request.md`, `impact.md`, `verify-code.md`) is the permanent record.

- **Done when**: `change-log.md` has the new row, folder contains filled request and verification report.

---

## Phase 5 — Done

When Step 5.6 (or FT-5.3) completes:
- Planning docs are in sync with the code.
- Change folder holds the filled request, impact analysis, and verification report.
- `project/changes/change-log.md` has a new row.

To make another change, create the next `project/changes/change-<NNN>-<slug>/` folder and start Phase 5.
