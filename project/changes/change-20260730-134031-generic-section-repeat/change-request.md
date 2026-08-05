# Change Request

## Metadata
- **date**: 2026-07-30
- **change-type**: modify-feature
- **target-app**: api
- **affected-repos**: backend
- **priority**: medium
- **request-id**: REQ-PROP-V3
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Creative / AI Generation (Map worker), Templates (Section catalog per template)
- Feature(s): Generalize "PDF list section split" from a hardcoded key allowlist into a catalog-metadata-driven mechanism so **any** section key can become AI-decided multi-instance (multi-slide) — starting with `social_audit`
- Endpoint(s): none new
- Page(s)/View(s): none (no FE changes)
- Service(s): `MapOrchestratorService` (clamp + validate), `pdf-list-split.ts` (shared helpers), `pitch-landscape.catalog.ts` / `website-template.catalog.ts` (catalog flags), `map.plan.v1.md` (prompt)

## Description

### Problem
Some non-split-capable sections (e.g. `social_audit`, and other research pages) can receive more DNA-sourced data than fits one fixed 16:9 slide — content gets clipped at the bottom (see attached screenshots: a social-audit slide with 2 channel cards has no room for a 3rd; a benchmarks table would clip past ~6 rows).

Today's "PDF list split" (merged pack `change-20260729-122650-pdf-list-section-split`) already lets Map AI emit **N consecutive instances of the same section `key`** (distinct `instanceId`, sequential `order`) when content overflows — but only for a **hardcoded allowlist**: `timeline`, `action_plan`, `services` (+ the separate `financial_part`/`financial_full` pair). Adding this to a new key (e.g. `social_audit`) today means touching 3 code files by hand (`PDF_LIST_SPLIT_KEYS`, `PDF_OVERFLOW_CLAMP_KEY_SET`, `PDF_LIST_SPLIT_CAPACITY`) plus the prompt text — exactly the per-type special-casing the user wants to avoid.

### Outcome — make it catalog-driven, not code-driven
Every `TemplateSectionDef` already carries `repeatable: boolean` and `pages: { min, max }` per key, and the Map AI **already receives this in `abstractCatalog`** (`map-orchestrator.service.ts` already maps `repeatable`/`pages` into the AI payload). The allowlist constants duplicate what the catalog already declares. This pack removes the duplication:

1. **Map orchestrator** — `clampListSplitInstances` and `validateMap`'s per-key count check switch from `PDF_OVERFLOW_CLAMP_KEY_SET.has(key)` to `getSectionDef(key, templateKey)?.repeatable === true`. Any repeatable key is now clamped/validated against its own `pages.max` automatically.
2. **Map prompt payload** — `listSplit.keys` / `listSplit.catalogCapacity` are derived at request time from the active template's catalog (`repeatable === true` keys; capacity hints auto-computed from each key's own `contentSchema` array `maxItems`, e.g. `social_audit.channels.maxItems`) instead of the static `PDF_LIST_SPLIT_KEYS` / `PDF_LIST_SPLIT_CAPACITY` objects.
3. **`map.plan.v1.md` prompt text** — reworded from "keys `timeline`, `action_plan`, `services` may be emitted as multiple instances…" to a generic rule: "any `abstractCatalog` key with `repeatable: true` may be emitted as multiple consecutive same-key instances (own `pages.max` ceiling) when content overflows one slide; brief must state which subset of the data that instance covers; title may use `(1/2)` style." Financial's two-key-family rule (`financial` vs `financial_part`×(N−1)+`financial_full`) stays as its own documented exception — it's a different key per chunk, not a repeated key.
4. **`website-template.catalog.ts`** — the landing-lock switches from `PDF_LIST_SPLIT_KEY_SET.has(section.key)` (allowlist) to `section.repeatable === true` (attribute-based): any key that becomes repeatable in the shared pitch catalog is automatically forced back to single-instance for the continuous website/landing template, with zero maintenance.
5. **`pitch-landscape.catalog.ts`** — flip `social_audit` from `repeatable: false, pages: { min: 1, max: 1 }` to `repeatable: true, pages: { min: 1, max: 2 }`. Because `pitch-landscape-formal` and `roya-presentation` clone the same shared section array, this one flag change makes `social_audit` split-capable across all three presentation templates immediately, proving the generic mechanism end-to-end.
6. Everything downstream is **already** generic and untouched: `SectionOrchestrator` materializes one `proposal.sections[]` row per map entry regardless of repeated `key`; `AssembleService` sorts by `order`; `TemplateRenderService` renders one page per section keyed by `key`/`order` reusing the same Handlebars partial. No render/assemble/schema changes needed.

### Why this matches the user's framing
"AI puts `social_audit` (2 channels) at order 20, `social_audit` (1 channel) at order 21" is exactly what `normalizeMap` already produces (distinct `instanceId`, same `key`, sequential re-numbered `order`) once the key is marked `repeatable` in the catalog — no special "type" concept, no new flow, no per-key code path. Enabling any future key (`market_analysis`, `benchmarks`, `case_studies`, …) for the same behavior becomes a one-line catalog change (`repeatable: true, pages.max: N`) with no further engineering.

### Out of scope
- Auto-numbering titles `(i/N)` in code — stays AI-authored (same as existing `timeline`/`action_plan` behavior).
- Automatic height/word-count overflow detection — stays AI judgment guided by catalog capacity hints (same as today); a measured-overflow auto-split is a future pack.
- Flipping `repeatable` on any research key other than `social_audit` in this pack (mechanism will support it trivially afterward, but each flip is a deliberate content decision, not bundled here).
- Website/landing template split (stays excluded, now via generic attribute check instead of allowlist).
- Any FE change (none needed).

## Acceptance Criteria
1. `MapOrchestratorService.clampListSplitInstances` and `validateMap` enforce `pages.max` per key using `getSectionDef(key, templateKey)?.repeatable`, not a hardcoded key set — verified for `social_audit` (new) and `timeline`/`action_plan`/`services`/`financial_full` (regression, unchanged behavior).
2. Map AI payload's `listSplit.keys` / `listSplit.catalogCapacity` are computed from the active template's catalog at request time (no static allowlist import for these two fields).
3. `map.plan.v1.md` describes the repeat rule generically (references `abstractCatalog[].repeatable`/`pages.max`), keeping the financial part/full rule as a separate documented exception.
4. `website-template.catalog.ts` forces `repeatable: false, pages: { min: 1, max: 1 }` for any inherited section where `repeatable === true`, without referencing a specific key list.
5. `pitch-landscape.catalog.ts` sets `social_audit`: `repeatable: true, pages: { min: 1, max: 2 }`; `pitch-landscape-formal` and `roya-presentation` inherit this automatically; `website-template` stays single-instance for `social_audit`.
6. A proposal whose DNA has enough social-channel data for 2 slides can end up with two `social_audit` `proposal.sections[]` rows (distinct `instanceId`, sequential `order`), each rendered as its own PDF page via the existing `social_audit` partial — validated via a manual pipeline run or targeted test.
7. Research-coverage gate still passes when `social_audit` appears once or twice (coverage only requires ≥1 hit — no gate change needed, confirmed by inspection/test).
8. No changes to `map.v1` AJV schema, `proposal` data model, or any frontend file.

## Notes
- Builds directly on the merged pack `change-20260729-122650-pdf-list-section-split` (REQ-PROP-V3) — this pack generalizes its allowlist into catalog-driven behavior; existing split keys must keep working identically (regression-checked).
- Trigger: screenshots showing a `social_audit` slide (2 channel cards, no room for more) and a dense `benchmarks` table slide clipping at the bottom.
- Follow-up (separate pack, not now): flip `repeatable` on other research keys (`market_analysis`, `benchmarks`, `case_studies`, `market_trends`, `audience_insights`) once this mechanism is verified — each is then a 1-line catalog change.
