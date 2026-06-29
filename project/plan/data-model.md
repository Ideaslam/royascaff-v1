# MongoDB Data Model Reference

## Short Summary

This document defines the complete MongoDB and Mongoose data model for **Roya AI Dynamo**, an AI-powered SaaS dashboard generation platform. The model is derived from `project/description.md`, `project/plan/modules.md`, `project/plan/features.md`, and `project/rules.md`. It covers all required collections, their field definitions, relationships, indexes, and validation rules.

## Scope

The backend domains covered by this model:

- users and authentication
- projects (workspace-prefixed: `ws_{slug}_projects`)
- CSV file metadata and per-file data row collections
- column metadata (AI-analyzed and user-confirmed)
- dashboards and chart widget configurations
- dashboard data source links
- chart data cache (persistent layer)
- share links
- notifications
- audit logs
- background jobs
- subscription plans and user subscriptions
- payments (admin manual ledger)
- system settings
- AI widget catalog (widget definitions)
- AI usage logs and model pricing

## Modeling Principles

- Use MongoDB `ObjectId` for all primary keys and foreign references
- Store each CSV file's data rows in its own dedicated dynamic collection (named `csvdata_{fileId}`) to support flexible/heterogeneous schemas
- Pre-calculate and cache aggregated chart results in `chartdatacache` plus Redis; never recalculate on every viewer request
- AI never reads data rows; column metadata is the only AI input — store column names, types, descriptions, and samples separately from row data
- Snapshot widget query definitions and aggregation rules inside `chartwidgets` at generation time so later customization does not invalidate history
- Audit logs are immutable — never expose a delete or update endpoint for `auditlogs`
- Dashboard widget configurations are embedded as subdocuments in `chartwidgets` because they belong exclusively to one dashboard and must be read atomically on every viewer load
- Subscription limits are enforced at the service layer by reading the user's active subscription record before any dashboard or upload action

---

## Collection Overview

### Required Collections (Phase 1 — MVP)

- `users`
- `ws_{slug}_projects` (dynamic, per workspace — see change-006/013)
- `ws_{slug}_dashboards` (dynamic, per workspace)
- `ws_{slug}_csvfiles` (dynamic, per workspace)
- `ws_{slug}_columnmetadata` (dynamic, per workspace)
- `ws_{slug}_chartwidgets` (dynamic, per workspace)
- `ws_{slug}_dashboarddatasources` (dynamic, per workspace)
- `ws_{slug}_chartdatacache` (dynamic, per workspace)
- `backgroundjobs`
- `notifications`
- `auditlogs`
- `sharelinks`
- `systemsettings`
- `widgetdefinitions`
- `ailogs`
- `aimodels`

### Required Collections (Phase 2 — Engagement)

- `subscriptionplans`
- `usersubscriptions`
- `payments`

### Dynamic Collections (Created Per CSV Upload)

- `csvdata_{fileId}` — one collection per uploaded CSV file, created at upload time, dropped on file deletion

---

## 1. users

Stores user accounts with authentication credentials, role, profile, and language preference.

### Mongoose shape

```ts
{
  _id: ObjectId,
  name: String,
  email: String,
  passwordHash: String | null,
  oauthProvider: String | null,
  oauthProviderId: String | null,
  role: String,
  isActive: Boolean,
  avatarUrl: String | null,
  languagePreference: String,
  refreshTokenHash: String | null,
  lastLoginAt: Date | null,
  currentWorkspaceId: ObjectId | null,
  defaultWorkspaceId: ObjectId | null,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `name` | `String` | yes | Display name |
| `email` | `String` | yes | Unique, indexed, lowercase |
| `passwordHash` | `String` | no | Null when using OAuth only |
| `oauthProvider` | `String` | no | Enum: `google`, `microsoft` — null for email/password users |
| `oauthProviderId` | `String` | no | Provider's user ID for OAuth linking |
| `role` | `String` | yes | Enum: `admin`, `editor`, `viewer` |
| `isActive` | `Boolean` | yes | Default `true`; set to `false` to deactivate without deletion |
| `avatarUrl` | `String` | no | Cloudflare R2 URL or null |
| `languagePreference` | `String` | yes | Enum: `en`, `ar` — default `en` |
| `refreshTokenHash` | `String` | no | Hashed refresh token for revocation support |
| `lastLoginAt` | `Date` | no | Updated on each successful login |
| `currentWorkspaceId` | `ObjectId` | no | Active workspace ID for session scoping |
| `defaultWorkspaceId` | `ObjectId` | no | Set as default workspace for auto-routing on login |
| `createdAt` | `Date` | yes | Mongoose timestamps |
| `updatedAt` | `Date` | yes | Mongoose timestamps |

### Relations

- One `user` owns many `projects`
- One `user` owns many `csvfiles`
- One `user` owns many `dashboards`
- One `user` has one `usersubscription` (referencing a `subscriptionplan`)
- One `user` has many `payments`
- One `user` has many `notifications`

### Index Recommendations

- Unique index on `email`
- Index on `role`
- Index on `isActive`
- Index on `oauthProvider` + `oauthProviderId` (compound, for OAuth lookup)

---

## 2. projects

Organizational containers that group dashboards. Owned by one user; scoped to a workspace via dynamic collection `ws_{workspaceSlug}_projects` (change-013). No uniqueness constraint on name within a workspace.

### Collection name

`ws_{workspaceSlug}_projects` — resolved at runtime by `ProjectRepository.getModel(workspaceSlug)`.

### Mongoose shape

```ts
{
  _id: ObjectId,
  name: String,
  description: String | null,
  ownerId: ObjectId,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `name` | `String` | yes | No uniqueness constraint |
| `description` | `String` | no | Optional project description |
| `ownerId` | `ObjectId` | yes | Ref `users` |
| `isActive` | `Boolean` | yes | Default `true`; archived projects set to `false` |
| `createdAt` | `Date` | yes | Mongoose timestamps |
| `updatedAt` | `Date` | yes | Mongoose timestamps |

### Relations

- One `project` belongs to one `user` (`ownerId`)
- One `project` has many `dashboards` (within the same workspace collection prefix)
- Projects are isolated per workspace — no cross-workspace project references

### Index Recommendations

- Index on `ownerId`
- Index on `isActive`
- Compound index on `{ ownerId: 1, isActive: 1 }`
- Text index on `name` for search

---

## 3. csvfiles

Metadata for every uploaded CSV file. The actual row data lives in the dynamic `csvdata_{fileId}` collection.

### Mongoose shape

```ts
{
  _id: ObjectId,
  ownerId: ObjectId,
  originalFilename: String,
  fileSizeBytes: Number,
  storageKey: String,
  storageUrl: String | null,
  dataCollectionName: String,
  rowCount: Number | null,
  columnCount: Number,
  status: String,
  analysisJobId: ObjectId | null,
  uploadedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `ownerId` | `ObjectId` | yes | Ref `users` |
| `originalFilename` | `String` | yes | File name as uploaded; duplicates allowed |
| `fileSizeBytes` | `Number` | yes | File size in bytes; max 52,428,800 (50 MB) |
| `storageKey` | `String` | yes | R2 object key: `csv-files/{userId}/{fileId}/{filename}` |
| `storageUrl` | `String` | no | Signed URL for download; regenerated on request |
| `dataCollectionName` | `String` | yes | MongoDB collection name for rows: `csvdata_{fileId}` |
| `rowCount` | `Number` | no | Populated after row insertion completes |
| `columnCount` | `Number` | yes | Number of columns detected |
| `status` | `String` | yes | Enum: `uploading`, `analyzing`, `confirmed`, `error` |
| `analysisJobId` | `ObjectId` | no | Ref `backgroundjobs` — the AI analysis job |
| `uploadedAt` | `Date` | yes | Timestamp of upload initiation |
| `createdAt` | `Date` | yes | Mongoose timestamps |
| `updatedAt` | `Date` | yes | Mongoose timestamps |

### `status` enum

- `uploading` — file upload and row insertion in progress
- `analyzing` — AI column analysis job is running
- `confirmed` — user has confirmed all column descriptions; ready for dashboard generation
- `error` — upload or analysis failed

### Relations

- One `csvfile` belongs to one `user`
- One `csvfile` has many `columnmetadata` documents
- One `csvfile` can be linked to many `dashboards` via `dashboarddatasources`

### Index Recommendations

- Index on `ownerId`
- Index on `status`
- Compound index on `{ ownerId: 1, status: 1 }`
- Text index on `originalFilename` for search

---

## 4. columnmetadata

One document per column per CSV file. Stores inferred type, AI-generated description, and user-confirmed description. The primary input to AI dashboard generation.

### Mongoose shape

```ts
{
  _id: ObjectId,
  fileId: ObjectId,
  columnName: String,
  columnIndex: Number,
  inferredType: String,
  sampleValues: [String],
  nullCount: Number,
  uniqueValueCount: Number,
  aiDescription: String | null,
  userDescription: String | null,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `fileId` | `ObjectId` | yes | Ref `csvfiles` |
| `columnName` | `String` | yes | Exact column header from CSV |
| `columnIndex` | `Number` | yes | Zero-based position in CSV |
| `inferredType` | `String` | yes | Enum: `string`, `number`, `date`, `boolean`, `category` |
| `sampleValues` | `[String]` | yes | Up to 10 distinct sample values (stored as strings) |
| `nullCount` | `Number` | yes | Number of null/empty cells in this column |
| `uniqueValueCount` | `Number` | yes | Count of distinct non-null values |
| `aiDescription` | `String` | no | Description generated by AI analysis job |
| `userDescription` | `String` | no | Final description after user review/edit |
| `status` | `String` | yes | Enum: `pending`, `ai_suggested`, `user_confirmed` |
| `createdAt` | `Date` | yes | Mongoose timestamps |
| `updatedAt` | `Date` | yes | Mongoose timestamps |

### `inferredType` enum

- `string` — free text values
- `number` — numeric values (integer or float)
- `date` — parseable date/datetime values
- `boolean` — true/false values
- `category` — low-cardinality string values suitable for group-by

### `status` enum

- `pending` — not yet processed by AI
- `ai_suggested` — AI has generated a description; awaiting user review
- `user_confirmed` — user has reviewed and confirmed or edited the description

### Relations

- Many `columnmetadata` belong to one `csvfile`

### Index Recommendations

- Index on `fileId`
- Compound index on `{ fileId: 1, columnIndex: 1 }`
- Compound index on `{ fileId: 1, status: 1 }` (used to check if all columns are confirmed)

---

## 5. dashboards

Central business entity. Stores the dashboard definition, purpose, generation status, and layout. Links to one project and one or more CSV files.

### Mongoose shape

```ts
{
  _id: ObjectId,
  projectId: ObjectId,
  ownerId: ObjectId,
  name: String,
  purposeDescription: String,
  status: String,
  generationJobId: ObjectId | null,
  generationError: String | null,
  layoutColumns: Number,
  lastRefreshedAt: Date | null,
  aiModel: String | null,
  generatedAt: Date | null,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `projectId` | `ObjectId` | yes | Ref `projects` |
| `ownerId` | `ObjectId` | yes | Ref `users` |
| `name` | `String` | yes | Unique within the same project |
| `purposeDescription` | `String` | yes | Used as AI generation prompt context |
| `status` | `String` | yes | Enum: `generating`, `ready`, `error` |
| `generationJobId` | `ObjectId` | no | Ref `backgroundjobs` — the AI generation job |
| `generationError` | `String` | no | Error message if status is `error` |
| `layoutColumns` | `Number` | yes | Grid column count (default 12) — set by AI generation |
| `lastRefreshedAt` | `Date` | no | Timestamp of last manual data refresh |
| `aiModel` | `String` | no | AI model name used for generation (audit/debug) |
| `generatedAt` | `Date` | no | Timestamp when AI generation completed |
| `createdAt` | `Date` | yes | Mongoose timestamps |
| `updatedAt` | `Date` | yes | Mongoose timestamps |

### `status` enum

- `generating` — AI dashboard generation job is running
- `ready` — dashboard is available to view
- `error` — generation failed; user can retry

### Business Rules

- `name` must be unique within the same `projectId`
- Duplicating a dashboard appends "-copy" to the name
- Cascade delete: removing a dashboard must remove all `chartwidgets`, `dashboarddatasources`, `chartdatacache`, and `sharelinks` records for it

### Relations

- One `dashboard` belongs to one `project`
- One `dashboard` belongs to one owner `user`
- One `dashboard` has many `chartwidgets`
- One `dashboard` has many `dashboarddatasources`
- One `dashboard` has many `sharelinks`

### Index Recommendations

- Compound unique index on `{ projectId: 1, name: 1 }` (enforces name uniqueness per project)
- Index on `ownerId`
- Index on `status`
- Compound index on `{ projectId: 1, status: 1 }`
- Text index on `name` for search

---

## 6. chartwidgets

One document per widget in a dashboard. Stores chart type, layout position, AI-generated query definition, and aggregation rules. Updated during customization.

### Mongoose shape

```ts
{
  _id: ObjectId,
  dashboardId: ObjectId,
  dataSourceFileId: ObjectId,
  widgetType: String,
  title: String,
  position: {
    x: Number,
    y: Number,
    w: Number,
    h: Number
  },
  queryDefinition: {
    xAxis: String | null,
    yAxis: String | null,
    groupBy: String | null,
    aggregation: String,
    filters: [
      {
        column: String,
        operator: String,
        value: Mixed
      }
    ],
    sortBy: String | null,
    sortOrder: String
  },
  displayConfig: {
    colors: [String],
    showLegend: Boolean,
    xAxisLabel: String | null,
    yAxisLabel: String | null
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `dashboardId` | `ObjectId` | yes | Ref `dashboards` |
| `dataSourceFileId` | `ObjectId` | yes | Ref `csvfiles` — the data source for this widget |
| `widgetType` | `String` | yes | Free string — not a fixed Mongoose enum; must reference a `widgetType` registered in the `widgetdefinitions` catalog (see collection 17). Common values: `bar`, `line`, `pie`, `donut`, `kpi_card`, `table`, `scatter` |
| `title` | `String` | yes | Widget display title |
| `position.x` | `Number` | yes | Column start position in grid |
| `position.y` | `Number` | yes | Row start position in grid |
| `position.w` | `Number` | yes | Width in grid columns |
| `position.h` | `Number` | yes | Height in grid rows |
| `queryDefinition.xAxis` | `String` | no | Column name for x-axis or label |
| `queryDefinition.yAxis` | `String` | no | Column name for y-axis or value |
| `queryDefinition.groupBy` | `String` | no | Column name for grouping |
| `queryDefinition.aggregation` | `String` | yes | Enum: `sum`, `count`, `avg`, `min`, `max` |
| `queryDefinition.filters` | `[Object]` | no | Array of filter rules |
| `queryDefinition.sortBy` | `String` | no | Column name to sort by |
| `queryDefinition.sortOrder` | `String` | yes | Enum: `asc`, `desc` — default `desc` |
| `displayConfig.colors` | `[String]` | no | Hex color overrides |
| `displayConfig.showLegend` | `Boolean` | yes | Default `true` |
| `displayConfig.xAxisLabel` | `String` | no | Override x-axis label |
| `displayConfig.yAxisLabel` | `String` | no | Override y-axis label |
| `createdAt` | `Date` | yes | Mongoose timestamps |
| `updatedAt` | `Date` | yes | Mongoose timestamps |

### `widgetType` values

`widgetType` is stored as an open string. The Mongoose schema does **not** enforce a fixed enum — instead every value must match a `widgetType` registered in the `widgetdefinitions` catalog (collection 17), which the AI dashboard generator selects from. A legacy `WidgetType` TypeScript enum still exists for backward-compatible references, but it is not applied to the schema. Catalog-seeded values include:

- `bar` — bar chart
- `line` — line chart
- `pie` — pie chart
- `donut` — donut/ring chart
- `kpi_card` — single metric card
- `table` — data table
- `scatter` — scatter plot

### `aggregation` enum

- `sum` — sum of numeric values
- `count` — count of records
- `avg` — average of numeric values
- `min` — minimum value
- `max` — maximum value

### Relations

- Many `chartwidgets` belong to one `dashboard`
- One `chartwidget` references one `csvfile` as its data source

### Index Recommendations

- Index on `dashboardId` (primary access pattern: load all widgets for a dashboard)
- Compound index on `{ dashboardId: 1, dataSourceFileId: 1 }`

---

## 7. dashboarddatasources

Junction collection linking dashboards to CSV files. One dashboard can use multiple CSV files; one CSV file can be used in multiple dashboards.

### Mongoose shape

```ts
{
  _id: ObjectId,
  dashboardId: ObjectId,
  fileId: ObjectId,
  isPrimary: Boolean,
  addedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `dashboardId` | `ObjectId` | yes | Ref `dashboards` |
| `fileId` | `ObjectId` | yes | Ref `csvfiles` |
| `isPrimary` | `Boolean` | yes | True for the first/main data source |
| `addedAt` | `Date` | yes | When this data source was linked |
| `createdAt` | `Date` | yes | Mongoose timestamps |
| `updatedAt` | `Date` | yes | Mongoose timestamps |

### Relations

- Many `dashboarddatasources` belong to one `dashboard`
- Many `dashboarddatasources` reference one `csvfile`

### Index Recommendations

- Compound unique index on `{ dashboardId: 1, fileId: 1 }` (prevents duplicate links)
- Index on `dashboardId`
- Index on `fileId` (to find all dashboards using a CSV file)

---

## 8. chartdatacache

Persistent cache layer for pre-calculated aggregated chart data. Used as a fallback when Redis cache is cold. Invalidated on manual data refresh.

### Mongoose shape

```ts
{
  _id: ObjectId,
  widgetId: ObjectId,
  dashboardId: ObjectId,
  queryHash: String,
  cachedResult: Mixed,
  calculatedAt: Date,
  expiresAt: Date,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `widgetId` | `ObjectId` | yes | Ref `chartwidgets` |
| `dashboardId` | `ObjectId` | yes | Ref `dashboards` — used for bulk invalidation on refresh |
| `queryHash` | `String` | yes | SHA-256 hash of the widget's query definition for cache key matching |
| `cachedResult` | `Mixed` | yes | JSON result in chart-ready format |
| `calculatedAt` | `Date` | yes | When this result was computed |
| `expiresAt` | `Date` | yes | TTL: 1 hour from calculation |
| `status` | `String` | yes | Enum: `valid`, `stale` |
| `createdAt` | `Date` | yes | Mongoose timestamps |
| `updatedAt` | `Date` | yes | Mongoose timestamps |

### Relations

- One `chartdatacache` belongs to one `chartwidget`
- Many `chartdatacache` entries belong to one `dashboard` (for bulk invalidation)

### Index Recommendations

- Compound unique index on `{ widgetId: 1, queryHash: 1 }`
- Index on `dashboardId` (for bulk invalidation on refresh)
- Index on `expiresAt` (for TTL cleanup jobs)
- Index on `status`

---

## 9. sharelinks

Secure shareable links for dashboards. Stores token hash, permission level, and access metadata.

### Mongoose shape

```ts
{
  _id: ObjectId,
  dashboardId: ObjectId,
  createdBy: ObjectId,
  tokenHash: String,
  permission: String,
  viewerCanRefresh: Boolean,
  accessCount: Number,
  lastAccessedAt: Date | null,
  expiresAt: Date | null,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `dashboardId` | `ObjectId` | yes | Ref `dashboards` |
| `createdBy` | `ObjectId` | yes | Ref `users` — the owner who created the link |
| `tokenHash` | `String` | yes | SHA-256 hash of the raw share token; raw token is only returned once at creation |
| `permission` | `String` | yes | Enum: `view`, `edit` |
| `viewerCanRefresh` | `Boolean` | yes | Whether the share link holder can trigger data refresh; default `false` |
| `accessCount` | `Number` | yes | Incremented on each valid access; default 0 |
| `lastAccessedAt` | `Date` | no | Timestamp of last valid access |
| `expiresAt` | `Date` | no | Optional expiry; null means no expiry |
| `status` | `String` | yes | Enum: `active`, `revoked`, `expired` |
| `createdAt` | `Date` | yes | Mongoose timestamps |
| `updatedAt` | `Date` | yes | Mongoose timestamps |

### `permission` enum

- `view` — can view dashboard and chart data; cannot edit, delete, or customize
- `edit` — can view and customize dashboard widgets and layout

### Relations

- Many `sharelinks` belong to one `dashboard`
- One `sharelink` is created by one `user`

### Index Recommendations

- Unique index on `tokenHash`
- Index on `dashboardId`
- Index on `status`
- Compound index on `{ dashboardId: 1, status: 1 }` (for listing active links per dashboard)
- Index on `expiresAt` (for expiry cleanup)

---

## 10. backgroundjobs

Tracks all asynchronous background jobs across the system: CSV analysis, dashboard generation, PDF export, and cache recalculation.

### Mongoose shape

```ts
{
  _id: ObjectId,
  type: String,
  ownerId: ObjectId,
  entityType: String,
  entityId: ObjectId,
  status: String,
  progress: Number,
  queuedAt: Date,
  startedAt: Date | null,
  completedAt: Date | null,
  resultSummary: String | null,
  errorMessage: String | null,
  retryCount: Number,
  maxRetries: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `type` | `String` | yes | Enum: `csv_analysis`, `dashboard_generation`, `pdf_export`, `cache_recalculation` |
| `ownerId` | `ObjectId` | yes | Ref `users` — user who triggered the job |
| `entityType` | `String` | yes | Enum: `csvfile`, `dashboard` — the entity this job processes |
| `entityId` | `ObjectId` | yes | ID of the entity being processed |
| `status` | `String` | yes | Enum: `queued`, `processing`, `completed`, `failed` |
| `progress` | `Number` | yes | 0–100 percentage; default 0 |
| `queuedAt` | `Date` | yes | When job was added to the queue |
| `startedAt` | `Date` | no | When job worker started processing |
| `completedAt` | `Date` | no | When job finished (success or failure) |
| `resultSummary` | `String` | no | Brief human-readable outcome on success |
| `errorMessage` | `String` | no | Error details on failure |
| `retryCount` | `Number` | yes | Number of attempts so far; default 0 |
| `maxRetries` | `Number` | yes | Max attempts before final failure; default 3 |
| `createdAt` | `Date` | yes | Mongoose timestamps |
| `updatedAt` | `Date` | yes | Mongoose timestamps |

### `type` enum

- `csv_analysis` — AI column description generation for a CSV file
- `dashboard_generation` — AI dashboard structure generation
- `pdf_export` — PDF report generation for a dashboard
- `cache_recalculation` — re-running aggregations after data refresh

> **BullMQ queues (not all are tracked as `backgroundjobs` records):** `csv-analysis`,
> `dashboard-generation`, `pdf-export`, `cache-recalculation`, and `subscription-activation`
> (change-003 — durable event that activates a user's subscription after a confirmed PayUp payment).

### `status` enum

- `queued` — waiting in BullMQ queue
- `processing` — worker is actively processing
- `completed` — finished successfully
- `failed` — exhausted retries or hit a fatal error

### Relations

- One `backgroundjob` belongs to one `user` (owner)
- One `backgroundjob` references one entity (`csvfile` or `dashboard`)

### Index Recommendations

- Compound index on `{ entityType: 1, entityId: 1 }` (look up jobs for a specific entity)
- Index on `ownerId`
- Index on `status`
- Index on `type`
- Compound index on `{ ownerId: 1, status: 1, type: 1 }`

---

## 11. notifications

In-app and email notification records for each user.

### Mongoose shape

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  type: String,
  title: String,
  message: String,
  relatedEntityType: String | null,
  relatedEntityId: ObjectId | null,
  isRead: Boolean,
  emailSent: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `userId` | `ObjectId` | yes | Ref `users` — notification recipient |
| `type` | `String` | yes | Enum: `dashboard_ready`, `generation_error`, `csv_analysis_complete`, `export_ready`, `dashboard_shared` |
| `title` | `String` | yes | Short notification title |
| `message` | `String` | yes | Full notification message body |
| `relatedEntityType` | `String` | no | Enum: `dashboard`, `csvfile`, `project` |
| `relatedEntityId` | `ObjectId` | no | ID of the related entity for navigation |
| `isRead` | `Boolean` | yes | Default `false` |
| `emailSent` | `Boolean` | yes | Whether a corresponding email was sent; default `false` |
| `createdAt` | `Date` | yes | Mongoose timestamps |
| `updatedAt` | `Date` | yes | Mongoose timestamps |

### Relations

- Many `notifications` belong to one `user`

### Index Recommendations

- Compound index on `{ userId: 1, isRead: 1 }` (unread count query)
- Compound index on `{ userId: 1, createdAt: -1 }` (notification list, newest first)
- Index on `type`

---

## 12. auditlogs

Immutable record of all user actions and system events for GDPR compliance and security auditing.

### Mongoose shape

```ts
{
  _id: ObjectId,
  userId: ObjectId | null,
  action: String,
  entityType: String,
  entityId: ObjectId | null,
  oldValues: Mixed | null,
  newValues: Mixed | null,
  ipAddress: String | null,
  userAgent: String | null,
  details: String | null,
  timestamp: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `userId` | `ObjectId` | no | Ref `users`; null for system events or when user is deleted (GDPR: redact user ref, keep event) |
| `action` | `String` | yes | Enum: see action list below |
| `entityType` | `String` | yes | Enum: `user`, `project`, `dashboard`, `csvfile`, `sharelink`, `subscription`, `settings` |
| `entityId` | `ObjectId` | no | ID of the affected entity |
| `oldValues` | `Mixed` | no | Snapshot of values before the change |
| `newValues` | `Mixed` | no | Snapshot of values after the change |
| `ipAddress` | `String` | no | Request IP address |
| `userAgent` | `String` | no | Browser/client user agent string |
| `details` | `String` | no | Additional context string |
| `timestamp` | `Date` | yes | Event timestamp (not Mongoose createdAt — explicit for immutability) |

### `action` enum

- `user.register`, `user.login`, `user.logout`, `user.login_failed`
- `user.update`, `user.delete`, `user.deactivate`, `user.activate`
- `project.create`, `project.update`, `project.delete`
- `dashboard.create`, `dashboard.update`, `dashboard.delete`, `dashboard.duplicate`, `dashboard.refresh`
- `csvfile.upload`, `csvfile.delete`
- `sharelink.create`, `sharelink.revoke`
- `export.pdf`, `export.excel`, `export.csv`
- `subscription.assign`, `subscription.upgrade`, `subscription.cancel`
- `settings.update`

### Relations

- One `auditlog` optionally references one `user` (null when user is deleted)

### Index Recommendations

- Index on `userId`
- Index on `action`
- Index on `entityType`
- Compound index on `{ entityType: 1, entityId: 1 }`
- Index on `timestamp` (descending — most recent first)
- Compound index on `{ userId: 1, timestamp: -1 }` (user activity history)

### Validation Rules

- No update or delete endpoints for audit logs — ever
- Admin read-only access only
- On GDPR user deletion: set `userId` to `null`; do not delete the log record

---

## 13. subscriptionplans

Catalog of subscription plan definitions (model `SubscriptionPlan`). Admin-managed; each plan defines pricing and monthly usage limits. Referenced by `usersubscriptions.planId` and `payments.planId`.

### Mongoose shape

```ts
{
  _id: ObjectId,
  name: String,
  description: String,
  priceMonthlyUsd: Number,
  maxDashboards: Number,
  maxDataUploadsPerMonth: Number,
  maxDataUpdatesPerMonth: Number,
  isActive: Boolean,
  freeUsers: Number,
  pricePerExtraUserMonthlyUsd: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `name` | `String` | yes | Unique plan name (e.g., `Free`, `Pro`) |
| `description` | `String` | no | Optional plan description; default `''` |
| `priceMonthlyUsd` | `Number` | yes | Monthly price in USD; min 0 |
| `maxDashboards` | `Number` | yes | Max dashboards allowed under this plan; min 0 |
| `maxDataUploadsPerMonth` | `Number` | yes | Max CSV uploads per month; min 0 |
| `maxDataUpdatesPerMonth` | `Number` | yes | Max data updates/refreshes per month; min 0 |
| `isActive` | `Boolean` | yes | Default `true`; inactive plans hidden from assignment |
| `freeUsers` | `Number` | yes | Number of users included for free in the plan; default 5 |
| `pricePerExtraUserMonthlyUsd` | `Number` | yes | Price in USD per month per extra user beyond limit; default 10 |
| `createdAt` | `Date` | yes | Mongoose timestamps |
| `updatedAt` | `Date` | yes | Mongoose timestamps |

### Relations

- One `subscriptionplan` is referenced by many `usersubscriptions` (`planId`)
- One `subscriptionplan` may be referenced by many `payments` (`planId`)

### Index Recommendations

- Unique index on `name`
- Index on `isActive`

---

## 14. usersubscriptions

One subscription record per workspace (model `UserSubscription`). Links a workspace to a plan and tracks the current period and monthly usage counters used for limit enforcement.

### Mongoose shape

```ts
{
  _id: ObjectId,
  workspaceId: ObjectId,
  planId: ObjectId,
  status: String,
  startDate: Date,
  endDate: Date | null,
  uploadsUsedThisMonth: Number,
  updatesUsedThisMonth: Number,
  currentPeriodStart: Date | null,
  currentPeriodEnd: Date | null,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `workspaceId` | `ObjectId` | yes | Ref `workspaces` — **unique**, one subscription per workspace |
| `planId` | `ObjectId` | yes | Ref `subscriptionplans` |
| `status` | `String` | yes | Enum: `active`, `inactive`, `expired`, `cancelled` — default `active` |
| `startDate` | `Date` | yes | Subscription start date |
| `endDate` | `Date` | no | Null for subscriptions without an end date |
| `uploadsUsedThisMonth` | `Number` | yes | Running upload count for the current period; default 0 |
| `updatesUsedThisMonth` | `Number` | yes | Running data-update count for the current period; default 0 |
| `currentPeriodStart` | `Date` | no | Start of the current billing/usage period |
| `currentPeriodEnd` | `Date` | no | End of the current billing/usage period; used to reset counters |
| `notes` | `String` | no | Free-text admin notes; default `''` |
| `createdAt` | `Date` | yes | Mongoose timestamps |
| `updatedAt` | `Date` | yes | Mongoose timestamps |

### `status` enum

- `active` — subscription is currently valid; usage limits enforced
- `inactive` — admin-deactivated; user can log in but resource lock applies (no create/upload/update)
- `expired` — past its end date / period without renewal; same resource lock as `inactive`
- `cancelled` — manually cancelled

### Relations

- One `usersubscription` belongs to one `workspace` (unique)
- One `usersubscription` references one `subscriptionplan`
- One `usersubscription` may be referenced by many `payments` (`subscriptionId`)

### Index Recommendations

- Unique index on `userId` (one subscription per user)
- Index on `planId`
- Index on `status`
- Index on `currentPeriodEnd` (for period rollover / counter reset jobs)

---

## 15. payments

Payment log (model `Payment`, owned by the Payments module). Serves two purposes: an admin manual ledger
**and** the gateway payment log written by `PaymentCheckoutService` during the PayUp hosted-checkout flow.
Each record links to a user, and optionally the subscription and plan it applies to. *(change-003 added the
gateway/session/return-URL fields.)*

### Mongoose shape

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  workspaceId: ObjectId | null,
  subscriptionId: ObjectId | null,
  planId: ObjectId | null,
  amountUsd: Number,
  currency: String,
  status: String,
  method: String,
  reference: String,
  paidAt: Date | null,
  notes: String,
  // gateway / checkout fields (change-003)
  gateway: String,
  providerSessionId: String,
  providerSessionToken: String,
  confirmUrl: String,
  cancelUrl: String,
  redirectUrl: String,
  action: String,
  previousPlanId: ObjectId,
  settledByAdminId: ObjectId,
  invitationId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `userId` | `ObjectId` | yes | Ref `users` |
| `workspaceId` | `ObjectId` | no | Ref `workspaces`; default `null` (added for workspace billing context, nullable for legacy records) |
| `subscriptionId` | `ObjectId` | no | Ref `usersubscriptions`; default `null` |
| `planId` | `ObjectId` | no | Ref `subscriptionplans`; default `null` |
| `amountUsd` | `Number` | yes | Payment amount in USD; min 0 |
| `currency` | `String` | yes | Currency code; default `USD` |
| `status` | `String` | yes | Enum: `paid`, `pending`, `refunded`, `failed` — default `pending` |
| `method` | `String` | no | Payment method label; default `''` |
| `reference` | `String` | no | External reference / receipt number (PayUp session id when settled); default `''` |
| `paidAt` | `Date` | no | Timestamp the payment was settled; default `null` |
| `notes` | `String` | no | Free-text admin notes; default `''` |
| `gateway` | `String` | no | Payment gateway; `manual` (admin ledger) or `payup`; default `manual` *(change-003)* |
| `providerSessionId` | `String` | no | PayUp checkout session id; default `''` *(change-003)* |
| `providerSessionToken` | `String` | no | PayUp session token used to verify status; default `''` *(change-003)* |
| `confirmUrl` | `String` | no | Public return URL sent to PayUp on success; default `''` *(change-003)* |
| `cancelUrl` | `String` | no | Public return URL sent to PayUp on cancel; default `''` *(change-003)* |
| `redirectUrl` | `String` | no | Hosted-checkout URL returned by PayUp; default `''` *(change-003)* |
| `action` | `String` | no | Enum: `subscribe`, `upgrade`, `downgrade`, `admin_assign`, `add_user` |
| `previousPlanId` | `ObjectId` | no | Ref `subscriptionplans`; default `null` |
| `settledByAdminId` | `ObjectId` | no | Ref `users` for admin manual settle; default `null` |
| `invitationId` | `ObjectId` | no | Ref `workspace_invitations` for extra user invoices; default `null` |
| `createdAt` | `Date` | yes | Mongoose timestamps |
| `updatedAt` | `Date` | yes | Mongoose timestamps |

### `status` enum

- `paid` — payment received
- `pending` — awaiting settlement
- `refunded` — amount refunded
- `failed` — payment failed

### Relations

- One `payment` belongs to one `user`
- One `payment` optionally references one `workspace` (`workspaceId`)
- One `payment` optionally references one `usersubscription` (`subscriptionId`)
- One `payment` optionally references one `subscriptionplan` (`planId`)
- One `payment` optionally references one `workspace_invitation` (`invitationId`)

### Index Recommendations

- Compound index on `{ userId: 1, createdAt: -1 }` (user payment history, newest first)
- Compound index on `{ status: 1, createdAt: -1 }` (admin ledger filtering)
- Index on `{ providerSessionToken: 1 }` (lookup on gateway return; sparse) *(change-003)*
- Index on `workspaceId` (optional, for fast workspace-level invoice lookup)

---

## 16. systemsettings

Global system configuration as a single effectively-singleton document (model `SystemSettings`, collection `systemsettings`). One document keyed by `key: 'global'` holds all platform-wide settings as typed fields.

### Mongoose shape

```ts
{
  _id: ObjectId,
  key: String,
  registrationEnabled: Boolean,
  maxFileSizeMb: Number,
  defaultMaxDashboards: Number,
  supportedLanguages: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `key` | `String` | yes | Unique key; default `global` — effectively a singleton document |
| `registrationEnabled` | `Boolean` | yes | Whether public user registration is allowed; default `true` |
| `maxFileSizeMb` | `Number` | yes | Max upload size in MB; default `50` |
| `defaultMaxDashboards` | `Number` | yes | Default dashboard limit for new users; default `5` |
| `supportedLanguages` | `[String]` | yes | Supported UI languages; default `['en', 'ar']` |
| `createdAt` | `Date` | yes | Mongoose timestamps |
| `updatedAt` | `Date` | yes | Mongoose timestamps |

### Index Recommendations

- Unique index on `key` (enforces the singleton `global` document)

---

## 17. widgetdefinitions

The AI widget **catalog** (model `WidgetDefinition`, owned by the Dashboards module). Seeded at startup; the AI dashboard generator picks `widgetType`s from this catalog and `chartwidgets.widgetType` must match an entry here. Each entry describes the required data shape and provides an example to anchor the AI prompt.

### Mongoose shape

```ts
{
  _id: ObjectId,
  widgetType: String,
  displayName: String,
  description: String,
  category: String,
  requiredStructure: Object,
  example: Object,
  selectionHints: String,
  defaultSize: {
    w: Number,
    h: Number
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `widgetType` | `String` | yes | Unique catalog identifier used in `chartwidgets.widgetType` (e.g., `bar`, `line`, `kpi_card`) |
| `displayName` | `String` | yes | Human-readable widget name |
| `description` | `String` | yes | When the AI should choose this widget |
| `category` | `String` | yes | Grouping category; default `chart` |
| `requiredStructure` | `Object` | no | Describes the `queryDefinition`/`displayConfig` shape the AI must provide; default `{}` |
| `example` | `Object` | no | Complete example widget JSON (sample query + output rows); default `{}` |
| `selectionHints` | `String` | no | Free-text hints for widget selection; default `''` |
| `defaultSize` | `Object` | yes | Default grid size `{ w, h }`; default `{ w: 4, h: 2 }` |
| `isActive` | `Boolean` | yes | Default `true`; inactive widgets are excluded from AI selection |
| `createdAt` | `Date` | yes | Mongoose timestamps |
| `updatedAt` | `Date` | yes | Mongoose timestamps |

### Relations

- Standalone catalog — referenced by `chartwidgets.widgetType` by value (not by `ObjectId`)

### Index Recommendations

- Unique index on `widgetType`
- Index on `isActive`

---

## 18. ailogs

AI usage log (model `AiLog`, collection `ailogs`, owned by the AI Logs / `integrations-ai` module). One record per AI provider call. Captures the request, prompt, raw and parsed responses, token usage, computed cost, and outcome — powering admin AI cost reporting.

### Mongoose shape

```ts
{
  _id: ObjectId,
  jobId: ObjectId | null,
  provider: String,
  model: String,
  method: String,
  requestPayload: Object | null,
  promptText: String | null,
  rawResponseText: String | null,
  parsedResponse: Object | null,
  inputTokens: Number,
  outputTokens: Number,
  costUsd: Number,
  durationMs: Number,
  status: String,
  errorMessage: String | null,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `jobId` | `ObjectId` | no | Ref `backgroundjobs`; default `null` |
| `provider` | `String` | yes | AI provider name (e.g., `anthropic`, `openai`) |
| `model` | `String` | yes | Model identifier used for the call |
| `method` | `String` | yes | Logical method/operation that triggered the call |
| `requestPayload` | `Object` | no | Raw request payload sent to the provider; default `null` |
| `promptText` | `String` | no | Prompt text sent; default `null` |
| `rawResponseText` | `String` | no | Raw provider response text; default `null` |
| `parsedResponse` | `Object` | no | Parsed/structured response; default `null` |
| `inputTokens` | `Number` | yes | Input token count; default 0 |
| `outputTokens` | `Number` | yes | Output token count; default 0 |
| `costUsd` | `Number` | yes | Computed USD cost from `aimodels` pricing; default 0 |
| `durationMs` | `Number` | yes | Call duration in milliseconds; default 0 |
| `status` | `String` | yes | Enum: `pending`, `success`, `failed` |
| `errorMessage` | `String` | no | Error details on failure; default `null` |
| `createdAt` | `Date` | yes | Mongoose timestamps |
| `updatedAt` | `Date` | yes | Mongoose timestamps |

### `status` enum

- `pending` — call in progress
- `success` — call completed successfully
- `failed` — call failed (see `errorMessage`)

### Relations

- One `ailog` optionally references one `backgroundjob` (`jobId`)
- Standalone otherwise; `costUsd` is computed using `aimodels` pricing at write time

### Index Recommendations

- Index on `jobId`
- Compound index on `{ provider: 1, model: 1 }`
- Index on `createdAt` (descending — recent calls / cost reporting)

---

## 19. aimodels

AI model pricing table (model `AiModelPricing`, collection `aimodels`, owned by the AI Logs module). Seeded at startup; used to compute `ailogs.costUsd` from token counts.

### Mongoose shape

```ts
{
  _id: ObjectId,
  provider: String,
  modelId: String,
  displayName: String,
  inputPricePerMToken: Number,
  outputPricePerMToken: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `provider` | `String` | yes | AI provider name |
| `modelId` | `String` | yes | Model identifier (matches `ailogs.model`) |
| `displayName` | `String` | yes | Human-readable model name |
| `inputPricePerMToken` | `Number` | yes | USD per 1 million input tokens; default 0 |
| `outputPricePerMToken` | `Number` | yes | USD per 1 million output tokens; default 0 |
| `isActive` | `Boolean` | yes | Default `true` |
| `createdAt` | `Date` | yes | Mongoose timestamps |
| `updatedAt` | `Date` | yes | Mongoose timestamps |

### Relations

- Standalone pricing table — looked up by `{ provider, modelId }` when computing `ailogs.costUsd`

### Index Recommendations

- Unique compound index on `{ provider: 1, modelId: 1 }`
- Index on `isActive`

---

## 20. workspaces

Multi-tenancy workspace entity (model `Workspace`, collection `workspaces`).

### Mongoose shape

```ts
{
  _id: ObjectId,
  slug: String,
  name: String,
  ownerId: ObjectId,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | yes | Primary key |
| `slug` | string | yes | URL-safe, unique. Pattern: `{word}-{word}-{4digits}`. Unique index |
| `name` | string | yes | Human display name |
| `ownerId` | ObjectId | yes | User who created the workspace (Ref `users`) |
| `status` | string | yes | Enum: `active`, `suspended`, `deleted` — default `active` |
| `createdAt` | Date | yes | Mongoose timestamps |
| `updatedAt` | Date | yes | Mongoose timestamps |

### Relations

- One `workspace` is owned by one `user` (`ownerId`)
- One `workspace` has many `workspace_memberships`
- One `workspace` has many `workspace_invitations`
- One `workspace` has one `workspace_branding`

### Index Recommendations

- Unique index on `slug`
- Index on `ownerId`
- Index on `status`

---

## 21. workspace_memberships

Maps users to their workspaces with a role (model `WorkspaceMembership`, collection `workspace_memberships`).

### Mongoose shape

```ts
{
  _id: ObjectId,
  workspaceId: ObjectId,
  userId: ObjectId,
  role: String,
  joinedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | yes | Primary key |
| `workspaceId` | ObjectId | yes | Ref `workspaces` |
| `userId` | ObjectId | yes | Ref `users` |
| `role` | string | yes | Enum: `workspace-owner`, `workspace-admin`, `workspace-member` |
| `joinedAt` | Date | yes | Timestamp the member joined (default `Date.now`) |
| `createdAt` | Date | yes | Mongoose timestamps |
| `updatedAt` | Date | yes | Mongoose timestamps |

### Relations

- One `workspace_membership` links one `workspace` and one `user`

### Index Recommendations

- Unique compound index on `{ workspaceId: 1, userId: 1 }`
- Index on `userId`

---

## 22. workspace_invitations

Workspace invitations sent to email addresses (model `WorkspaceInvitation`, collection `workspace_invitations`).

### Mongoose shape

```ts
{
  _id: ObjectId,
  workspaceId: ObjectId,
  invitedByUserId: ObjectId,
  email: String,
  role: String,
  token: String,
  status: String,
  expiresAt: Date,
  acceptedAt: Date | null,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | yes | Primary key |
| `workspaceId` | ObjectId | yes | Ref `workspaces` |
| `invitedByUserId` | ObjectId | yes | Ref `users` |
| `email` | string | yes | Email address invited (lowercase) |
| `role` | string | yes | Enum: `workspace-owner`, `workspace-admin`, `workspace-member` |
| `token` | string | yes | Unique secure token; indexed for accept lookup |
| `status` | string | yes | Enum: `pending`, `pending-payment`, `accepted`, `revoked`, `expired` — default `pending` |
| `expiresAt` | Date | yes | Expiration date (usually 7 days after creation) |
| `acceptedAt` | Date | no | When the invitation was accepted; default `null` |
| `createdAt` | Date | yes | Mongoose timestamps |
| `updatedAt` | Date | yes | Mongoose timestamps |

### Index Recommendations

- Unique index on `token`
- Unique compound index on `{ workspaceId: 1, email: 1 }`
- Index on `expiresAt` (can be used for TTL)

---

## 23. workspace_brandings

Custom branding configuration for a workspace (model `WorkspaceBranding`, collection `workspace_brandings`).

### Mongoose shape

```ts
{
  _id: ObjectId,
  workspaceId: ObjectId,
  logoUrl: String | null,
  logoStorageKey: String | null,
  colorTemplateId: ObjectId | null,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | yes | Primary key |
| `workspaceId` | ObjectId | yes | Ref `workspaces` |
| `logoUrl` | string | no | Cloudflare R2 storage URL; default `null` |
| `logoStorageKey` | string | no | R2 storage key for deletion; default `null` |
| `colorTemplateId` | ObjectId | no | Ref `color_templates`; default `null` |
| `createdAt` | Date | yes | Mongoose timestamps |
| `updatedAt` | Date | yes | Mongoose timestamps |

### Index Recommendations

- Unique index on `workspaceId`

---

## 24. onboarding_progress

Tracks onboarding steps completion for a workspace owner (model `OnboardingProgress`, collection `onboarding_progress`).

### Mongoose shape

```ts
{
  _id: ObjectId,
  workspaceId: ObjectId,
  userId: ObjectId,
  workspaceCreated: Boolean,
  brandingDone: Boolean,
  invitesDone: Boolean,
  experimentDone: Boolean,
  completedAt: Date | null,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | yes | Primary key |
| `workspaceId` | ObjectId | yes | Ref `workspaces` |
| `userId` | ObjectId | yes | Ref `users` — the owner who created the workspace |
| `workspaceCreated` | boolean | yes | Step 1 complete; default `false` |
| `brandingDone` | boolean | yes | Step 2 done or skipped; default `false` |
| `invitesDone` | boolean | yes | Step 3 done or skipped; default `false` |
| `experimentDone` | boolean | yes | Step 4 done or skipped; default `false` |
| `completedAt` | Date | no | When the wizard was fully dismissed; default `null` |
| `createdAt` | Date | yes | Mongoose timestamps |
| `updatedAt` | Date | yes | Mongoose timestamps |

### Index Recommendations

- Unique index on `workspaceId`
- Unique index on `userId`

---

## 25. color_templates

System-predefined color templates managed by admins (model `ColorTemplate`, collection `color_templates`).

### Mongoose shape

```ts
{
  _id: ObjectId,
  name: String,
  primary: String,
  secondary: String,
  accent: String,
  chartColors: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | yes | Primary key |
| `name` | string | yes | Display name (e.g. "Ocean Blue") |
| `primary` | string | yes | Hex color code (e.g. `#1a73e8`) |
| `secondary` | string | yes | Hex color code |
| `accent` | string | yes | Hex color code |
| `chartColors` | [string] | yes | Array of 5 hex colors for chart series |
| `isActive` | boolean | yes | Hidden from selection if false; default `true` |
| `createdAt` | Date | yes | Mongoose timestamps |
| `updatedAt` | Date | yes | Mongoose timestamps |

### Index Recommendations

- Index on `isActive`

---

## Dynamic Collections

### csvdata_{fileId}

One collection is created per uploaded CSV file, where `{fileId}` is the string representation of the `csvfiles._id`. This collection stores all data rows for that file.

#### Document Shape

```ts
{
  _id: ObjectId,
  _rowIndex: Number,
  // All other fields are dynamic — column names from the CSV header become field names
  // Example: { _id, _rowIndex: 0, customer_id: "C001", purchase_date: "2024-01-15", amount: 150.00 }
}
```

#### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `_rowIndex` | `Number` | yes | Original row position in CSV (0-based) for ordering |
| `...columnFields` | `Mixed` | no | One field per CSV column; field names match exact CSV column headers |

#### Design Notes

- Collection name pattern: `csvdata_{fileId}` (fileId as 24-char hex string)
- Created programmatically at upload time via `mongoose.connection.createCollection()`
- Dropped at file deletion time via `mongoose.connection.dropCollection()`
- MongoDB aggregation pipelines run directly on this collection for chart data
- No Mongoose schema is registered for these collections — accessed via `mongoose.connection.collection(name)`
- Index on `_rowIndex` for ordered exports
- Additional indexes created dynamically based on `columnmetadata.inferredType` for columns used in aggregations

---

## Relationship Summary

- `users` 1 → many `projects`
- `users` 1 → many `csvfiles`
- `users` 1 → many `dashboards`
- `users` 1 → 1 `usersubscriptions`
- `users` 1 → many `notifications`
- `users` 1 → many `payments`
- `projects` 1 → many `dashboards`
- `csvfiles` 1 → many `columnmetadata`
- `csvfiles` 1 → 1 `csvdata_{fileId}` (dynamic collection)
- `dashboards` 1 → many `chartwidgets`
- `dashboards` 1 → many `dashboarddatasources`
- `dashboards` 1 → many `sharelinks`
- `dashboarddatasources` many → 1 `csvfiles` (many dashboards reference one CSV)
- `dashboarddatasources` many → 1 `dashboards`
- `chartwidgets` 1 → many `chartdatacache`
- `chartwidgets` many → 1 `csvfiles` (data source)
- `chartwidgets` many → 1 `widgetdefinitions` (by `widgetType` value, not ObjectId)
- `backgroundjobs` many → 1 `users`
- `usersubscriptions` many → 1 `subscriptionplans`
- `payments` many → 1 `users`; `payments` many → 1 `usersubscriptions` (optional); `payments` many → 1 `subscriptionplans` (optional)
- `ailogs` many → 1 `backgroundjobs` (optional `jobId`); cost computed from `aimodels`
- `widgetdefinitions` — standalone AI widget catalog
- `aimodels` — standalone AI model pricing table

---

## Embedded vs Referenced Decision

### Recommended References (ObjectId foreign keys)

- `projects.ownerId → users`
- `csvfiles.ownerId → users`
- `dashboards.projectId → projects`
- `dashboards.ownerId → users`
- `columnmetadata.fileId → csvfiles`
- `chartwidgets.dashboardId → dashboards`
- `chartwidgets.dataSourceFileId → csvfiles`
- `dashboarddatasources.dashboardId → dashboards`
- `dashboarddatasources.fileId → csvfiles`
- `chartdatacache.widgetId → chartwidgets`
- `chartdatacache.dashboardId → dashboards`
- `sharelinks.dashboardId → dashboards`
- `notifications.userId → users`
- `backgroundjobs.ownerId → users`
- `usersubscriptions.userId → users`
- `usersubscriptions.planId → subscriptionplans`
- `payments.userId → users`
- `payments.subscriptionId → usersubscriptions` (optional)
- `payments.planId → subscriptionplans` (optional)
- `ailogs.jobId → backgroundjobs` (optional)

### Recommended Embedded Subdocuments

- `chartwidgets.position` — layout coordinates belong exclusively to the widget
- `chartwidgets.queryDefinition` — query spec is inseparable from the widget definition
- `chartwidgets.displayConfig` — display settings belong exclusively to the widget
- `widgetdefinitions.requiredStructure` / `example` / `defaultSize` — catalog metadata read as one unit by the AI generator
- `usersubscriptions` usage counters (`uploadsUsedThisMonth`, `updatesUsedThisMonth`) — updated atomically on the subscription document

### Reason

- Widget definitions (position, query, display config) are always read and written together as a unit — embedding avoids multiple joins on every dashboard viewer load
- Plan limits are normalized into `subscriptionplans` and referenced by `usersubscriptions`; usage counters live on the user subscription and are updated atomically for limit enforcement
- All other entities are normalized references because they are queried, updated, and deleted independently

---

## Index Recommendations Summary

| Collection | Index |
|---|---|
| `users` | Unique: `email`; `role`; `isActive`; Compound: `{oauthProvider, oauthProviderId}` |
| `projects` | `ownerId`; `isActive`; Compound: `{ownerId, isActive}`; Text: `name` |
| `csvfiles` | `ownerId`; `status`; Compound: `{ownerId, status}`; Text: `originalFilename` |
| `columnmetadata` | `fileId`; Compound: `{fileId, columnIndex}`; Compound: `{fileId, status}` |
| `dashboards` | Unique compound: `{projectId, name}`; `ownerId`; `status`; Compound: `{projectId, status}`; Text: `name` |
| `chartwidgets` | `dashboardId`; Compound: `{dashboardId, dataSourceFileId}` |
| `dashboarddatasources` | Unique compound: `{dashboardId, fileId}`; `dashboardId`; `fileId` |
| `chartdatacache` | Unique compound: `{widgetId, queryHash}`; `dashboardId`; `expiresAt`; `status` |
| `sharelinks` | Unique: `tokenHash`; `dashboardId`; `status`; Compound: `{dashboardId, status}`; `expiresAt` |
| `backgroundjobs` | Compound: `{entityType, entityId}`; `ownerId`; `status`; `type`; Compound: `{ownerId, status, type}` |
| `notifications` | Compound: `{userId, isRead}`; Compound: `{userId, createdAt: -1}`; `type` |
| `auditlogs` | `userId`; `action`; `entityType`; Compound: `{entityType, entityId}`; `timestamp desc`; Compound: `{userId, timestamp: -1}` |
| `subscriptionplans` | Unique: `name`; `isActive` |
| `usersubscriptions` | Unique: `userId`; `planId`; `status`; `currentPeriodEnd` |
| `payments` | Compound: `{userId, createdAt: -1}`; Compound: `{status, createdAt: -1}` |
| `systemsettings` | Unique: `key` |
| `widgetdefinitions` | Unique: `widgetType`; `isActive` |
| `ailogs` | `jobId`; Compound: `{provider, model}`; `createdAt desc` |
| `aimodels` | Unique compound: `{provider, modelId}`; `isActive` |
| `csvdata_{fileId}` | `_rowIndex`; dynamic indexes per aggregated column |

---

## Validation Rules AI Should Respect

1. `users.email` must be unique and lowercase
2. `users.passwordHash` must never be returned in any API response
3. `csvfiles.fileSizeBytes` must not exceed 52,428,800 (50 MB)
4. `dashboards.name` must be unique within the same `projectId`
5. `columnmetadata.status` must be `user_confirmed` for ALL columns in a linked CSV before dashboard generation can start
6. `chartwidgets.queryDefinition` must be validated against the AI-returned schema before persisting
7. `sharelinks.tokenHash` must be stored as a SHA-256 hash — never store or return the raw token after creation
8. `auditlogs` records must never have an update or delete endpoint
9. `usersubscriptions` usage counters (`uploadsUsedThisMonth`, `updatesUsedThisMonth`) must be reset at each `currentPeriodEnd` rollover and checked against the referenced `subscriptionplans` limits before uploads/updates
10. `backgroundjobs.status` must always be updated to `failed` with `errorMessage` on job failure — silent failures are not allowed
11. `chartdatacache` entries must be invalidated (deleted or set to `stale`) before a refresh response is returned to the client
12. `csvdata_{fileId}` collections must be dropped entirely when the parent `csvfile` record is deleted

---

## Suggested Mongoose Enums

```ts
UserRole = ["admin", "editor", "viewer"]
OAuthProvider = ["google", "microsoft"]
LanguagePreference = ["en", "ar"]
CsvFileStatus = ["uploading", "analyzing", "confirmed", "error"]
ColumnInferredType = ["string", "number", "date", "boolean", "category"]
ColumnMetadataStatus = ["pending", "ai_suggested", "user_confirmed"]
DashboardStatus = ["generating", "ready", "error"]
// WidgetType: legacy TypeScript enum only — NOT enforced on the chartwidgets schema.
// chartwidgets.widgetType is an open string validated against the widgetdefinitions catalog.
WidgetType = ["bar", "line", "pie", "donut", "kpi_card", "table", "scatter"]
AggregationType = ["sum", "count", "avg", "min", "max"]
SortOrder = ["asc", "desc"]
CacheStatus = ["valid", "stale"]
SharePermission = ["view", "edit"]
ShareLinkStatus = ["active", "revoked", "expired"]
BackgroundJobType = ["csv_analysis", "dashboard_generation", "pdf_export", "cache_recalculation", "subscription_period_rollover"]
BackgroundJobStatus = ["queued", "processing", "completed", "failed"]
BackgroundJobEntityType = ["csvfile", "dashboard"]
NotificationType = ["dashboard_ready", "generation_error", "csv_analysis_complete", "export_ready", "dashboard_shared"]
AuditAction = ["user.register", "user.login", "user.logout", "user.login_failed", "user.update", "user.delete", "user.deactivate", "user.activate", "user.auto_suspend", "project.create", "project.update", "project.delete", "dashboard.create", "dashboard.update", "dashboard.delete", "dashboard.duplicate", "dashboard.refresh", "csvfile.upload", "csvfile.delete", "sharelink.create", "sharelink.revoke", "export.pdf", "export.excel", "export.csv", "subscription.assign", "subscription.upgrade", "subscription.cancel", "subscription.activate", "subscription.deactivate", "settings.update"]
SubscriptionStatus = ["active", "inactive", "expired", "cancelled"]
PaymentStatus = ["paid", "pending", "refunded", "failed"]
AiLogStatus = ["pending", "success", "failed"]
// Subscription plans are NOT a fixed enum — they are documents in the subscriptionplans collection.
```

---

## Implementation Notes For API Builders

- `csvdata_{fileId}` collections are accessed via raw `mongoose.connection.collection(name)` — do not attempt to register a Mongoose model for them
- Always check `columnmetadata.status === 'user_confirmed'` for all columns before queuing a `dashboard_generation` job
- The `chartdatacache` collection is the persistence layer; Redis is the hot cache — both must be invalidated together on refresh
- `usersubscriptions` usage counters must be updated atomically using MongoDB `$inc` to prevent race conditions under concurrent requests
- `ailogs.costUsd` must be computed at write time from the matching `aimodels` pricing row (`{ provider, modelId }`) using token counts; `widgetdefinitions` and `aimodels` are seeded at startup
- Audit log writes must be fire-and-forget from the business layer — never let audit log failure block the primary operation
- `sharelinks.tokenHash` — store only the hash; the raw token is returned to the client exactly once at creation time and is not recoverable
- Background job `maxRetries` defaults: `csv_analysis` = 3, `dashboard_generation` = 3, `pdf_export` = 2

---

## Minimal First Backend Version

For the Phase 1 MVP, the minimum required collections are:

- `users`
- `projects`
- `csvfiles`
- `columnmetadata`
- `dashboards`
- `chartwidgets`
- `dashboarddatasources`
- `chartdatacache`
- `backgroundjobs`
- `notifications`
- `auditlogs`
- `systemsettings`
- `widgetdefinitions` (seeded AI widget catalog)
- `ailogs` and `aimodels` (AI usage logging and pricing)
- `csvdata_{fileId}` (dynamic — created per upload)

Then add in Phase 2:

- `sharelinks` — when sharing feature is implemented
- `subscriptionplans`, `usersubscriptions`, `payments` — when subscription and billing is implemented

