# Services — Pipeline Model Routing Config

### SVC-PIPEV3-08 · PipelineModelRoutingConfig [infrastructure, internal, PipelineV3]
- Status: done
- Methods:
  - `getPipelineModelRouting(): Promise<{ defaultModel: string; byRequestType: Record<string, string> }>`
  - Internal short TTL cache (suggested **30–60s**, implemented **45s**); refresh on miss/expiry
- Deps: `ConfigRepository` (`getConfigDocument("pipelineModelRouting")` or equivalent lean read)
- Side effects: none
- Rules:
  - Missing/empty doc → return null/empty so resolver uses hardcoded defaults
  - Cache is process-local; no Redis required
  - Not exposed on client app config bundle (backend-only)

### Seed contract
- Status: done
- Sources: `scripts/config-seed-data.js` → `pipelineModelRouting`
- Upsert paths:
  1. `scripts/seed-config.js` — add to `configDocs`
  2. `MongoConfigRepository.seedConfigBundle` — add config doc key
  3. `POST /api/admin/seed-config` — pass `CONFIG_DATA.pipelineModelRouting` into bundle
- Types: extend `SeedConfigBundle` with optional/required `pipelineModelRouting: JsonObject`
- Rules: upsert (re-seed updates mapping)
