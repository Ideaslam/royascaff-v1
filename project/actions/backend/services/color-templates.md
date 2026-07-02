## Module: Color Templates

### SVC-COLTPL · ColorTemplateService [internal, domain, Color Templates]
Admin CRUD for color templates. Public read of active templates for workspace branding selection.

**Methods:**
- `create(dto): ColorTemplateDto` — creates document
- `findAll(activeOnly: boolean): ColorTemplateDto[]` — list templates (optionally active-only)
- `findById(id): ColorTemplateDto` — fetch one, 404 if not found
- `update(id, dto): ColorTemplateDto` — update template
- `delete(id): void` — hard delete, clears references in WorkspaceBranding
- `toggleActive(id, isActive): ColorTemplateDto` — toggle active status

**Deps:** ColorTemplateRepository · WorkspaceBrandingRepository
**Side effects:** DB writes · clears branding references on delete
**Rules:** Delete clears WorkspaceBranding references to removed template
