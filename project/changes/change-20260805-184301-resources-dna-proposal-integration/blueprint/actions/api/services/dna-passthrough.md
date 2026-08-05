# Service Delta — DNA Passthrough (resources integration)

## Files
- `src/pipeline-v3/analyze/dna-passthrough.ts`

## Modify: mergeDnaAnalyzeSource()

Add resources merge (same pattern as services/images):

```typescript
const versionResources = Array.isArray(version.resources) ? version.resources : [];
const projectResources = Array.isArray(project.resources) ? project.resources : [];
const resources = versionResources.length > 0 ? versionResources : projectResources;
```

Return `resources` in merged result.

## Modify: buildDnaSkeleton()

Add `resources` block to skeleton output. Extract resources from `project.resources`:

```typescript
const resources = Array.isArray(project.resources)
  ? (project.resources as JsonObject[]).map((r) => ({
      id: r.id,
      typeKey: r.typeKey,
      typeName: r.typeName,
      typeNameEn: r.typeNameEn,
      name: r.name,
      nameEn: r.nameEn,
      photo: r.photo,
      summary: r.summary,
      summaryEn: r.summaryEn,
      data: r.data || {},
      aiContext: r.aiContext || "",
    }))
  : [];
```

Add to skeleton return:

```typescript
resources: {
  items: resources,
},
```

## Modify: reconcileDnaPassthrough()

Lock resources (code-owned, same as services):

```typescript
out.resources = skeleton.resources;
```

## Modify: dna.core.v1.md

Add to grounding rules:
- "Never change `resources.items` — they are selected from the catalog by the user."
- "When generating team/partners sections, ground member details in `resources.items` filtered by `typeKey`."
