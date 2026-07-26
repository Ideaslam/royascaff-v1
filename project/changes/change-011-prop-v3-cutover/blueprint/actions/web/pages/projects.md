# Pages — Safqa Web · Projects (cutover)

## Delta

- **Modify** notes only — Projects is **primary** create path when flag on (default true)
- Existing PG-PROJECTS-01..03 stay; create no longer “hidden by default”

---

### Project List `PG-PROJECTS-01`
- Status: done (behavior: visible for `projects.view`; create CTA when `projects.create` + flag)
- Notes: with default flag true, create is available without admin flip

### Project Create `PG-PROJECTS-02`
- Status: done
- Guard: `projects.create` + `pipelineV3Enabled` (default true)
- Notes: primary AI proposal creation path post-cutover

### Project Workspace `PG-PROJECTS-03`
- Status: done
- Notes: remove/soften “use Creative” fallback copy when flag on; optional link to Creative only if flag off
