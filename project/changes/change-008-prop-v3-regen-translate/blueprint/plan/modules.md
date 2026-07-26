# Modules & Features — Delta (REQ-PROP-V3 Phase 4)

## Delta

- **Extend** Proposals: regenerate from step 2, translate, rerender, revisions archive
- **Extend** Projects: sibling create / map-only when DNA present; dnaVersion pin
- **Extend** Creative / Pipeline: translate section variant + regen entrypoints
- **Partial** Templates: `pitch-landscape-formal` best-effort (may defer full design)

---

## 5. Proposals _(extend)_

### Features
1. **Regenerate from step 2** [backend-only] — archive → map→sections→assemble→export; optional `useLatestDna`
2. **Translate** [backend-only] — parallel section translate → assemble/export target lang
3. **Rerender** [backend-only] — assemble→export only (no AI)
4. **Revisions archive** [backend-only] — prior sections/rendered/sectionMap snapshots

## 12. Projects _(extend)_

### Features
1. **Sibling proposal / template switch** [backend-only] — new proposal, same DNA, different templateKey; steps 2–5 only
2. **DNA version pin** [backend-only] — proposals store `dnaVersion`; regenerate-dna does not auto-rebuild proposals

## 6. Creative / AI Generation _(extend)_

### Features
1. **Translate section jobs** [backend-only] — fast model; schema-validated; glossary rules
2. **Regen orchestrator** [backend-only] — wires existing map/section/assemble/export queues

## 13. Templates _(partial)_

### Features
1. **pitch-landscape-formal** [backend-only] — optional second active template; if assets incomplete → `partial`/`deferred`; sibling API still accepts any active key
