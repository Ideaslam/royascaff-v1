# Services — Safqa API · Pipeline Sections + Engine (Phase 3)

> Under `src/pipeline-v3/section/`, `assemble/`, `export/`, `reconciler/`.
> Reuse: TemplateRenderService, PdfRenderService, S3Service, callClaudeJsonTraced, ModelResolver, PipelineTraceService, per-template catalog registry (`getSectionDef(key, templateKey)`), PipelineQueueService.

## Delta

- **Create** SVC-PIPE-S3-01..08 below
- **Modify** `PipelineQueueService` — dispatch section/assemble/export; fan-in; extend `isStepAlreadyDone`
- **Modify** `MapOrchestrator` — on map success enqueue section fan-out (when flag on / proposal v3)
- **Modify** Projects create-from-project — require `pipelineV3Enabled`
- **Replace** section prompt placeholders with production packs

---

### SVC-PIPE-S3-01 · SectionOrchestrator [domain, internal, PipelineV3]
- Status: done
- Methods:
  - `runSection(job: { workspaceId, proposalId, projectId, runId, instanceId, language })` — load map entry + **template-scoped** contentSchema (`proposal.templateKey`) + DNA slice; load public Settings seller; AI call with `lengthBudgets`; clamp-first + soft max AJV + richness; repair ≤2; write `proposal.sections[i]`; update `generation.steps.sections` counters
  - `enqueueAllSections(proposalId)` — create pending section rows from sectionMap; enqueue N `pipeline.section` jobs; set status `generating_sections`
- Deps: ProposalsRepository, ProjectsRepository, catalog registry, Claude, traces, Schema compile from template contentSchema, **SettingsDataService**
- Side effects: async, external API
- Rules:
  - Research keys get full `research.modules.*`; others get headlines only
  - Length budgets / validate / clamp use `(templateKey × sectionKey)` — pitch ≠ website
  - Visual keys: pass `availableImageIds` from DNA slice images; `imageRef` / `images[]` must be known ids
  - Financial: AI fills non-money slots only; strip/ignore money table from AI
  - Failed section does not fail siblings; concurrency via worker concurrency (6–8)
  - Trace every AI + validation/richness
  - User JSON includes **`workspace`** seller from Settings (`name`←companyName, `logoUrl`, `email`, `phone`, `address` — omit empties); Settings load fail → warn + `{}`
  - For `about_workspace`: `workspace` is authoritative selling company — never invent Roya/Safqa as the agency
  - Prompts: `dna.core.v1` / `section.generic.v1` ground seller identity in `workspace`, not product brand

### SVC-PIPE-S3-02 · DnaSliceBuilder [domain, internal, PipelineV3]
- Status: done
- Methods: `buildDnaSlice(sectionKey, mapEntry, dna, competitorIndex?)`, `isResearchSectionKey(key)`
- Deps: none (pure)
- Side effects: none
- Rules: full module DNA for research keys `market_analysis`, `competitor_analysis`, `audience_insights`, `market_trends`, `benchmarks`, `case_studies`, `social_audit`, `action_plan`; competitor_analysis instance gets matching competitor index when possible

### SVC-PIPE-S3-03 · RichnessGate [domain, internal, PipelineV3]
- Status: done
- Methods: `assertRichness(sectionKey, content, capacity?): { ok, errors[] }`
- Deps: catalog capacity / depth contracts
- Side effects: none
- Rules: min lengths on primary text slots; fail closed → repair path

### SVC-PIPE-S3-03b · SectionSchemaValidateNormalize [domain, internal, PipelineV3]
- Status: done
- Methods:
  - `extractLengthBudgets(contentSchema)` → `{ min?, max, aim, softMax }` per field path (`aim = floor(max * 0.9)`)
  - `validateSectionContent(key, content, templateKey?)` — soft AJV (`maxLength` +10%)
  - `validateAndNormalizeSectionContent(key, content, templateKey?, availableImageIds?)` — **clamp to catalog max first**, then soft-validate, then visual `imageRef` gate
  - `assertImageRefsAllowed(sectionKey, content, availableImageIds)` / `collectVisualImageRefs`
  - `clampContentToCatalogMax(schema, content)`
- Deps: template catalog registry; AJV; `visual-sections` key set
- Side effects: none
- Rules:
  - Prompt targets = catalog max; writer aim ≈ 90%
  - Soft tolerance `SECTION_MAX_LENGTH_TOLERANCE = 0.10` (integer-safe)
  - Clamp-first so large overshoots do not burn Claude retries; stored content always ≤ catalog max (layout-safe)
  - `minLength` / shape errors remain strict → repair/retry
  - Visual keys fail closed if ids missing/unknown or no available images
  - Used by section generate + translate (translate reuses source image ids as allowed set)

### SVC-PIPE-S3-04 · SectionFanInCoordinator [domain, internal, PipelineV3]
- Status: done
- Methods:
  - `onSectionTerminal(proposalId, runId)` — if all sections terminal: if zero ready → fail; else enqueue `pipeline.assemble`
- Deps: ProposalsRepository, PipelineQueueService
- Side effects: async
- Rules: idempotent; prefer FlowProducer parent **or** atomic Mongo check after each section (document choice in implement notes). Prefer FlowProducer if BullMQ version supports cleanly; else Mongo fan-in is acceptable.

### SVC-PIPE-S3-05 · AssembleService [domain, internal, PipelineV3]
- Status: done
- Methods:
  - `runAssemble(job)` — load ready (+ optionally skip failed) sections; inject financials/dates/client; load workspace Settings + resolve branding; map DNA `branding.colorRoles` (or derive from `branding.colors[]`) → `themeOverrides` **unless** template `theme.lockPalette` (then omit DNA + `proposal.themeOverrides` so catalog tokens win); `TemplateRenderService.renderProposalHtml` with root branding + theme; overflow guard (Puppeteer measure `.page`, shrink steps); PDF via PdfRenderService; stash buffers/keys temp or pass to export job payload via Mongo staging fields; set `steps.assembly` done; enqueue export
  - `buildFinancial(proposal, project, language)` — assign financial section rows + money totals:
    - each row includes `revenueType`; ratio → `unitPrice`/`lineTotal` = `formatRatioPercent(price)` (e.g. `10%`); non-ratio → numeric `price * qty`
    - money totals via shared `computeServicesFinancial` (excludes `RevenueType.Ratio`; tax = subtotal × taxRate)
    - do **not** edit `.hbs` financial partials; `money` helper passes through strings ending in `%`
- Branding resolution (root Handlebars):
  | Key | Source |
  |-----|--------|
  | `workspace_name` | settings.companyName |
  | `workspace_logo` | settings.logoUrl |
  | `workspace_email` / `workspace_phone` / `workspace_address` | settings |
  | `client_name` | proposal/project clientName |
  | `client_logo` | (1) first DNA/project image `purpose === 'client_logo'` → (2) else Clients.`logoUrl` for proposal/project `clientId` → (3) `""` |
- Placement (disk templates): cover + interior = **client-first** (no per-page workspace brand-mark); workspace chrome in `about_workspace` + footer; website sticky header uses client branding
- Theme colors (`themeOverrides` → `--color-primary|secondary|accent|surface|text`):
  | theme key | Source |
  |-----------|--------|
  | `primary` | `dna.data.branding.colorRoles.primary` (= `colors[0]`) |
  | `secondary` | `colorRoles.secondary` (`colors[1]` or darken primary) |
  | `accent` | `colorRoles.accent` (`colors[2]` or lighten primary) |
  | `surface` | `colorRoles.surface` (`colors[3]` or `#FFFFFF`) |
  | `text` | `colorRoles.text` (`colors[4]` or `#1A1A2E`) |
  - Legacy DNA without `colorRoles` → derive at assemble from `colors[]` + `source`
  - When source is palette/logo, missing secondary/accent never fall back to Roya navy/sky
  - Precedence: DNA roles fill all five slots; explicit non-empty `proposal.themeOverrides` key wins
  - **Palette lock:** if `tplDoc.theme.lockPalette === true` (e.g. `roya-presentation`), skip DNA + proposal theme overrides entirely (future pack may selectively inject DNA colors)
- Deps: TemplateRenderService, PdfRenderService, ProposalsRepository, ProjectsRepository, ProjectDnaVersionsRepository, SettingsDataService, TemplatesRepository, **ClientsRepository**
- Side effects: CPU, browser
- Rules: no AI; missing logos → empty string (templates `{{#if}}`); Clients lookup fail → warn + empty `client_logo`; never inject product “Safqa” fallback; failed sections omitted from deck (Ready with gaps); if none ready → fail without export

### SVC-PIPE-S3-06 · ExportService [domain, internal, PipelineV3]
- Status: done
- Methods:
  - `runExport(job)` — promote assemble staging into `renderedByLang[lang]`; upload standalone **financial.html** via **v2 commercial template** (cover, services, distribution, payment phases, terms, bank/signature — API-ported `financial_template.html`); upsert `technical*Url*` + `financial*Url*` for that lang; set `type: 'creative'`; status `ready` or `partially_failed`
- Deps: S3Service, ProposalsRepository, ProjectsRepository, SettingsDataService, `financial-html.builder` → `renderFinancialDocumentHtml`
- Side effects: file (S3)
- Rules: retryable independently; do not re-run assemble on export retry unless artifacts missing; merge URL maps per-lang (do not wipe other languages); financial upload required for creative list/send parity; totals remain code-computed; pitch-deck `financial.hbs` unchanged; cover/fonts embedded as data URIs from `templates/financial-document/`

### SVC-PIPE-FIN-DOC · Financial document renderer [domain, internal]
- Status: done
- Methods:
  - `renderFinancialDocumentHtml(data)` — token-replace commercial template (AR/EN); services table, chart, 50/30/20 phases
  - `financialTotalsFromProposal(proposal, project)` — code-computed via `computeServicesFinancial` (ratio excluded from money)
  - `formatPriceCell` — ratio → `N%` only; else SAR / ر.س; category/bar aggregates skip ratio
- Deps: `templates/financial-document/financial_template.html` + cover/font assets; `common/types/revenue-type.ts`
- Side effects: none (pure string)
- Rules: parity with FE `FinancialTemplateService`; no AI; branching via `RevenueType` / `isRatioRevenueType`

### SVC-REV-TYPE-01 · RevenueType shared enum [domain, internal]
- Status: done
- Location: `src/common/types/revenue-type.ts`
- Exports: `RevenueType` enum (`project`|`recurring`|`retainer`|`one-time`|`hourly`|`ratio`); `isRatioRevenueType`; `formatRatioPercent`; `computeServicesFinancial`
- Rules: wire values unchanged (no DB migration); labels stay on FE; money totals never include ratio

### SVC-PIPE-S3-07 · PipelineReconciler [infrastructure, internal, PipelineV3]
- Status: done
- Methods:
  - `sweep()` every ~60s — find proposals with non-terminal `generation.status` + `pipelineVersion: "3"` older than threshold; if no active BullMQ jobs for runId/proposal → re-enqueue current step
- Deps: ProposalsRepository, PipelineQueueService, BullMQ Queue.getJobs
- Side effects: async
- Rules: fail-soft; never duplicate if step already done; skip if flag off optional

### SVC-PIPE-S3-08 · Feature flag + ProposalPipeline helpers [domain, internal, PipelineV3/Settings]
- Status: done
- Methods:
  - `isPipelineV3Enabled(workspaceId): boolean` — settings.pipelineV3Enabled === true
  - `retrySections(workspaceId, proposalId, instanceIds[])` — reset failed → enqueue; may clear assembly/export if regenerating content
  - Wire map→sections and section→assemble→export in queue service
- Deps: SettingsService / getSettingsFromDb, ProposalsRepository, Queue
- Side effects: async
- Rules: create-from-project rejects when flag false; `/ai-jobs` v2 untouched

### SVC-PIPE-S3-09 · Section prompt packs [domain, internal, PipelineV3]
- Status: done
- Methods: N/A — files
- Deps: `section.generic.v1.md`, `section.research.v1.md`, `section.translate.v1.md`, shared anti-hallucination/depth/voice
- Side effects: none
- Rules:
  - Role/Mission/Grounding/Output-contract; research presentation expands module, no new facts
  - **Length HARD**: stick to `lengthBudgets.aim` (~90% of max); never exceed `max`; count characters (AR+EN)
  - Depth must fit inside maxLength — denser evidence, not longer prose
  - User payload: `dnaSlice` then `lengthBudgets` + rules last (recency)
