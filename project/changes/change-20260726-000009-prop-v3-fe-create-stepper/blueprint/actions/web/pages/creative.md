# Pages — Safqa Web · Creative (dual-path)

## Delta

- **No breaking changes** to PG-CREATIVE-01 / PG-CREATIVE-02
- **Modify** sidebar/copy only when `pipelineV3Enabled`: optional badge “Legacy” on Creative; Projects is primary create path

---

### Creative Generator `PG-CREATIVE-01` _(unchanged behavior)_
- Route: `/creative`
- Status: done (after-state: still done)
- Notes: remains available when flag off **and** as fallback when flag on; still uses `/ai-jobs` creative path

### Creative Output `PG-CREATIVE-02` _(unchanged)_
- Route: `/creative/output`
- Status: done
- Notes: no server PDF requirement in this pack for v2 path

## Dual-path rules

1. `pipelineV3Enabled === false` → hide or disable Projects **create** CTA; Creative stays primary AI entry
2. `pipelineV3Enabled === true` → Projects nav visible for `projects.view`; Create Project primary; Creative still linked
3. Never remove `/creative` routes in this pack
