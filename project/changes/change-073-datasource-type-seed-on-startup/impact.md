# Impact Analysis — Datasource type seed on container start

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Seed script | complete | `roya-ai-dynamo-api/src/database/seeds/datasource-type-meta.seed.ts` | Already uses `$setOnInsert` (insert-if-missing). Comment still says “manual only / never on startup”; logging always counts as upserted |
| npm script | complete | `package.json` → `seed:datasource-types` (ts-node) | No prod `node dist/...` script |
| Dockerfile | complete | `Dockerfile.build` | `CMD ["node", "dist/main"]` — seed not run |
| Nest OnModuleInit seeders | n/a (pattern exists) | `WidgetDefinitionSeeder`, `AiModelPricingSeeder` | Not using this path; user asked for Dockerfile startup |
| Schema / API | complete | data module | No change |

Feature state: **complete** (modify wiring + clarify insert-only semantics)

## Affected Modules

- **Data** (datasource type metadata) — seed behavior + deploy startup only

## Plan Docs to Update

- [x] `project/plan/data-model.md` — Seed line: insert-if-missing + runs on container start
- [x] `project/plan/modules.md` — Feature 9 wording: seeded via startup script (not manual-only)
- [ ] endpoints / services / pages / rules — no change

## Files to change (code)

| Action | File |
|--------|------|
| **Modify** | `roya-ai-dynamo-api/src/database/seeds/datasource-type-meta.seed.ts` — insert-if-missing (find + create); log inserted vs skipped; optional `dotenv` for local |
| **Modify** | `roya-ai-dynamo-api/package.json` — keep `seed:datasource-types`; add `seed:datasource-types:prod` → `node dist/database/seeds/datasource-type-meta.seed.js` |
| **Modify** | `roya-ai-dynamo-api/Dockerfile.build` — `CMD` runs prod seed then `node dist/main` (fail-fast if seed fails) |

## Ripple

- Admin-edited meta rows remain safe (no `$set` overwrite).
- Fresh deploys get all seeded types without a manual step.
- If Mongo is unreachable at boot, container exits (seed before main) — intentional so types are present before traffic.

## Risk

- **Complexity:** L  
- **Cross-module:** N  
- **Migration:** N  

## Recommendation

- **Modify:** existing seed + Dockerfile CMD + package.json scripts + plan seed wording  
- **Create:** none (no new services/endpoints/entities)  
- **Do not:** Nest `OnModuleInit` seeder (out of scope unless preferred later)
