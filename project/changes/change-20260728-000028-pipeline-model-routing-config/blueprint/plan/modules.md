# Modules — change-20260728-000028 (pack slice)

## 6. AI (delta)

### Features (after-state for touched items)

6. **Pipeline v3 foundations** [backend-only] — BullMQ queues, AJV contracts, prompt packs, **DB-config model-by-request-type resolver** (`config/pipelineModelRouting`, short TTL cache, hardcoded fallbacks)
15. **Translate section jobs** [backend-only] — model from routing config (`translate` → fast/Haiku by seed); schema-validated; glossary rules; fan-in → assemble/export

## Delta

- Model routing source of truth moves from hardcoded strong/fast + workspace overrides → system config document
- Research / `section.research` use stronger seeded model; DNA/map/section/vision medium; translate/repair fast
- Workspace `strongModel` / `fastModel` / `model` do **not** override v3 request-type routing (API key still from workspace settings)
