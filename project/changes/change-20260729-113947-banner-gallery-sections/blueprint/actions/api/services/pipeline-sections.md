# Services — Pipeline Sections (change-20260729-113947 after-state)

> Code: `src/pipeline-v3/section/section-schema.ts` (+ orchestrator if needed), prompts `section.generic.v1.md` (light touch), tests.

## Delta

- **Modify** section validate/normalize — reject unknown `imageRef` values for visual keys
- **Modify** section writer user payload — include `availableImageIds` (and optional purpose) so AI only picks real ids
- **Add** unit tests for imageRef validation

---

### Visual content fields

| Section key | Fields holding image ids |
|-------------|--------------------------|
| `banner` | `content.imageRef` |
| `full_bleed_banner` | `content.imageRef` |
| `images_gallery` | each string in `content.images[]` |

### Validation helper

```ts
assertImageRefsAllowed(sectionKey, content, availableIds: Set<string>): { ok; errors }
```

- Only runs for the three visual keys (no-op otherwise).
- Missing/blank ref → fail.
- Ref not in `availableIds` → fail with clear message.
- Wire into `validateAndNormalizeSectionContent` **or** call from section orchestrator immediately after it, before accept — prefer extending `validateAndNormalizeSectionContent` with optional `availableImageIds` arg so translate path can reuse.

If `availableImageIds` omitted/empty and section is visual → fail closed (should not have been mapped).

### Orchestrator

- Build `availableIds` from DNA/project images (`id` with url) same as map/assemble.
- Pass into validate.
- Existing repair/retry on validation failure applies.

### Prompt note (section.generic)

Add one short rule: for `banner` / `full_bleed_banner` / `images_gallery`, set `imageRef` / `images[]` **only** from `availableImageIds` in the user JSON; never invent urls or ids.

### Tests (`section-schema.spec.ts` or sibling)

1. Valid `banner` with known id → ok  
2. `banner` with unknown id → not ok  
3. `images_gallery` with one unknown among three → not ok  
4. Non-visual key ignores image id set → ok  

### Status
- planned
