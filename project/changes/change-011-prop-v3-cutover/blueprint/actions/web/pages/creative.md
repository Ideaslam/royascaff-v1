# Pages — Safqa Web · Creative (cutover)

## Delta

- **Modify** PG-CREATIVE-01/02 + sidebar — demote when `pipelineV3Enabled`

---

### Creative Generator `PG-CREATIVE-01`
- Route: `/creative`
- Status: done
- Components: existing form; optional banner “Legacy — use Projects”
- Service: unchanged when flag **off**; when flag **on**, prefer redirect or show banner + disable submit (API will also reject)
- Guard: layout
- Notes: escape hatch when flag false

### Creative Output `PG-CREATIVE-02`
- Route: `/creative/output`
- Status: done (unchanged behavior for historical jobs)
- Notes: keep for in-flight / old jobs

## Nav

- When `pipelineV3Enabled`: hide Creative nav **or** show with Legacy badge (prefer **hide** + keep route for deep links)
- `/ai-jobs` remains visible (history)
- Projects nav remains primary (existing v3 badge OK)
