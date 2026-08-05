# Service Delta — AssembleService (resources integration)

## Files
- `src/pipeline-v3/assemble/assemble.service.ts`

## New: enrichResourcesFromCatalog() (private method)

Same pattern as `enrichServicesFromCatalog()`. Refreshes photo URLs and dynamic data from the resources catalog at assemble time:

```typescript
private async enrichResourcesFromCatalog(
  resources: JsonObject[],
): Promise<JsonObject[]> {
  const out: JsonObject[] = [];
  for (const r of resources) {
    const id = String(r.id || "").trim();
    if (!id) {
      out.push(r);
      continue;
    }
    try {
      const cat = await this.resourcesRepo.getById(id);
      if (!cat) {
        out.push(r);
        continue;
      }
      out.push({
        ...r,
        photo: String(cat.photo || "").trim() || r.photo,
        name: String(cat.name || "").trim() || r.name,
        nameEn: String(cat.nameEn || "").trim() || r.nameEn,
        summary: String(cat.summary || "").trim() || r.summary,
        summaryEn: String(cat.summaryEn || "").trim() || r.summaryEn,
        data: (cat.data && typeof cat.data === 'object') ? cat.data : r.data,
      });
    } catch (err) {
      logger.warn("AssembleService resource catalog enrich failed", {
        resourceId: id,
        error: (err as Error).message,
      });
      out.push(r);
    }
  }
  return out;
}
```

## Modify: assemble() / buildRenderContext()

Inject enriched resources into the render context for `team` / `partners` sections:

1. Load resources from proposal → fallback project:
   ```typescript
   const rawResources = Array.isArray(proposal.resources)
     ? (proposal.resources as JsonObject[])
     : Array.isArray(project.resources)
       ? (project.resources as JsonObject[])
       : [];
   const resources = await this.enrichResourcesFromCatalog(rawResources);
   ```

2. For `team` and `partners` sections, inject resource data into the section content at assemble time (same approach as financial rows injection):
   - If the section is `team`: filter resources by `typeKey === 'team-member'`, inject into content as `members[]` with `name`, `photo`, `role` (from `data.jobTitle`), `focus` (from `summary`)
   - If the section is `partners`: filter by `typeKey === 'partner'`, inject as `partners[]` with `name`, `logo` (photo), `description` (summary)

3. Pass full enriched resources array to template render context for HBS access.

## Dependency

- Inject `RESOURCES_REPOSITORY` (ResourcesRepository) into `AssembleService` constructor
