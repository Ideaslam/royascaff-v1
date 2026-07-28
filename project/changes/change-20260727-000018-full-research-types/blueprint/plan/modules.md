# Modules — delta (change-20260727-000018)

## Creative / AI Generation (Pipeline v3)

### After-state (touched features)

1. **Deep research modules (1d)** [backend-only] — one strong-model call per selected `researchOptions` key among:
   `market` | `competitor` | `audience` | `trends` | `benchmarks` | `case-studies` | `social-analysis` | `action-plan`
2. **Research coverage gate** [backend-only] — every selected option requires its primary section key (competitor → N instances)
3. **Map planner** [backend-only] — prefers primary keys from catalog; `maxSections` ≥ 28

## Templates

### After-state (touched features)

1. **pitch-landscape section catalog** [backend-only] — **19** keys: prior 14 + `market_trends`, `benchmarks`, `case_studies`, `social_audit`, `action_plan`
2. **Disk partials** [backend-only] — one HBS per new key under `templates/pitch-landscape/v1/partials/`
3. **pitch-landscape-formal** [backend-only] — inherits same section list via shared catalog builder

## Delta

- **Complete**: research launch subset → full 8 options end-to-end
- **Modify**: Templates catalog count 14 → 19; `maxSections` 22 → 28
- **Unchanged**: FE research checkboxes; Projects CRUD (already accepts full enum)
