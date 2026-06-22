# Change Verification Report Template

Each Phase 5 run produces **two** verification reports saved inside `6-changes/`:

| Report | When | File |
|--------|------|------|
| **Pre-Build Plan Verification** | After Step 5.2 (planning docs updated), before Step 5.4 (code) | `6-changes/verify-plan-<change-N>.md` |
| **Post-Build Code Verification** | After Step 5.4 (code implemented), before Step 5.6 (archive) | `6-changes/verify-code-<change-N>.md` |

Replace `<change-N>` with the sequential change number from `change-log.md` (e.g. `verify-plan-change-3.md`).

---

## Part 1 — Pre-Build Plan Verification Report

Run this **after updating planning docs (Step 5.2)** and **before writing any code (Step 5.4)**.

Purpose: confirm the planning documents for this change are internally consistent and complete before code generation begins.

---

### Pre-Build Report Template

```markdown
# Pre-Build Plan Verification — Change #N

**Change title**: [one-line summary of the change]
**Date**: YYYY-MM-DD
**Change type**: [new-feature | new-module | modify-feature | ...]
**Affected repos**: [backend | frontend | admin | ...]
**Planning docs updated**: [list the docs that were modified in Step 5.2]

---

## Status: [PASS | ISSUES FOUND → FIXED | BLOCKED]

---

## Check 1: Feature Coverage [✓ | ✗]

**Question**: Do all new/modified features have endpoints (if backend-relevant) and pages (if frontend-relevant)?

| Feature | Backend-relevant? | Endpoint exists? | Frontend-relevant? | Page exists? |
|---------|:-----------------:|:----------------:|:-----------------:|:------------:|
| [feature name] | yes/no | yes/no/n/a | yes/no | yes/no/n/a |

**Issues found**: [none | describe gaps]
**Fixes applied**: [none | what was fixed]

---

## Check 2: Service Coverage [✓ | ✗]

**Question**: Are all services referenced by new/modified endpoints defined in `services.md`?

| Endpoint | Service Called | Exists in services.md? |
|----------|---------------|:---------------------:|
| [METHOD /route] | [ServiceName.method()] | yes / no |

**Issues found**: [none | describe gaps]
**Fixes applied**: [none | what was fixed]

---

## Check 3: Data Model Consistency [✓ | ✗]

**Question**: Are all entities, collections, and DTOs referenced in new/modified endpoints and pages defined in `data-model.md`?

| DTO / Entity Referenced | Defined in data-model.md? |
|------------------------|:------------------------:|
| [EntityName / DtoName] | yes / no |

**Issues found**: [none | describe gaps]
**Fixes applied**: [none | what was fixed]

---

## Check 4: Endpoint-Page Linking [✓ | ✗]

**Question**: Do the endpoint routes listed in new/modified pages exactly match the routes defined in `endpoints.md`? Method and path must match character for character.

| Page | Endpoint Referenced | Route in endpoints.md | Match? |
|------|--------------------|-----------------------|:------:|
| [page name] | [METHOD /route] | [actual route] | ✓ / ✗ |

**Issues found**: [none | describe mismatches]
**Fixes applied**: [none | what was corrected]

---

## Check 5: Auth Declarations [✓ | ✗]

**Question**: Do all new/modified endpoints declare their auth level? Do all new/modified pages declare their route guard?

| Item | Type | Auth level declared? | Guard declared? |
|------|------|:--------------------:|:---------------:|
| [endpoint or page] | endpoint / page | yes / no | yes / no / n/a |

**Issues found**: [none | describe gaps]
**Fixes applied**: [none | what was added]

---

## Check 6: Custom Rules Coverage [✓ | ✗]

**Question**: If the change introduces a new external integration, async job, or security-sensitive behavior, is it covered by a rule in `custom-feature-rules.md`?

| New behavior | Rule exists? | Rule ID |
|-------------|:------------:|---------|
| [e.g. new external API call] | yes / no / n/a | [rule ID or "added"] |

**Issues found**: [none | describe gaps]
**Fixes applied**: [none | rules added]

---

## Pre-Build Summary

| Check | Result |
|-------|--------|
| 1. Feature Coverage | [✓ PASS | ✗ FIXED: description] |
| 2. Service Coverage | [✓ PASS | ✗ FIXED: description] |
| 3. Data Model Consistency | [✓ PASS | ✗ FIXED: description] |
| 4. Endpoint-Page Linking | [✓ PASS | ✗ FIXED: description] |
| 5. Auth Declarations | [✓ PASS | ✗ FIXED: description] |
| 6. Custom Rules Coverage | [✓ PASS | ✗ FIXED: description] |

**Overall: [PASS — planning docs are consistent and complete. Proceed to Step 5.4 (Implement Code). | BLOCKED — list unresolved issues]**
```

---

## Part 2 — Post-Build Code Verification Report

Run this **after all code changes are implemented (Step 5.4)** and **before archiving (Step 5.6)**.

Purpose: confirm the implemented code matches the updated planning docs and that all acceptance criteria from `change-request.md` are met.

---

### Post-Build Report Template

```markdown
# Post-Build Code Verification — Change #N

**Change title**: [one-line summary of the change]
**Date**: YYYY-MM-DD
**Change type**: [new-feature | new-module | modify-feature | ...]
**Affected repos**: [backend | frontend | admin | ...]

---

## Status: [PASS | ISSUES FOUND → FIXED | BLOCKED]

---

## Check 1: Endpoints in Code [✓ | ✗]

**Question**: Does every new/modified endpoint from `endpoints.md` exist in the backend code with the correct HTTP method and route?

| Endpoint (endpoints.md) | Code file | Method + Route in code | Match? |
|-------------------------|-----------|------------------------|:------:|
| [METHOD /route] | [src/modules/.../controller.ts] | [actual decorator] | ✓ / ✗ |

**Issues found**: [none | describe gaps]
**Fixes applied**: [none | what was corrected]

---

## Check 2: Pages in Code [✓ | ✗]

**Question**: Does every new/modified page from `pages.md` exist in the frontend code at the correct route?

| Page (pages.md) | Code file | Route in app.routes.ts | Match? |
|----------------|-----------|------------------------|:------:|
| [page name] | [src/app/pages/.../page.ts] | [actual route] | ✓ / ✗ |

**Issues found**: [none | describe gaps]
**Fixes applied**: [none | what was corrected]

---

## Check 3: Code Layering — Backend [✓ | ✗]

**Question**: Do new/modified backend files follow the controller → service → repository pattern? No business logic in controllers. No direct DB or external SDK calls from controllers.

| File | Layer | Violation? |
|------|-------|:----------:|
| [module.controller.ts] | controller | none / [description] |
| [module.service.ts] | service | none / [description] |
| [module.repository.ts] | repository | none / [description] |

**Issues found**: [none | describe violations]
**Fixes applied**: [none | what was refactored]

---

## Check 4: Frontend Isolation [✓ | ✗]

**Question**: Do new/modified Angular files avoid direct external HTTP calls? All API calls must go through `environment.apiUrl`. No hardcoded external URLs.

Scan target files:
- `src/app/pages/<changed-module>/`
- `src/app/core/services/<changed-service>.ts`

| File | Direct external URL found? | Details |
|------|:--------------------------:|---------|
| [filename] | no / YES | [url if found] |

**Issues found**: [none | list every violation — these are CRITICAL]
**Fixes applied**: [none | what was corrected]

---

## Check 5: Auth Implementation [✓ | ✗]

**Question**: Are auth guards applied in code for all new/modified protected routes and endpoints?

**Backend:**

| Endpoint | Guard declared in plan | Guard applied in code? |
|----------|:---------------------:|:---------------------:|
| [METHOD /route] | [JWT / @Roles / @Public] | yes / no |

**Frontend:**

| Route | Guard declared in plan | Guard applied in app.routes.ts? |
|-------|:---------------------:|:--------------------------------:|
| [/route] | [authGuard / adminGuard] | yes / no |

**Issues found**: [none | describe missing guards]
**Fixes applied**: [none | guards added]

---

## Check 6: Acceptance Criteria [✓ | ✗]

**Question**: Is every acceptance criterion from `change-request.md` met?

| # | Acceptance Criterion | Met? | Evidence |
|---|---------------------|:----:|---------|
| 1 | [criterion text] | ✓ / ✗ | [how verified: file/route/behavior] |
| 2 | [criterion text] | ✓ / ✗ | [how verified] |
| N | [criterion text] | ✓ / ✗ | [how verified] |

**Issues found**: [none | which criteria are not met and why]
**Fixes applied / deferred**: [none | what was fixed; what is formally deferred with justification]

---

## Check 7: UI Screenshots [✓ | ✗ | SKIPPED]

**Question**: Do the submitted screenshots match the page specs in `pages.md`?

> If no screenshots were provided in Step 5.4, set status to SKIPPED and move on. This check does not block the report from passing.

**Screenshots provided**: [yes — list filenames/pages | no — mark SKIPPED]

| Page | Screenshot | Layout matches pages.md? | UI states visible? | Correct route? | RTL correct? | Brand consistent? |
|------|-----------|:------------------------:|:-----------------:|:--------------:|:------------:|:-----------------:|
| [page name] | [filename] | ✓ / ✗ | ✓ / ✗ | ✓ / ✗ | ✓ / ✗ / n/a | ✓ / ✗ |

**Issues found**: [none | describe visual discrepancies with reference to the relevant pages.md section]
**Fixes applied**: [none | what was corrected in code based on screenshot review]

---

## Post-Build Summary

| Check | Result |
|-------|--------|
| 1. Endpoints in Code | [✓ PASS | ✗ FIXED: description] |
| 2. Pages in Code | [✓ PASS | ✗ FIXED: description] |
| 3. Code Layering — Backend | [✓ PASS | ✗ FIXED: description] |
| 4. Frontend Isolation | [✓ PASS | ✗ FIXED: description] |
| 5. Auth Implementation | [✓ PASS | ✗ FIXED: description] |
| 6. Acceptance Criteria | [✓ PASS | ✗ FIXED/DEFERRED: description] |
| 7. UI Screenshots | [✓ PASS | ✗ FIXED: description | SKIPPED — no screenshots provided] |

**Overall: [PASS — code matches plan and all criteria met. Proceed to Step 5.6 (Archive). | BLOCKED — list unresolved issues]**
```

---

## Naming Convention for Report Files

Save reports in the `6-changes/` folder:

```
6-changes/
├── change-request.md          ← active change (cleared after each run)
├── change-log.md              ← append-only history
├── verify-plan-change-1.md    ← Pre-Build report for change #1
├── verify-code-change-1.md    ← Post-Build report for change #1
├── verify-plan-change-2.md    ← Pre-Build report for change #2
├── verify-code-change-2.md    ← Post-Build report for change #2
└── ...
```

Verification reports are **permanent** — do not delete them after archiving to `change-log.md`. They form a traceable history of what was verified for each change.
