# Code Reconnaissance Template

The AI produces this report in **Phase 5, Step 5.0b — BEFORE deciding any endpoints or pages.**

Save the filled report as `recon.md` inside the change folder:
`project/changes/change-<NNN>-<slug>/recon.md`.

**Why this exists:** a feature may already be implemented (fully or partially), and a change in one place
may ripple into other endpoints, services, or pages. Endpoint/page decisions in Step 5.1 must be based on
what the code *actually* contains — not on assumptions or on the plan docs alone.

---

## How to use this template

1. Resolve the scope and target app from `change-request.md` (Step 5.0).
2. Search the **actual code** in the repos listed in `project/profile.md` — every layer below.
3. Fill each section with file paths and concrete findings. Prefer evidence (paths, symbols) over prose.
4. End with a clear recommendation that Step 5.1 (Impact Analysis) can act on directly.

---

## Report Template

Copy everything between the triple-dashes into `recon.md`.

---

```markdown
# Code Reconnaissance — Change #<NNN> <short title>

**Date**: YYYY-MM-DD
**Target app(s)**: <resolved from project/profile.md>
**Scope under review**: <modules / features from the change request>
**Repos scanned**: <repo names from project/profile.md>

## 1. Existing Implementation Found

Check the actual code at every layer. Record the path if it exists, and what is missing.

| Layer | State | Location (path) | Notes / gaps |
|-------|:-----:|-----------------|--------------|
| Schema / data model | none / partial / complete | | |
| Repository | none / partial / complete | | |
| Service(s) | none / partial / complete | | |
| Endpoint(s) / controller | none / partial / complete | | |
| Frontend service | none / partial / complete | | |
| Page(s) / component(s) | none / partial / complete | | |
| Route registration | none / partial / complete | | |

## 2. Feature State Verdict

**State**: [ none — greenfield | partial — exists but incomplete | complete — exists, this is a modification ]

If **partial**, list precisely what is implemented vs. what is missing, so Step 5.2 **completes it in
place** instead of creating a duplicate:
- Implemented: ...
- Missing: ...

## 3. Plan vs. Code Drift

- Code that exists but is **not** in the plan docs: ...
- Plan entries with **no** code yet: ...

(Both must be reconciled by the end of the change — the plan must end equal to the code.)

## 4. Ripple / Impact Map

Everything that depends on, or is depended on by, the area being changed.

| Affected item | Type | Relationship | Breaks if changed? | Action needed |
|---------------|------|--------------|:------------------:|---------------|
| <endpoint / service / repository / page / DTO / schema / shared component> | ... | caller / callee / shares-model | yes/no | modify / add test / leave |

- Shared DTOs / schemas touched: ...
- Auth / role implications: ...
- Async jobs / queues / webhooks involved: ...
- Data migration required? yes/no — describe.

## 5. Reuse Opportunities

Existing services, endpoints, or components to reuse instead of creating new ones: ...

## 6. Recommendation for Impact Analysis (Step 5.1)

- **Create new**: <items with nothing in code today>
- **Complete in place** (partial): <items that exist but are unfinished>
- **Modify** (ripple): <existing items a change here forces us to touch>
- **Out of scope / deferred**: <with reason>

## Open Questions
- ...
```

---

## Done-when checklist (AI uses this)

- [ ] All seven layers were checked in the **actual code**, not just the plan docs
- [ ] Feature state verdict chosen: none / partial / complete
- [ ] For `partial`, the implemented-vs-missing split is explicit
- [ ] Plan-vs-code drift recorded
- [ ] Ripple map lists every caller/callee a change here could affect, each with an action
- [ ] Reuse opportunities identified
- [ ] Section 6 gives Step 5.1 a clear create / complete / modify list
