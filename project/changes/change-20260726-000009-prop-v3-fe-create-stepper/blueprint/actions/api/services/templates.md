# Services — Safqa API · Templates (Phase 5 thin)

## Delta

- **Create** SVC-TPL-07 list facade for gallery
- Existing SVC-TPL-01..06 unchanged

---

### SVC-TPL-07 · List active templates [domain, internal, Templates]
- Status: planned
- Methods: `listActiveForGallery()` — map `TemplatesRepository.listActive()` → slim DTO (strip heavy `sections` / contentSchema)
- Deps: TemplatesRepository
- Side effects: none
- Rules: return latest active version per key if duplicates; no AI; tenant-global catalog
