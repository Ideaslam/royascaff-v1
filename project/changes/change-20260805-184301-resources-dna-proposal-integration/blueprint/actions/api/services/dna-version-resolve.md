# Service Delta — DNA Version Resolve (resources integration)

## Files
- `src/pipeline-v3/analyze/dna-version-resolve.ts`

## Modify: buildDnaSnapshot()

Add `resources` alongside `services`:

```typescript
resources: Array.isArray(version.resources) ? version.resources : [],
```

## Modify: resolveDnaForProposal()

Add `resources` to `ResolvedDnaSource` type:

```typescript
export type ResolvedDnaSource = {
  dnaData: JsonObject | null;
  images: JsonObject[];
  services: JsonObject[];
  resources: JsonObject[];    // ← new
  colorPalette: unknown;
  dnaVersionId: string | null;
  title: string | null;
  financial: JsonObject | null;
};
```

Populate `resources` from each resolution path:
- From `proposal.dnaSnapshot.resources`
- From DNA version `version.resources`
- From project `project.resources`
- Default: `[]`

Same pattern as existing `services` / `images` resolution.
