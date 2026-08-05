# Services — Branding resolve (pack delta)

### `resolveBrandingColors` (`pipeline-v3/analyze/branding-colors.ts`)
- Status: planned
- Signature (after-state):
  ```ts
  resolveBrandingColors(
    project: JsonObject,
    workspaceSettings?: JsonObject | null,
  ): BrandingColorsResolved
  ```
- Precedence:
  1. project `colorPalette` (normalize, allowEmpty) if length ≥ 1 → `source: "palette"`
  2. client_logo derive → `source: "client_logo"`
  3. workspace: prefer `colorPalette`; else roles→colors; else `defaultColor` → `source: "workspace"`
  4. Roya defaults → `source: "roya_default"`
- Extend `BrandingColorSource` with `"workspace"`
- When source is `workspace`, missing secondary/accent derive from primary (same as palette), not Roya navy

### Call sites
- `buildDnaSkeleton` / dna-passthrough: accept optional `workspaceSettings` and pass into resolve
- `analyze-orchestrator.service.ts`: load `getPublicSettings(workspaceId)` (or already-loaded settings) and pass into `buildDnaSkeleton`

## Delta

- **Modify** resolve precedence + source enum
- **Modify** DNA skeleton build to inject workspace fallback
