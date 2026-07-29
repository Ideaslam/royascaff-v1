# Services — Pipeline Map (change-20260729-113947 after-state)

> Code: `src/pipeline-v3/map/map-orchestrator.service.ts`, `src/pipeline-v3/prompts/map.plan.v1.md`.

## Delta

- **Modify** map prompt — visual section keys, image rules, max **32**
- **Modify** MapOrchestrator — strip visual sections when images insufficient; pass image availability into AI user payload when cheap

---

### Visual section keys

```ts
const VISUAL_SECTION_KEYS = new Set([
  "banner",
  "full_bleed_banner",
  "images_gallery",
]);
```

### Usable images

Count DNA/project image rows that have both `id` and non-empty `url` (same source assemble uses).

| Key | Min usable images to keep |
|-----|---------------------------|
| `banner` | 1 |
| `full_bleed_banner` | 1 |
| `images_gallery` | 2 |

### Guard (after AI map + after inject/repair normalize)

`stripVisualSectionsIfNoImages(sectionMap, usableCount)`:
- Drop any section whose `key` is visual and `usableCount` &lt; min for that key
- Re-order remaining sections (existing normalize sort)

Apply after each successful normalize path before validate / persist so map never stores visual keys when images are missing.

### Prompt (`map.plan.v1.md`) after-state additions

- Max sections **32** (was 28).
- Optional visual dividers (only if catalog contains them **and** project images exist):
  - `banner` — image-only chapter break; repeatable
  - `full_bleed_banner` — title (+ optional subtitle) over image; repeatable
  - `images_gallery` — title + grid of image refs (2–6); repeatable
- Prefer 0–3 visual instances total unless DNA is highly visual.
- When emitting visual sections, set optional `imageRefs: string[]` on the map entry to the chosen project image **ids** (writer may use as hints).
- Never invent image ids; only use ids from the provided images list in the user JSON.
- If images list empty / insufficient → do not include visual keys.

### User payload (orchestrator)

When calling map AI, include a compact `availableImages: [{ id, purpose?, userNote? }]` derived from DNA images (no need for full URLs in prompt if cost-sensitive — ids + purpose enough). If empty array, prompt + strip guard both keep visuals out.

### Status
- planned
