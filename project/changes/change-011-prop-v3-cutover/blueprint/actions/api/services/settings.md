# Services — Safqa API · Settings (cutover)

## Delta

- **Modify** SVC-SETTINGS-03 — default `true`; seed schema includes field

---

### SVC-SETTINGS-03 · pipelineV3Enabled flag [infrastructure, Settings]
- Status: done
- Methods: patch/read `pipelineV3Enabled`; `isPipelineV3Enabled(workspaceId)`
- Deps: SettingsDataService / getSettingsFromDb; `lib/settings-schema.ts`; seed `settingsSchema`
- Side effects: none
- Rules:
  - Schema + merge defaults: **`default: true`**
  - Seed `config/settingsSchema` field `system.pipelineV3Enabled` present with default true
  - `settings.manage` to flip; false re-enables legacy creative create
  - Existing workspace docs without key inherit default on merge (true after cutover)
