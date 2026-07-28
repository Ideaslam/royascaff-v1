# Rules delta — template × section lengths

## After-state
1. Each template owns its section `contentSchema` in `src/pipeline-v3/templates/<templateKey>/`.
2. Runtime resolves lengths by `(templateKey, sectionKey)`.
3. Disk HBS/CSS stay under repo `templates/<key>/v1/`; TS catalogs stay under `src/`.

## Delta
- Add: one catalog per template key
- Change: no shared length ownership across pitch vs website
