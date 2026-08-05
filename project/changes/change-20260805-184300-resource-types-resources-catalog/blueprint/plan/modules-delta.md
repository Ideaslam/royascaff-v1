# Modules Delta — Resources

## 15. Resources
- Scope: BE `modules/data/resource-types` + `modules/data/resources` + FE `/resource-types` (settings) + `/resources` (catalog)
- Audience: all workspace members (view), `settings.manage` for type admin, ownership on resource PATCH/DELETE
- Entities: `resource_types`, `resources`
- Depends on: Integrations (S3 for photos)

### Features
1. **Resource Types Admin** [both] — workspace-scoped configurable type definitions with dynamic field schemas (dataType, aiHint, sortOrder); CRUD + seed defaults on first access; settings-area management
2. **Resources Catalog** [both] — typed catalog items with core fields (name, photo, summary, tags) + dynamic `data: {}` from type's field definitions; CRUD + lite picker; list with type tabs + search + tag filter; dynamic edit form rendered from type fields
3. **Resource Photo Upload** [both] — base64 upload to S3 via existing S3Service pattern; stored as public URL on `photo` field

## Delta

- **Added**: Module §15 Resources (Resource Types + Resources Catalog)
