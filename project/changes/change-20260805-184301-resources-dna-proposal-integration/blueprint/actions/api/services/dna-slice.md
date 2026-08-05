# Service Delta — DNA Slice (resources integration)

## Files
- `src/pipeline-v3/section/dna-slice.ts`

## Modify: buildDnaSlice()

Add `resources` to the core slice (all sections receive it):

```typescript
const core = {
  project: dna.project,
  client: dna.client,
  services: { ... },
  competitors: dna.competitors,
  digitalPresence: dna.digitalPresence,
  images: dna.images,
  resources: dna.resources,   // ← new: full resources block
};
```

### Resource filtering for section prompts

The section AI prompt receives `resources.items` and uses `typeKey` to filter relevant resources. For example:
- `team` section → prompt filters `resources.items` where `typeKey === 'team-member'`
- `partners` section → prompt filters where `typeKey === 'partner'`

This filtering happens in the **section prompt** (not in code), keeping `buildDnaSlice` generic. The prompt instructions tell AI which `typeKey` to use for each section key.

### Alternative: code-side filtering

If prompt-side filtering proves unreliable, add a `resourceTypeKeyHint` to `TemplateSectionDef` and filter in code:

```typescript
const resourceTypeKey = mapEntry.resourceTypeKey || sectionDef.resourceTypeKey;
if (resourceTypeKey && dna.resources) {
  core.resources = {
    items: ((dna.resources as JsonObject).items as unknown[] || [])
      .filter((r) => (r as JsonObject).typeKey === resourceTypeKey),
  };
}
```

Start with prompt-side; switch to code-side if needed.
