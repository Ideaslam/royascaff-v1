# Data Model

## Shared Conventions
- **Database:** MongoDB (Mongoose ODM)
- **ID field:** `_id` (ObjectId, auto-generated) on every entity
- **Timestamps:** `createdAt` and `updatedAt` (Date, auto-managed by Mongoose) on every entity unless noted
- **Enums:** stored as strings, validated by Mongoose enum constraint
- **Bilingual strings:** English in the primary field (`name`, `title`, `description`, …); Arabic companion with `Ar` suffix (`nameAr`, `titleAr`, …). Frontend/API fall back to English when `*Ar` is empty.
- **Workspace-scoped collections:** entities 2–8 use dynamic per-workspace collections named `ws_{workspaceSlug}_<entity>`, resolved at runtime by `<Entity>Repository.getModel(workspaceSlug)`
- **Dynamic CSV data collections:** `csvdata_{fileId}` — one collection per uploaded CSV; created at upload, dropped on file deletion

Fields below are entity-specific only. `_id`, `createdAt`, `updatedAt` are omitted from every table.

## Design Principles
- CSV row data → dedicated dynamic collection per file; chart results pre-calculated in `chartdatacache` + Redis (never recalculated per viewer request)
- AI never reads data rows; `columnmetadata` is the sole AI input (column names, types, descriptions, samples)
- Widget query definitions and aggregation rules snapshotted inside `chartwidgets` at generation time so later customization doesn't invalidate history
- Widget `position`, `queryDefinition`, `displayConfig` are embedded subdocuments (read/written atomically on every dashboard load)
- Audit logs are immutable — no update/delete endpoints; writes are fire-and-forget (never block the primary operation)
- Subscription limits enforced at the service layer by reading active subscription before any dashboard or upload action
- `chartdatacache` is the persistence layer; Redis is the hot cache — both must be invalidated together on refresh
- `usersubscriptions` usage counters updated atomically via MongoDB `$inc` to prevent race conditions

## Phase Plan
**Phase 1 (MVP):** users · ws\_\*\_projects · ws\_\*\_dashboards · ws\_\*\_csvfiles · ws\_\*\_columnmetadata · ws\_\*\_chartwidgets · ws\_\*\_dashboarddatasources · ws\_\*\_chartdatacache · backgroundjobs · notifications · auditlogs · systemsettings · widgetdefinitions · ailogs · aimodels · csvdata\_{fileId}
**Phase 2 (Engagement):** sharelinks · subscriptionplans · usersubscriptions · payments

---

## 1. users

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| name | String | required | — |
| email | String | required, unique, lowercase, indexed | — |
| passwordHash | String | nullable; null for OAuth-only users | — |
| oauthProvider | String | nullable; enum: `google`, `microsoft` | — |
| oauthProviderId | String | nullable; provider's user ID for OAuth linking | — |
| role | String | required; enum: `admin`, `editor`, `viewer` | — |
| isActive | Boolean | required, default: true; false to deactivate without deletion | — |
| avatarUrl | String | nullable; Cloudflare R2 URL | — |
| languagePreference | String | required; enum: `en`, `ar`; default: `en` | — |
| refreshTokenHash | String | nullable; hashed refresh token for revocation | — |
| lastLoginAt | Date | nullable; updated on each login | — |
| currentWorkspaceId | ObjectId | nullable; active workspace for session scoping | → Workspace |
| defaultWorkspaceId | ObjectId | nullable; auto-routing on login | → Workspace |

**Indexes:** `{ email: 1 }` unique · `{ role: 1 }` · `{ isActive: 1 }` · `{ oauthProvider: 1, oauthProviderId: 1 }` compound
**Relations:** has-many Projects, CsvFiles, Dashboards, Notifications, Payments · has-one UserSubscription (referencing a SubscriptionPlan)

---

## 2. projects
Collection: `ws_{workspaceSlug}_projects`. No uniqueness constraint on name within a workspace.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| name | String | required; no uniqueness constraint | — |
| nameAr | String | optional, default: `''`; Arabic display name | — |
| description | String | nullable | — |
| descriptionAr | String | optional, default: `''`; Arabic description | — |
| ownerId | ObjectId | required | → User |
| isActive | Boolean | required, default: true; false = archived | — |

**Indexes:** `{ ownerId: 1 }` · `{ isActive: 1 }` · `{ ownerId: 1, isActive: 1 }` compound · text index on `name`
**Relations:** belongs-to User (via ownerId) · has-many Dashboards (within same workspace prefix) · isolated per workspace — no cross-workspace project references

---

## 3. csvfiles
Collection: `ws_{workspaceSlug}_csvfiles`. Row data lives in dynamic `csvdata_{fileId}` collection.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| ownerId | ObjectId | required | → User |
| originalFilename | String | required; duplicates allowed | — |
| fileSizeBytes | Number | required; max 52,428,800 (50 MB) | — |
| storageKey | String | required; R2 object key: `csv-files/{userId}/{fileId}/{filename}` | — |
| storageUrl | String | nullable; signed URL, regenerated on request | — |
| dataCollectionName | String | required; MongoDB collection name: `csvdata_{fileId}` | — |
| rowCount | Number | nullable; populated after row insertion completes | — |
| columnCount | Number | required; columns detected | — |
| status | String | required; enum: `uploading`, `analyzing`, `confirmed`, `error` | — |
| analysisJobId | ObjectId | nullable; the AI analysis job | → BackgroundJob |
| uploadedAt | Date | required; upload initiation timestamp | — |

`status`: `uploading` → file upload and row insertion in progress · `analyzing` → AI column analysis running · `confirmed` → user confirmed all column descriptions, ready for dashboard generation · `error` → upload or analysis failed

**Indexes:** `{ ownerId: 1 }` · `{ status: 1 }` · `{ ownerId: 1, status: 1 }` compound · text index on `originalFilename`
**Relations:** belongs-to User (via ownerId) · has-many ColumnMetadata · has-one csvdata\_{fileId} (dynamic collection) · linked to many Dashboards via DashboardDataSources

---

## 4. columnmetadata
Collection: `ws_{workspaceSlug}_columnmetadata`. One doc per column per CSV file — primary AI input for dashboard generation.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| fileId | ObjectId | required | → CsvFile |
| columnName | String | required; exact column header from CSV | — |
| columnIndex | Number | required; zero-based position in CSV | — |
| inferredType | String | required; enum: `string`, `number`, `date`, `boolean`, `category` | — |
| sampleValues | [String] | required; up to 10 distinct sample values (stored as strings) | — |
| nullCount | Number | required; null/empty cell count | — |
| uniqueValueCount | Number | required; distinct non-null values | — |
| aiDescription | String | nullable; AI-generated description | — |
| userDescription | String | nullable; user-reviewed/edited description | — |
| status | String | required; enum: `pending`, `ai_suggested`, `user_confirmed` | — |

`inferredType`: `string` → free text · `number` → integer or float · `date` → parseable date/datetime · `boolean` → true/false · `category` → low-cardinality, suitable for group-by
`status`: `pending` → not yet processed · `ai_suggested` → AI generated, awaiting review · `user_confirmed` → user reviewed and confirmed/edited

**Indexes:** `{ fileId: 1 }` · `{ fileId: 1, columnIndex: 1 }` compound · `{ fileId: 1, status: 1 }` compound (check all confirmed)
**Relations:** belongs-to CsvFile (via fileId)

---

## 5. dashboards
Collection: `ws_{workspaceSlug}_dashboards`.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| projectId | ObjectId | required | → Project |
| ownerId | ObjectId | required | → User |
| name | String | required; unique within same projectId | — |
| nameAr | String | optional, default: `''`; Arabic display name | — |
| purposeDescription | String | required; used as AI generation prompt context | — |
| purposeDescriptionAr | String | optional, default: `''`; Arabic purpose/summary | — |
| status | String | required; enum: `generating`, `ready`, `error` | — |
| generationJobId | ObjectId | nullable; the AI generation job | → BackgroundJob |
| generationError | String | nullable; error message if status = `error` | — |
| layoutColumns | Number | required, default: 12; grid column count set by AI generation | — |
| lastRefreshedAt | Date | nullable; last manual data refresh timestamp | — |
| aiModel | String | nullable; AI model name used for generation (audit/debug) | — |
| generatedAt | Date | nullable; when AI generation completed | — |

`status`: `generating` → AI job running · `ready` → available to view · `error` → generation failed, user can retry
**Business Rules:** `name` unique per `projectId` · duplicating appends "-copy" · cascade delete removes all chartwidgets, dashboarddatasources, chartdatacache, and sharelinks

**Indexes:** `{ projectId: 1, name: 1 }` unique compound · `{ ownerId: 1 }` · `{ status: 1 }` · `{ projectId: 1, status: 1 }` compound · text index on `name`
**Relations:** belongs-to Project (via projectId) · belongs-to User (via ownerId) · has-many ChartWidgets, DashboardDataSources, ShareLinks

---

## 6. chartwidgets
Collection: `ws_{workspaceSlug}_chartwidgets`. One doc per widget in a dashboard.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| dashboardId | ObjectId | required | → Dashboard |
| dataSourceFileId | ObjectId | **deprecated** — kept for backward compat with legacy CSV widgets; prefer `datasetId` | → CsvFile |
| widgetType | String | required; open string, must match a `widgetdefinitions` catalog entry (NOT a fixed Mongoose enum) | — |
| title | String | required; widget display title (English) | — |
| titleAr | String | optional, default: `''`; Arabic widget title | — |
| position.x | Number | required; column start position in grid | — |
| position.y | Number | required; row start position in grid | — |
| position.w | Number | required; width in grid columns | — |
| position.h | Number | required; height in grid rows | — |
| queryDefinition.xAxis | String | nullable; column name for x-axis or label | — |
| queryDefinition.yAxis | String | nullable; column name for y-axis or value | — |
| queryDefinition.groupBy | String | nullable; column name for grouping | — |
| queryDefinition.aggregation | String | required; enum: `sum`, `count`, `avg`, `min`, `max` | — |
| queryDefinition.filters | [Object] | nullable; array of `{ column: String, operator: String, value: Mixed }` | — |
| queryDefinition.sortBy | String | nullable; column name to sort by | — |
| queryDefinition.sortOrder | String | required; enum: `asc`, `desc`; default: `desc` | — |
| querySpec | Object | nullable, default: null; dialect-neutral `QuerySpec` for OLAP widgets (source, aggregations, filters, groupBy, orderBy, limit, dateRange); when present takes precedence over `queryDefinition` *(change-020)* | — |
| displayConfig.colors | [String] | nullable; hex color overrides | — |
| displayConfig.showLegend | Boolean | required, default: true | — |
| displayConfig.xAxisLabel | String | nullable; override x-axis label | — |
| displayConfig.yAxisLabel | String | nullable; override y-axis label | — |

`widgetType` catalog-seeded values: `bar` · `line` · `pie` · `donut` · `kpi_card` · `table` · `scatter`. A legacy `WidgetType` TypeScript enum exists for backward-compatible references but is NOT applied to the schema.
Subdocuments `position`, `queryDefinition`, `displayConfig` are embedded — always read/written together as a unit.

**Indexes:** `{ dashboardId: 1 }` (load all widgets for a dashboard) · `{ dashboardId: 1, dataSourceFileId: 1 }` compound
**Relations:** belongs-to Dashboard (via dashboardId) · references CsvFile as data source (via dataSourceFileId, legacy)

---

## 7. dashboarddatasources
Collection: `ws_{workspaceSlug}_dashboarddatasources`. Junction linking dashboards to Datasets (and legacy CSV files).

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| dashboardId | ObjectId | required | → Dashboard |
| datasetId | ObjectId | required; references a `Dataset` (or legacy `CsvFile` for backward compat) *(renamed from `fileId` in change-015)* | → Dataset |
| isPrimary | Boolean | required; true for the first/main data source | — |
| addedAt | Date | required; when this data source was linked | — |

**Indexes:** `{ dashboardId: 1, datasetId: 1 }` unique compound · `{ dashboardId: 1 }` · `{ datasetId: 1 }`
**Relations:** belongs-to Dashboard (via dashboardId) · references Dataset (via datasetId)

---

## 8. chartdatacache
Collection: `ws_{workspaceSlug}_chartdatacache`. Persistent cache for pre-calculated chart data; fallback when Redis is cold. Invalidated on manual data refresh.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| widgetId | ObjectId | required | → ChartWidget |
| dashboardId | ObjectId | required; used for bulk invalidation on refresh | → Dashboard |
| queryHash | String | required; SHA-256 hash of widget's query definition for cache key matching | — |
| cachedResult | Mixed | required; JSON result in chart-ready format | — |
| calculatedAt | Date | required; when computed | — |
| expiresAt | Date | required; TTL: 1 hour from calculation | — |
| status | String | required; enum: `valid`, `stale` | — |

**Indexes:** `{ widgetId: 1, queryHash: 1 }` unique compound · `{ dashboardId: 1 }` (bulk invalidation) · `{ expiresAt: 1 }` (TTL cleanup) · `{ status: 1 }`
**Relations:** belongs-to ChartWidget (via widgetId) · belongs-to Dashboard (via dashboardId, for bulk invalidation)

---

## 9. sharelinks
Secure shareable links for dashboards with token hash, permission level, and access metadata.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| dashboardId | ObjectId | required | → Dashboard |
| createdBy | ObjectId | required; the owner who created the link | → User |
| tokenHash | String | required, unique; SHA-256 of raw share token (raw returned once at creation, not recoverable) | — |
| permission | String | required; enum: `view`, `edit` | — |
| viewerCanRefresh | Boolean | required, default: false; whether link holder can trigger data refresh | — |
| accessCount | Number | required, default: 0; incremented on each valid access | — |
| lastAccessedAt | Date | nullable; last valid access timestamp | — |
| expiresAt | Date | nullable; null = no expiry | — |
| status | String | required; enum: `active`, `revoked`, `expired` | — |

`permission`: `view` → view dashboard/chart data only, cannot edit/delete/customize · `edit` → view and customize widgets/layout

**Indexes:** `{ tokenHash: 1 }` unique · `{ dashboardId: 1 }` · `{ status: 1 }` · `{ dashboardId: 1, status: 1 }` compound (active links per dashboard) · `{ expiresAt: 1 }` (expiry cleanup)
**Relations:** belongs-to Dashboard (via dashboardId) · created-by User (via createdBy)

---

## 10. backgroundjobs
Tracks all async background jobs: CSV analysis, dashboard generation, PDF export, cache recalculation.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| type | String | required; enum: `csv_analysis`, `dashboard_generation`, `pdf_export`, `cache_recalculation` | — |
| ownerId | ObjectId | required; user who triggered the job | → User |
| entityType | String | required; enum: `csvfile`, `dashboard` | — |
| entityId | ObjectId | required; ID of the entity being processed | — |
| status | String | required; enum: `queued`, `processing`, `completed`, `failed` | — |
| progress | Number | required, default: 0; 0–100 percentage | — |
| queuedAt | Date | required; when added to the queue | — |
| startedAt | Date | nullable; when worker started processing | — |
| completedAt | Date | nullable; when finished (success or failure) | — |
| resultSummary | String | nullable; brief human-readable outcome on success | — |
| errorMessage | String | nullable; error details on failure | — |
| retryCount | Number | required, default: 0; attempts so far | — |
| maxRetries | Number | required, default: 3; max attempts before final failure | — |

`status`: `queued` → waiting in BullMQ · `processing` → worker active · `completed` → success · `failed` → exhausted retries or fatal error
**BullMQ queues** (not all tracked as backgroundjobs records): `csv-analysis` · `dashboard-generation` · `pdf-export` · `cache-recalculation` · `subscription-activation` (durable event that activates subscription after confirmed PayUp payment)
**Default maxRetries:** csv\_analysis = 3 · dashboard\_generation = 3 · pdf\_export = 2

**Indexes:** `{ entityType: 1, entityId: 1 }` compound · `{ ownerId: 1 }` · `{ status: 1 }` · `{ type: 1 }` · `{ ownerId: 1, status: 1, type: 1 }` compound
**Relations:** belongs-to User (via ownerId) · references one entity (CsvFile or Dashboard via entityType + entityId)

---

## 11. notifications

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| userId | ObjectId | required; notification recipient | → User |
| type | String | required; enum: `dashboard_ready`, `generation_error`, `csv_analysis_complete`, `export_ready`, `dashboard_shared` | — |
| title | String | required; short notification title (English) | — |
| titleAr | String | optional, default: `''`; Arabic title | — |
| message | String | required; full notification message body (English) | — |
| messageAr | String | optional, default: `''`; Arabic message body | — |
| relatedEntityType | String | nullable; enum: `dashboard`, `csvfile`, `project` | — |
| relatedEntityId | ObjectId | nullable; ID of related entity for navigation | — |
| isRead | Boolean | required, default: false | — |
| emailSent | Boolean | required, default: false; whether corresponding email was sent | — |

**Indexes:** `{ userId: 1, isRead: 1 }` compound (unread count) · `{ userId: 1, createdAt: -1 }` compound (newest first) · `{ type: 1 }`
**Relations:** belongs-to User (via userId)

---

## 12. auditlogs
Immutable record of user actions and system events for GDPR compliance and security auditing. **No `createdAt`/`updatedAt`** — uses explicit `timestamp` for immutability.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| userId | ObjectId | nullable; null for system events or GDPR-deleted users (redact user ref, keep event) | → User |
| action | String | required; see action enum below | — |
| entityType | String | required; enum: `user`, `project`, `dashboard`, `csvfile`, `sharelink`, `subscription`, `settings` | — |
| entityId | ObjectId | nullable; ID of the affected entity | — |
| oldValues | Mixed | nullable; snapshot before change | — |
| newValues | Mixed | nullable; snapshot after change | — |
| ipAddress | String | nullable; request IP address | — |
| userAgent | String | nullable; browser/client user agent string | — |
| details | String | nullable; additional context string | — |
| timestamp | Date | required; event timestamp (not Mongoose createdAt — explicit for immutability) | — |

`action` enum: `user.register` · `user.login` · `user.logout` · `user.login_failed` · `user.update` · `user.delete` · `user.deactivate` · `user.activate` · `project.create` · `project.update` · `project.delete` · `dashboard.create` · `dashboard.update` · `dashboard.delete` · `dashboard.duplicate` · `dashboard.refresh` · `csvfile.upload` · `csvfile.delete` · `sharelink.create` · `sharelink.revoke` · `export.pdf` · `export.excel` · `export.csv` · `subscription.assign` · `subscription.upgrade` · `subscription.cancel` · `settings.update`
**Validation:** no update or delete endpoints — admin read-only only. On GDPR user deletion: set `userId` to null, do not delete the log record.

**Indexes:** `{ userId: 1 }` · `{ action: 1 }` · `{ entityType: 1 }` · `{ entityType: 1, entityId: 1 }` compound · `{ timestamp: -1 }` (most recent first) · `{ userId: 1, timestamp: -1 }` compound (user activity history)
**Relations:** optionally references User (via userId; null when user deleted)

---

## 13. subscriptionplans
Admin-managed subscription plan catalog. Not a fixed enum — plans are documents in this collection.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| name | String | required, unique (e.g. `Free`, `Pro`) | — |
| nameAr | String | optional, default: `''`; Arabic plan name | — |
| description | String | nullable, default: `''` | — |
| descriptionAr | String | optional, default: `''`; Arabic description | — |
| priceMonthlyUsd | Number | required; min 0 | — |
| maxDashboards | Number | required; min 0 | — |
| maxDataUploadsPerMonth | Number | required; min 0 | — |
| maxDataUpdatesPerMonth | Number | required; min 0 | — |
| isActive | Boolean | required, default: true; inactive plans hidden from assignment | — |
| freeUsers | Number | required, default: 5; users included free in plan | — |
| pricePerExtraUserMonthlyUsd | Number | required, default: 10; USD/month per extra user beyond limit | — |

**Indexes:** `{ name: 1 }` unique · `{ isActive: 1 }`
**Relations:** referenced-by many UserSubscriptions (via planId) · referenced-by many Payments (via planId)

---

## 14. usersubscriptions
One subscription record per workspace. Tracks current period and monthly usage counters for limit enforcement.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| workspaceId | ObjectId | required, unique; one subscription per workspace | → Workspace |
| planId | ObjectId | required | → SubscriptionPlan |
| status | String | required; enum: `active`, `inactive`, `expired`, `cancelled`; default: `active` | — |
| startDate | Date | required; subscription start date | — |
| endDate | Date | nullable; null for subscriptions without an end date | — |
| uploadsUsedThisMonth | Number | required, default: 0; running upload count for current period | — |
| updatesUsedThisMonth | Number | required, default: 0; running data-update count for current period | — |
| currentPeriodStart | Date | nullable; start of current billing/usage period | — |
| currentPeriodEnd | Date | nullable; end of current billing/usage period; used to reset counters | — |
| notes | String | nullable, default: `''`; free-text admin notes | — |

`status`: `active` → valid, limits enforced · `inactive` → admin-deactivated, resource lock (no create/upload/update) · `expired` → past end date without renewal, same resource lock · `cancelled` → manually cancelled

**Indexes:** `{ userId: 1 }` unique (one subscription per user) · `{ planId: 1 }` · `{ status: 1 }` · `{ currentPeriodEnd: 1 }` (period rollover / counter reset)
**Relations:** belongs-to Workspace (via workspaceId) · references SubscriptionPlan (via planId) · referenced-by many Payments (via subscriptionId)

---

## 15. payments
Payment log: admin manual ledger AND gateway payment log (PayUp hosted-checkout flow, change-003).

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| userId | ObjectId | required | → User |
| workspaceId | ObjectId | nullable, default: null; workspace billing context (nullable for legacy records) | → Workspace |
| subscriptionId | ObjectId | nullable, default: null | → UserSubscription |
| planId | ObjectId | nullable, default: null | → SubscriptionPlan |
| amountUsd | Number | required; min 0 | — |
| currency | String | required, default: `USD` | — |
| status | String | required; enum: `paid`, `pending`, `refunded`, `failed`; default: `pending` | — |
| method | String | nullable, default: `''`; payment method label | — |
| reference | String | nullable, default: `''`; external reference/receipt (PayUp session id when settled) | — |
| paidAt | Date | nullable, default: null; settlement timestamp | — |
| notes | String | nullable, default: `''`; free-text admin notes | — |
| gateway | String | nullable, default: `manual`; `manual` (admin ledger) or `payup` *(change-003)* | — |
| providerSessionId | String | nullable, default: `''`; PayUp checkout session id *(change-003)* | — |
| providerSessionToken | String | nullable, default: `''`; PayUp session token for status verification *(change-003)* | — |
| confirmUrl | String | nullable, default: `''`; public return URL sent to PayUp on success *(change-003)* | — |
| cancelUrl | String | nullable, default: `''`; public return URL sent to PayUp on cancel *(change-003)* | — |
| redirectUrl | String | nullable, default: `''`; hosted-checkout URL returned by PayUp *(change-003)* | — |
| action | String | nullable; enum: `subscribe`, `upgrade`, `downgrade`, `admin_assign`, `add_user` | — |
| previousPlanId | ObjectId | nullable, default: null | → SubscriptionPlan |
| settledByAdminId | ObjectId | nullable, default: null; admin who manually settled | → User |
| invitationId | ObjectId | nullable, default: null; for extra-user invoices | → WorkspaceInvitation |

`status`: `paid` → received · `pending` → awaiting settlement · `refunded` → refunded · `failed` → failed

**Indexes:** `{ userId: 1, createdAt: -1 }` compound (payment history, newest first) · `{ status: 1, createdAt: -1 }` compound (admin ledger filtering) · `{ providerSessionToken: 1 }` sparse (gateway return lookup) *(change-003)* · `{ workspaceId: 1 }` (workspace invoice lookup)
**Relations:** belongs-to User (via userId) · optionally references Workspace, UserSubscription, SubscriptionPlan, WorkspaceInvitation

---

## 16. systemsettings
Singleton global configuration — one document keyed by `key: 'global'`.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| key | String | required, unique, default: `global`; singleton document | — |
| registrationEnabled | Boolean | required, default: true; whether public registration is allowed | — |
| maxFileSizeMb | Number | required, default: 50; max upload size in MB | — |
| defaultMaxDashboards | Number | required, default: 5; dashboard limit for new users | — |
| supportedLanguages | [String] | required, default: `['en', 'ar']`; supported UI languages | — |

**Indexes:** `{ key: 1 }` unique (enforces singleton)

---

## 17. widgetdefinitions
AI widget catalog. Seeded at startup; AI dashboard generator picks `widgetType`s from here. `chartwidgets.widgetType` must match an entry.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| widgetType | String | required, unique; catalog identifier (e.g. `bar`, `line`, `kpi_card`) | — |
| displayName | String | required; human-readable widget name (English) | — |
| displayNameAr | String | optional, default: `''`; Arabic display name | — |
| description | String | required; when the AI should choose this widget (English) | — |
| descriptionAr | String | optional, default: `''`; Arabic description | — |
| category | String | required, default: `chart`; grouping category | — |
| requiredStructure | Object | nullable, default: `{}`; describes queryDefinition/displayConfig shape AI must provide | — |
| example | Object | nullable, default: `{}`; complete example widget JSON (sample query + output rows) | — |
| selectionHints | String | nullable, default: `''`; free-text hints for widget selection | — |
| defaultSize | Object | required, default: `{ w: 4, h: 2 }`; default grid size | — |
| isActive | Boolean | required, default: true; inactive excluded from AI selection | — |

**Indexes:** `{ widgetType: 1 }` unique · `{ isActive: 1 }`
**Relations:** standalone catalog — referenced by `chartwidgets.widgetType` by value (not ObjectId)

---

## 18. ailogs
One record per AI provider call. Powers admin AI cost reporting.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| jobId | ObjectId | nullable, default: null | → BackgroundJob |
| provider | String | required; AI provider name (e.g. `anthropic`, `openai`) | — |
| model | String | required; model identifier used for the call | — |
| method | String | required; logical method/operation that triggered the call | — |
| requestPayload | Object | nullable, default: null; raw request payload sent to provider | — |
| promptText | String | nullable, default: null; prompt text sent | — |
| rawResponseText | String | nullable, default: null; raw provider response text | — |
| parsedResponse | Object | nullable, default: null; parsed/structured response | — |
| inputTokens | Number | required, default: 0 | — |
| outputTokens | Number | required, default: 0 | — |
| costUsd | Number | required, default: 0; computed from `aimodels` pricing at write time | — |
| durationMs | Number | required, default: 0; call duration in milliseconds | — |
| status | String | required; enum: `pending`, `success`, `failed` | — |
| errorMessage | String | nullable, default: null; error details on failure | — |

`status`: `pending` → call in progress · `success` → completed · `failed` → failed (see errorMessage)

**Indexes:** `{ jobId: 1 }` · `{ provider: 1, model: 1 }` compound · `{ createdAt: -1 }` (recent calls / cost reporting)
**Relations:** optionally references BackgroundJob (via jobId) · `costUsd` computed using `aimodels` pricing at write time

---

## 19. aimodels
AI model pricing table. Seeded at startup; used to compute `ailogs.costUsd` from token counts.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| provider | String | required; AI provider name | — |
| modelId | String | required; model identifier (matches `ailogs.model`) | — |
| displayName | String | required; human-readable model name | — |
| inputPricePerMToken | Number | required, default: 0; USD per 1M input tokens | — |
| outputPricePerMToken | Number | required, default: 0; USD per 1M output tokens | — |
| isActive | Boolean | required, default: true | — |

**Indexes:** `{ provider: 1, modelId: 1 }` unique compound · `{ isActive: 1 }`
**Relations:** standalone pricing table — looked up by `{ provider, modelId }` when computing `ailogs.costUsd`

---

## 20. workspaces

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| slug | String | required, unique; URL-safe pattern: `{word}-{word}-{4digits}` | — |
| name | String | required; human display name | — |
| ownerId | ObjectId | required; user who created the workspace | → User |
| status | String | required; enum: `active`, `suspended`, `deleted`; default: `active` | — |
| olapEngine | String | optional; enum: `clickhouse \| bigquery`; default: `clickhouse`; overrides which OLAP engine is used for all analytics tables in this workspace *(change-015)* | — |

**Indexes:** `{ slug: 1 }` unique · `{ ownerId: 1 }` · `{ status: 1 }`
**Relations:** belongs-to User (via ownerId) · has-many WorkspaceMemberships, WorkspaceInvitations · has-one WorkspaceBranding

---

## 21. workspace_memberships
Maps users to workspaces with a role.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| workspaceId | ObjectId | required | → Workspace |
| userId | ObjectId | required | → User |
| role | String | required; enum: `workspace-owner`, `workspace-admin`, `workspace-member` | — |
| joinedAt | Date | required, default: Date.now; when member joined | — |

**Indexes:** `{ workspaceId: 1, userId: 1 }` unique compound · `{ userId: 1 }`
**Relations:** links Workspace and User (via workspaceId + userId)

---

## 22. workspace_invitations

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| workspaceId | ObjectId | required | → Workspace |
| invitedByUserId | ObjectId | required | → User |
| email | String | required, lowercase; email address invited | — |
| role | String | required; enum: `workspace-owner`, `workspace-admin`, `workspace-member` | — |
| token | String | required, unique, indexed; secure token for accept lookup | — |
| status | String | required; enum: `pending`, `pending-payment`, `accepted`, `revoked`, `expired`; default: `pending` | — |
| expiresAt | Date | required; expiration (usually 7 days after creation) | — |
| acceptedAt | Date | nullable, default: null; when accepted | — |

**Indexes:** `{ token: 1 }` unique · `{ workspaceId: 1, email: 1 }` unique compound · `{ expiresAt: 1 }` (can be used for TTL)
**Relations:** belongs-to Workspace (via workspaceId) · invited-by User (via invitedByUserId)

---

## 23. workspace_brandings
Custom branding configuration per workspace.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| workspaceId | ObjectId | required, unique | → Workspace |
| logoUrl | String | nullable, default: null; Cloudflare R2 storage URL | — |
| logoStorageKey | String | nullable, default: null; R2 storage key for deletion | — |
| colorTemplateId | ObjectId | nullable, default: null | → ColorTemplate |

**Indexes:** `{ workspaceId: 1 }` unique
**Relations:** belongs-to Workspace (via workspaceId) · optionally references ColorTemplate (via colorTemplateId)

---

## 24. onboarding_progress
Tracks onboarding step completion for a workspace owner.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| workspaceId | ObjectId | required, unique | → Workspace |
| userId | ObjectId | required, unique; owner who created the workspace | → User |
| workspaceCreated | Boolean | required, default: false; step 1 complete | — |
| brandingDone | Boolean | required, default: false; step 2 done or skipped | — |
| invitesDone | Boolean | required, default: false; step 3 done or skipped | — |
| experimentDone | Boolean | required, default: false; step 4 done or skipped | — |
| completedAt | Date | nullable, default: null; when wizard fully dismissed | — |

**Indexes:** `{ workspaceId: 1 }` unique · `{ userId: 1 }` unique
**Relations:** belongs-to Workspace (via workspaceId) · belongs-to User (via userId)

---

## 25. color_templates
System-predefined color templates managed by admins.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| name | String | required; display name (e.g. "Ocean Blue") | — |
| primary | String | required; hex color code (e.g. `#1a73e8`) | — |
| secondary | String | required; hex color code | — |
| accent | String | required; hex color code | — |
| chartColors | [String] | required; array of 5 hex colors for chart series | — |
| isActive | Boolean | required, default: true; hidden from selection if false | — |

**Indexes:** `{ isActive: 1 }`

---

## csvdata_{fileId} (Dynamic)
One collection per uploaded CSV file. `{fileId}` is the 24-char hex string of `csvfiles._id`. **No `createdAt`/`updatedAt`.**

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| _rowIndex | Number | required; original row position in CSV (0-based) for ordering | — |
| ...columnFields | Mixed | dynamic; one field per CSV column, names match exact CSV headers | — |

**Design:** created via `mongoose.connection.createCollection()` at upload · dropped via `dropCollection()` on file deletion · accessed via `mongoose.connection.collection(name)` — no Mongoose model registered · MongoDB aggregation pipelines run directly for chart data
**Indexes:** `{ _rowIndex: 1 }` (ordered exports) · additional dynamic indexes per aggregated column based on `columnmetadata.inferredType`

---

## Validation Rules
1. `users.email` must be unique and lowercase
2. `users.passwordHash` must never be returned in any API response
3. `csvfiles.fileSizeBytes` must not exceed 52,428,800 (50 MB)
4. `dashboards.name` must be unique within the same `projectId`
5. `columnmetadata.status` must be `user_confirmed` for ALL columns in a linked CSV before dashboard generation can start
6. `chartwidgets.queryDefinition` must be validated against the AI-returned schema before persisting
7. `sharelinks.tokenHash` must be stored as SHA-256 hash — never store or return raw token after creation
8. `auditlogs` records must never have an update or delete endpoint
9. `usersubscriptions` usage counters must be reset at each `currentPeriodEnd` rollover and checked against `subscriptionplans` limits before uploads/updates
10. `backgroundjobs.status` must always be updated to `failed` with `errorMessage` on failure — no silent failures
11. `chartdatacache` entries must be invalidated (deleted or set `stale`) before a refresh response is returned
12. `csvdata_{fileId}` collections must be dropped entirely when the parent `csvfile` record is deleted
13. `dataconnections.credentialsEncrypted` must always be AES-256-GCM encrypted before persisting; decryption only inside connector-facing service methods — never exposed in API responses *(change-015)*
14. `datasets.analyticsTable` must follow the pattern `ds_{workspaceSlug}_{datasetId}` — never allow caller-supplied table names *(change-015)*
15. `filtervaluemeta` rows must be refreshed (not created anew) after every successful sync run *(change-021)*
16. `chartwidgets.querySpec` takes precedence over `queryDefinition` in the chart data API; both may coexist on the same document *(change-020)*
17. `dashboards` may only be created from datasets where `analyticsTable != null && syncStatus != syncing`; legacy CsvFile path requires `status == confirmed` *(change-022)*
18. `datasets.aiProposedMapping` and `aiProposedSemanticFlag` are display-only fields — they are replaced by `columnMapping` and `semanticFlag` upon user confirmation and never used in query execution *(change-022)*

## Mongoose Enum Reference
```
UserRole = [admin, editor, viewer]
OAuthProvider = [google, microsoft]
LanguagePreference = [en, ar]
CsvFileStatus = [uploading, analyzing, confirmed, error]
ColumnInferredType = [string, number, date, boolean, category]
ColumnMetadataStatus = [pending, ai_suggested, user_confirmed]
DashboardStatus = [generating, ready, error]
WidgetType = [bar, line, pie, donut, kpi_card, table, scatter]  // legacy TS enum only — NOT enforced on chartwidgets schema
AggregationType = [sum, count, avg, min, max]
SortOrder = [asc, desc]
CacheStatus = [valid, stale]
SharePermission = [view, edit]
ShareLinkStatus = [active, revoked, expired]
BackgroundJobType = [csv_analysis, dashboard_generation, pdf_export, cache_recalculation, subscription_period_rollover]
BackgroundJobStatus = [queued, processing, completed, failed]
BackgroundJobEntityType = [csvfile, dashboard]
NotificationType = [dashboard_ready, generation_error, csv_analysis_complete, export_ready, dashboard_shared]
AuditAction = [user.register, user.login, user.logout, user.login_failed, user.update, user.delete, user.deactivate, user.activate, user.auto_suspend, project.create, project.update, project.delete, dashboard.create, dashboard.update, dashboard.delete, dashboard.duplicate, dashboard.refresh, csvfile.upload, csvfile.delete, sharelink.create, sharelink.revoke, export.pdf, export.excel, export.csv, subscription.assign, subscription.upgrade, subscription.cancel, subscription.activate, subscription.deactivate, settings.update]
SubscriptionStatus = [active, inactive, expired, cancelled]
PaymentStatus = [paid, pending, refunded, failed]
AiLogStatus = [pending, success, failed]
// Subscription plans are NOT a fixed enum — they are documents in the subscriptionplans collection.
```
## OlapBenchmarkRun
Purpose: persists results of a single admin-triggered benchmark run comparing ClickHouse vs BigQuery on sample data.
Collection: `olap_benchmark_runs` (global — admin use only, not workspace-scoped)

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `triggeredBy` | ObjectId | required | → `users._id` |
| `status` | Enum | required | `pending \| running \| done \| failed` |
| `sampleRowCount` | Number | required | — |
| `workloadDescription` | String | optional | — |
| `clickhouse.p50Ms` | Number | nullable | — |
| `clickhouse.p95Ms` | Number | nullable | — |
| `clickhouse.rowsScanned` | Number | nullable | — |
| `clickhouse.estimatedCostUsd` | Number | nullable | — |
| `clickhouse.error` | String | nullable | — |
| `bigquery.p50Ms` | Number | nullable | — |
| `bigquery.p95Ms` | Number | nullable | — |
| `bigquery.rowsScanned` | Number | nullable | — |
| `bigquery.estimatedCostUsd` | Number | nullable | — |
| `bigquery.error` | String | nullable | — |
| `recommendation` | Enum | nullable | `clickhouse \| bigquery \| inconclusive` |
| `recommendationReason` | String | nullable | — |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

Relations: one admin triggers many benchmark runs
Indexes: index `status`; index `createdAt` desc; index `triggeredBy`

---

## DataConnection *(change-015)*
Purpose: stores named connection credentials for an external data source. Credentials are encrypted.
Collection: `ws_{workspaceSlug}_dataconnections`

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `workspaceSlug` | String | required; workspace scope | — |
| `name` | String | required; human-readable connection name | — |
| `sourceType` | Enum | required | `csv \| google_sheets \| shopify \| salla \| zid \| sql_server \| mongodb_atlas` |
| `credentialsEncrypted` | String | required; AES-256-GCM encrypted JSON blob of credentials | — |
| `status` | Enum | required; default: `active` | `active \| disabled` |
| `lastTestedAt` | Date | nullable; when connection was last tested | — |
| `lastTestResult` | String | nullable; `ok \| error: <message>` | — |
| `createdBy` | ObjectId | required | → `users._id` |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

**Indexes:** `{ workspaceSlug: 1, sourceType: 1 }` · `{ workspaceSlug: 1, name: 1 }` unique

---

## WebhookRoute *(change-043)*
Purpose: global index mapping an external store/merchant identifier to the Dynamo workspace that owns it. Used by webhook handlers to resolve `workspaceSlug` without iterating all workspaces.
Collection: `webhook_routes` *(NOT workspace-scoped — intentionally global)*

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `sourceType` | String | required; enum: `shopify \| salla \| zid` | — |
| `externalStoreId` | String | required; provider-assigned store/merchant ID | — |
| `workspaceSlug` | String | required | → Workspace |
| `connectionId` | ObjectId | required | → `DataConnection._id` |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

**Indexes:** `{ sourceType: 1, externalStoreId: 1 }` unique (upsert key)

---

## Dataset *(change-015, updated change-022)*
Purpose: describes a named view of data from a connection — what to extract, how to label it, and its semantic meaning.
Collection: `ws_{workspaceSlug}_datasets`

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `workspaceSlug` | String | required | — |
| `connectionId` | ObjectId | required | → `DataConnection._id` |
| `sourceType` | Enum | required | `csv \| google_sheets \| …` |
| `name` | String | required; human-readable dataset name | — |
| `description` | String | optional | — |
| `semanticFlag` | Enum | required, default: `arbitrary` | `arbitrary \| orders \| products \| customers \| inventory \| marketing` |
| `columnMapping` | Object | optional; `{ canonicalField: sourceColumn }` map; schema-on-read, never rewrites data; user-confirmed | — |
| `aiProposedMapping` | Object | nullable; AI-suggested `columnMapping` from `column-mapping` prompt; shown in UI for user review; replaced by `columnMapping` on confirm *(change-022)* | — |
| `aiProposedSemanticFlag` | String | nullable; AI-suggested `semanticFlag`; shown in UI for review *(change-022)* | — |
| `schema` | [Object] | optional; discovered columns `{ name, type, sample?, nullable?, description?, descriptionAr?, userDescription?, isPrimaryKey? }`; written by `discoverSchema()` + updated by `identify-columns` pipeline step; `isPrimaryKey` marks the unique row identifier *(change-038)* | — |
| `extractOptions` | Object | optional; connector-specific extraction config (e.g. sheet name, SQL query, table name) | — |
| `analyticsTable` | String | nullable; OLAP table name — set after first successful sync as `ds_{workspaceSlug}_{_id}` | — |
| `syncStatus` | Enum | required, default: `idle` | `idle \| syncing \| error` |
| `syncPolicy` | Enum | required, default: `manual` | `manual \| hourly \| daily \| webhook` |
| `lastSyncAt` | Date | nullable | — |
| `rowCount` | Number | default: 0; count after last successful sync | — |
| `lastSyncErrorMessage` | String | nullable | — |
| `createdBy` | ObjectId | required | → `users._id` |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

**Indexes:** `{ connectionId: 1 }` · `{ semanticFlag: 1 }` · `{ syncStatus: 1 }` · `{ createdBy: 1, createdAt: -1 }`
**Relations:** belongs-to DataConnection · has-many SyncRuns · referenced-by DashboardDatasource · referenced-by FilterValueMeta
**Rules:** `analyticsTable` set by `DataSyncProcessor` after first successful sync; `null` = data not yet loaded; dashboards require `analyticsTable != null` before generation

---

## SyncRun *(change-015)*
Purpose: history record for each data sync execution.
Collection: `ws_{workspaceSlug}_syncruns`

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `workspaceSlug` | String | required | — |
| `datasetId` | ObjectId | required | → `Dataset._id` |
| `mode` | Enum | required | `full \| incremental` |
| `status` | Enum | required, default: `running` | `running \| success \| failed` |
| `progress` | Number | required, default: 0; 0–100 completion percentage, updated live by pipeline steps *(change-045)* | — |
| `phase` | Enum | required, default: `queued`; current stage for the progress loader *(change-045)* | `queued \| listing \| discovering \| extracting \| loading \| finalizing \| done \| failed` |
| `rowsIn` | Number | nullable; total rows extracted from source; updated as batches accrue *(change-045)* | — |
| `rowsLoaded` | Number | nullable; rows successfully inserted into OLAP; updated as batches accrue *(change-045)* | — |
| `errorMessage` | String | nullable | — |
| `startedAt` | Date | required, default: now | — |
| `finishedAt` | Date | nullable | — |
| `triggeredBy` | Enum | required | `manual \| schedule \| api` |
| `createdAt` | Date | auto | — |

**Indexes:** `{ workspaceSlug: 1, datasetId: 1, startedAt: -1 }` · `{ status: 1 }`
**Relations:** belongs-to Dataset
**Rules:** `progress`/`phase` are advisory UI signals updated by pipeline steps; a run is authoritative-complete only when `status = success \| failed` *(change-045)*

---

## FilterValueMeta *(change-021)*
Purpose: stores AI-selected filter column metadata + precomputed distinct values per dataset. Drives the dashboard filter panel without a live OLAP query on page open.
Collection: `ws_{workspaceSlug}_filtervaluemeta`

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `workspaceSlug` | String | required | — |
| `datasetId` | String | required; string representation of Dataset `_id` | — |
| `column` | String | required; exact column name in the OLAP table | — |
| `label` | String | required; human-readable label for the filter UI | — |
| `filterType` | Enum | required | `select \| date_range \| range \| search` |
| `mode` | Enum | required | `list \| search`; `list` = low-cardinality (≤1000 distinct), values stored here; `search` = high-cardinality, typeahead only |
| `distinctCount` | Number | required; total distinct value count at last compute | — |
| `values` | [Object] | nullable; populated only when `mode = list`; each `{ value: Mixed, count: Number }` | — |
| `lastComputedAt` | Date | required; timestamp of last compute | — |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

**Indexes:** `{ workspaceSlug: 1, datasetId: 1, column: 1 }` unique · `{ workspaceSlug: 1, datasetId: 1 }`

---

## PipelineRun *(change-019)*
Purpose: execution audit trail for every pipeline invocation.
Collection: `pipeline_runs` (global — not workspace-scoped)

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `pipelineType` | String | required; e.g. `ingest`, `dashboard-generate`, `add-widget`, `edit-widget` | — |
| `status` | Enum | required | `running \| success \| failed` |
| `datasetId` | String | nullable | — |
| `workspaceSlug` | String | nullable | — |
| `steps` | [Object] | required; array of `{ type, status, startedAt, finishedAt, error? }` | — |
| `errorMessage` | String | nullable; first fatal error | — |
| `startedAt` | Date | required, default: now | — |
| `finishedAt` | Date | nullable | — |
| `createdAt` | Date | auto | — |

**Indexes:** `{ pipelineType: 1, status: 1 }` · `{ workspaceSlug: 1, datasetId: 1 }` · `{ startedAt: -1 }`

---

// New enums (change-014)
OlapEngineId = [clickhouse, bigquery]
OlapBenchmarkStatus = [pending, running, done, failed]
OlapBenchmarkRecommendation = [clickhouse, bigquery, inconclusive]

// New enums (change-015)
DataSourceType = [csv, google_sheets, shopify, salla, zid, sql_server, mongodb_atlas]
DataConnectionStatus = [active, disabled]
SemanticFlag = [arbitrary, orders, products, customers, inventory, marketing]
DatasetStatus = [pending, syncing, ready, error]
SyncRunMode = [full, incremental]
SyncRunStatus = [running, success, failed]
SyncRunTrigger = [manual, schedule, api]
SyncRunPhase = [queued, listing, discovering, extracting, loading, finalizing, done, failed]  // change-045

// New enums (change-045)
DataSourceEntityKind = [entity, sheet, table, collection]  // listEntities() entity classification
WizardStepKind = [connect, select-entities, schema-review, schedule]

// New enums (change-019)
PipelineRunStatus = [running, success, failed]

// New enums (change-021)
FilterType = [select, date_range, range, search]
FilterMode = [list, search]
