# Change Request

## Metadata
- **date**: 2026-07-27
- **change-type**: modify-feature
- **target-app**: api
- **affected-repos**: backend
- **priority**: high
- **request-id**: REQ-PROP-V3
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Pipeline v3 Analyze (1d), Map (coverage), Sections (DNA slice), Templates (`pitch-landscape`)
- Feature(s): Complete all 8 research options end-to-end (analyze → required section → render)
- Endpoint(s): none new (existing proposal/project pipeline)
- Page(s)/View(s): none (FE toggles already present)
- Service(s): ResearchModuleRunner, research-coverage gate, dna-slice, pitch-landscape catalog + HBS partials, ModelResolver request types, section prompts/fixtures as needed

## Description

Complete the deferred research options so every checkbox in Advanced research (market, competitor, audience, trends, benchmarks, case studies, social analysis, action plan) is honored by Pipeline v3 and the current `pitch-landscape` template.

**Today (partial):** DNA schema + FE allow all 8 keys; analyze/map/template only implement `market` | `competitor` | `audience`. Selecting the other five fails (`Unsupported research module`) or is silently ignored by the coverage gate / catalog.

**Deliver:**

1. **Analyze 1d** — Add runners + prompts for `trends`, `benchmarks`, `case-studies`, `social-analysis`, `action-plan` (same deep-module contract as existing three). Register matching `PipelineRequestType` entries as strong-model research calls. Store modules under `research.modules[<ui-key>]` (same pattern as market/competitor/audience).
2. **Coverage / required sections** — Extend `COVERAGE` + `deriveRequiredSectionKeys` so each selected option requires its primary section key; map repair injects missing primaries when the template has them.
3. **Template `pitch-landscape`** — Add section defs + contentSchemas + HBS partials + wire into catalog keys / bootstrap / fixture content:
   - `market_trends` ← `trends`
   - `benchmarks` ← `benchmarks`
   - `case_studies` ← `case-studies`
   - `social_audit` ← `social-analysis`
   - `action_plan` ← `action-plan`
4. **Section generation** — Extend `dna-slice` / research section key set so new research pages receive full module DNA (not headlines-only).
5. **Map prompt / maxSections** — Update map guidance so new keys are preferred when selected; raise section ceiling if needed so competitor×N + full research set still fits.

**Out of scope:**
- Frontend UI redesign of research cards (already complete)
- New alternate templates beyond `pitch-landscape` (+ formal sibling if it shares the same catalog builder)
- Regenerating historical proposals automatically
- Secondary “also good” sections that are not in the template (`opportunities`, `swot`, `channel_strategy`, `testimonial`, etc.) — keep as alsoGood fallbacks only

**Locked decisions (discovery):**
- Primary mapping per `docs/refactor-proposal-generator.md` §5.6.1 / §6.1
- Unselected research → sections not required / usually omitted
- `social-analysis` grounds on `digitalPresence` URLs; empty presence → qualitative module still runs, coverage still requires `social_audit`
- `case-studies` → analogous playbooks only; no fabricated real-client brand claims
- `competitor` remains ×N (1–3) instances
- No new HTTP endpoints; auth unchanged
- Fail closed: unsupported module must not remain after this pack

## Acceptance Criteria

1. Selecting any of the 8 research option keys on a project runs a dedicated 1d analyze call (prompt + strong model) and populates `dna.research.modules[<key>]` with deep findings + `recommendedSectionKeys` + `suggestedMapBrief`.
2. `dna.research.requiredSectionKeys` includes the primary section for every selected option (`competitor` → N× `competitor_analysis`).
3. Map + research coverage gate require those primaries; missing → repair inject / fail closed — never pass with a selected option and no dedicated research page when the template has the primary key.
4. `pitch-landscape` catalog + disk partials include `market_trends`, `benchmarks`, `case_studies`, `social_audit`, `action_plan` with contentSchemas suitable for section generation + PDF render.
5. Section worker DNA slices for the five new keys include the full research module (parity with market/competitor/audience).
6. A proposal generated with all 8 options selected produces a deck that includes all primary research sections (plus competitor×N) without `Unsupported research module` or `template-lacks:*` failures.
7. Unselected options do not force their primary sections into the map.
8. No new public API routes; FE research toggles continue to work unchanged.

## Notes

- Source of truth: `docs/refactor-proposal-generator.md` §5.6.1, §6.1 (1d table), §9.5 depth extras.
- AlsoGood fallbacks remain for future templates; launch template must ship the five new primary keys so hard `template-lacks` does not fire for the full set.
- Formal sibling template shares catalog builder — keep keys in sync if it clones the same section list.
