# Data Model — Delta (REQ-PROP-V3 Phase 4)

## Delta

| Entity | Action |
|--------|--------|
| `proposals` | **Add** `dnaVersion`, `revisions[]`; multi-lang `contentByLang` / `renderedByLang` already shaped |
| `projects.dna` | **Use** `version` (bump on regenerate-dna) |
| `templates` | **Optional** second key `pitch-landscape-formal` |

---

## proposals _(additive)_

| Field | Type | Notes |
|-------|------|--------|
| `dnaVersion` | Number \| null | Pinned project DNA version at create/regen-with-latest |
| `revisions` | Object[] | Cap last **5**; newest first |

### `revisions[]` item

```jsonc
{
  "id": "rev_…",
  "archivedAt": "ISO",
  "reason": "regenerate" | "translate" | "manual",
  "runId": "uuid",
  "language": "ar",
  "sectionMap": { /* optional snapshot */ },
  "sections": [ /* prior sections */ ],
  "renderedByLang": { /* prior artifacts */ }
}
```

### Translate / multi-lang

- `sections[i].contentByLang` may hold both `ar` and `en`
- `renderedByLang` may hold both languages after translate
- `generation.language` = language currently being generated for the active run

### DNA pin rules

- On create-from-project / sibling: set `dnaVersion` from `project.dna.version` (default 1)
- `regenerate-dna` bumps project DNA version only
- `regenerate { useLatestDna: true }` updates pin + remaps from latest DNA
- Default regenerate uses pinned DNA (re-read project.dna; if versions diverge, still use current project DNA data unless product wants hard pin-fail — **v1: always use live project.dna.data**, store version for UI display)
