## Module: AI Logs

### SVC-AILOG · AiLogRepository [internal, domain, AI Logs]
Persists and queries AI request logs; computes cost/usage summaries.

**Methods:**
- `create(data: CreateAiLogData): Promise<AiLogDocument>` — inserts AI log (often PENDING), returns it
- `updateById(id, data: UpdateAiLogData): Promise<void>` — finalizes log with response/tokens/cost/status
- `findById(id)` — fetch one log
- `findPaginated(filters)` — paginated logs filtered by provider/model/status/date
- `costSummary(filters)` — totals, per-day, and per-model cost/usage aggregations

**Deps:** AiLog model (@InjectModel)
**Side effects:** DB writes/aggregations
**Rules:** Pending log created before each AI call (stuck/in-flight calls visible) · Cost summaries default to zeroed totals when no data matches

---

### SVC-AILOG-PRICE · AiModelPricingRepository [internal, domain, AI Logs]
Stores and resolves per-model token pricing used to compute AI call costs.

**Methods:**
- `findByModelId(provider, modelId): Promise<AiModelPricing | null>` — active pricing for a model
- `upsert(data): Promise<void>` — inserts or updates pricing record
- `findAll(): Promise<AiModelPricing[]>` — all pricing records, sorted

**Deps:** AiModelPricing model (@InjectModel)
**Side effects:** DB writes
**Rules:** Only active pricing resolved for cost calculation · Missing pricing results in costUsd of 0 (warning logged by provider)

---

### SVC-AILOG-SEED · AiModelPricingSeeder [internal, domain, AI Logs]
Startup seeder that upserts baseline Anthropic model pricing (Claude 3/3.5/4.5 families).

**Methods:**
- `onModuleInit(): Promise<void>` — upserts each baseline Anthropic pricing record (failures logged, not thrown)

**Deps:** AiModelPricingRepository
**Side effects:** writes pricing records (idempotent upsert by provider+modelId)
**Rules:** Idempotent upsert by provider+modelId — safe to run on every boot
