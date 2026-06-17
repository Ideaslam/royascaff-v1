# MongoDB Data Model Reference

## Short Summary

This document defines a recommended MongoDB and Mongoose data model for the ZOYA pre-sales system based on the current frontend business logic in `docs/references/source-ref.html`. The current product is frontend-only, so this schema is an inferred backend design intended to help AI or developers build the API consistently.

## Scope

The current application behavior implies these backend domains:

- users and roles
- projects
- service categories
- services
- project service selections
- proposal documents
- uploaded project assets
- global settings

This document is not a dump of existing backend code. It is a recommended NoSQL model that preserves the current product behavior while making the system suitable for an API and persistence layer.

## Modeling Principles

- Use MongoDB `ObjectId` for primary keys and references.
- Keep service catalog data normalized.
- Snapshot commercial values inside project selections and proposals so later catalog changes do not corrupt historical quotations.
- Separate reusable catalog entities from project-specific selections.
- Keep generated proposal HTML and uploaded assets as project-related documents.

## Collection Overview

Recommended collections:

- `users`
- `servicecategories`
- `services`
- `projects`
- `projectdocuments`
- `projectfiles`
- `settings`

Optional future collections:

- `clients`
- `auditlogs`
- `proposaltemplates`
- `apikeystore` or external secrets storage

## 1. users

Stores system users for internal staff and optional client accounts.

### Mongoose shape

```ts
{
  _id: ObjectId,
  name: String,
  nameAr: String | null,
  email: String,
  passwordHash: String,
  role: String,
  isActive: Boolean,
  phone: String | null,
  avatarUrl: String | null,
  lastLoginAt: Date | null,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `name` | `String` | yes | Primary display name |
| `nameAr` | `String` | no | Arabic display name when different or explicitly stored |
| `email` | `String` | yes | Unique, indexed, lowercase |
| `passwordHash` | `String` | yes | Never store plain password |
| `role` | `String` | yes | Enum: `admin`, `sales_manager`, `sales_rep`, `client` |
| `isActive` | `Boolean` | yes | Default `true` |
| `phone` | `String` | no | Optional contact field |
| `avatarUrl` | `String` | no | Optional |
| `lastLoginAt` | `Date` | no | Audit/login tracking |
| `createdAt` | `Date` | yes | Mongoose timestamps |
| `updatedAt` | `Date` | yes | Mongoose timestamps |

### Relations

- One `user` can create many `projects`.
- One `user` can own many generated `projectdocuments`.

## 2. servicecategories

Represents top-level service grouping shown in the catalog UI.

Examples from the current reference:

- booth
- tech
- interactive
- catering
- security
- staff
- production
- logistics
- vip
- activities
- booth_items
- branding

### Mongoose shape

```ts
{
  _id: ObjectId,
  key: String,
  nameAr: String,
  nameEn: String | null,
  icon: String | null,
  sortOrder: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `key` | `String` | yes | Unique stable code like `booth` |
| `nameAr` | `String` | yes | Arabic label |
| `nameEn` | `String` | no | English label |
| `icon` | `String` | no | Emoji or icon token |
| `sortOrder` | `Number` | yes | UI ordering |
| `isActive` | `Boolean` | yes | Default `true` |
| `createdAt` | `Date` | yes | Timestamps |
| `updatedAt` | `Date` | yes | Timestamps |

### Relations

- One `servicecategory` has many `services`.

## 3. services

Represents reusable catalog items and pricing rules.

This is one of the most important collections because the current app is driven by a categorized service catalog with price-per-unit logic.

### Mongoose shape

```ts
{
  _id: ObjectId,
  categoryId: ObjectId,
  code: String,
  nameAr: String,
  nameEn: String | null,
  description: String | null,
  unitType: String,
  unitPrice: Number,
  currency: String,
  pricingRule: {
    formulaType: String,
    formulaValue: Number | null
  },
  isActive: Boolean,
  isFeatured: Boolean,
  metadata: Mixed,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `categoryId` | `ObjectId` | yes | Ref `servicecategories` |
| `code` | `String` | yes | Unique service code like `bd1`, `lg2` |
| `nameAr` | `String` | yes | Arabic service name |
| `nameEn` | `String` | no | English short name |
| `description` | `String` | no | Optional backend/API description |
| `unitType` | `String` | yes | Enum, see below |
| `unitPrice` | `Number` | yes | Stored in SAR unless otherwise configured |
| `currency` | `String` | yes | Default `SAR` |
| `pricingRule.formulaType` | `String` | yes | For special logic like `% of subtotal` |
| `pricingRule.formulaValue` | `Number` | no | Used when applicable |
| `isActive` | `Boolean` | yes | Default `true` |
| `isFeatured` | `Boolean` | yes | Optional UI convenience |
| `metadata` | `Mixed` | no | Extensible service-specific config |
| `createdAt` | `Date` | yes | Timestamps |
| `updatedAt` | `Date` | yes | Timestamps |

### `unitType` enum

Recommended enum values:

- `fixed`
- `sqm`
- `lm`
- `piece`
- `guest`
- `day`
- `person_day`
- `month`
- `pct_subtotal`

### Pricing behavior

The current reference implies these calculation modes:

- `fixed`: use `unitPrice * quantity`
- `piece`: use `unitPrice * quantity`
- `guest`: use `unitPrice * project.guests * quantity`
- `sqm`: use `unitPrice * project.booth.areaSqm * quantity`
- `lm`: use `unitPrice * linearMeters * quantity` if linear meters are modeled later
- `day`: use `unitPrice * project.days * quantity`
- `person_day`: use `unitPrice * project.days * quantity`
- `month`: use `unitPrice * quantity`
- `pct_subtotal`: use percentage over subtotal, mainly for special logistics/service rules

### Relations

- Many `services` belong to one `servicecategory`.
- One `service` can appear in many `projects.selectedServices`.

## 4. projects

This is the central business collection. It represents one pre-sales opportunity or proposal project.

### Mongoose shape

```ts
{
  _id: ObjectId,
  projectNumber: String,
  status: String,
  client: {
    contactName: String,
    contactNameAr: String | null,
    companyName: String,
    companyNameAr: String | null,
    website: String | null
  },
  event: {
    name: String,
    nameAr: String | null,
    type: String,
    date: Date | null,
    location: String | null,
    days: Number,
    guests: Number
  },
  booth: {
    sizeMode: String,
    presetSize: String | null,
    customWidth: Number | null,
    customHeight: Number | null,
    areaSqm: Number
  },
  brandTheme: {
    primary: String,
    secondary: String,
    accent: String,
    background: String,
    card: String,
    text: String
  },
  selectedServices: [
    {
      serviceId: ObjectId,
      serviceCode: String,
      categoryId: ObjectId,
      nameAr: String,
      nameEn: String | null,
      unitType: String,
      quantity: Number,
      unitPrice: Number,
      calculatedQuantity: Number | null,
      lineSubtotal: Number,
      notes: String | null
    }
  ],
  customSections: [
    {
      _id: ObjectId,
      title: String,
      titleAr: String | null,
      content: String,
      imageFileId: ObjectId | null
    }
  ],
  pricingSnapshot: {
    vatPercent: Number,
    installationPercent: Number,
    subtotal: Number,
    installationAmount: Number,
    vatAmount: Number,
    grandTotal: Number,
    currency: String
  },
  aiInput: {
    clientWebsite: String | null,
    rfpText: String | null,
    customPrompt: String | null,
    preferredModel: String | null,
    depth: String | null
  },
  generatedOutput: {
    technicalProposalHtml: String | null,
    financialProposalHtml: String | null,
    lastGeneratedAt: Date | null,
    generatedBy: ObjectId | null
  },
  assignedTo: ObjectId | null,
  createdBy: ObjectId,
  updatedBy: ObjectId | null,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `projectNumber` | `String` | yes | Human-readable ID, unique |
| `status` | `String` | yes | Enum: `draft`, `pending`, `accepted`, `rejected`, `archived` |
| `client.contactName` | `String` | yes | Primary contact display name |
| `client.contactNameAr` | `String` | no | Arabic contact name |
| `client.companyName` | `String` | yes | Primary company display name |
| `client.companyNameAr` | `String` | no | Arabic company name |
| `client.website` | `String` | no | Current frontend `clientWebsite` |
| `event.name` | `String` | yes | Primary event name |
| `event.nameAr` | `String` | no | Arabic event name |
| `event.type` | `String` | no | Example: `معرض`, `مؤتمر`, `إطلاق` |
| `event.date` | `Date` | no | Event/proposal date |
| `event.location` | `String` | no | Current field `eLoc` |
| `event.days` | `Number` | yes | Minimum 1 |
| `event.guests` | `Number` | yes | Minimum 1 |
| `booth.sizeMode` | `String` | yes | Enum: `preset`, `custom` |
| `booth.presetSize` | `String` | no | Example: `4x6` |
| `booth.customWidth` | `Number` | no | In meters |
| `booth.customHeight` | `Number` | no | In meters |
| `booth.areaSqm` | `Number` | yes | Precomputed for faster pricing/querying |
| `brandTheme.primary` | `String` | yes | Hex color |
| `brandTheme.secondary` | `String` | yes | Hex color |
| `brandTheme.accent` | `String` | yes | Hex color |
| `brandTheme.background` | `String` | yes | Hex color |
| `brandTheme.card` | `String` | yes | Hex color |
| `brandTheme.text` | `String` | yes | Hex color |
| `selectedServices` | `[Subdocument]` | yes | Snapshot of selected catalog items including Arabic name fields |
| `customSections` | `[Subdocument]` | no | Extra technical proposal sections including Arabic title fields |
| `pricingSnapshot.*` | nested | yes | Saved commercial result |
| `aiInput.clientWebsite` | `String` | no | For AI analysis |
| `aiInput.rfpText` | `String` | no | Parsed text from uploaded RFP |
| `aiInput.customPrompt` | `String` | no | Additional instructions |
| `aiInput.preferredModel` | `String` | no | Optional |
| `aiInput.depth` | `String` | no | Enum: `short`, `medium`, `detailed` |
| `generatedOutput.technicalProposalHtml` | `String` | no | Raw generated HTML |
| `generatedOutput.financialProposalHtml` | `String` | no | Optional future generated HTML |
| `generatedOutput.lastGeneratedAt` | `Date` | no | Tracking |
| `generatedOutput.generatedBy` | `ObjectId` | no | Ref `users` |
| `assignedTo` | `ObjectId` | no | Ref `users` |
| `createdBy` | `ObjectId` | yes | Ref `users` |
| `updatedBy` | `ObjectId` | no | Ref `users` |
| `createdAt` | `Date` | yes | Timestamps |
| `updatedAt` | `Date` | yes | Timestamps |

### Why `selectedServices` should be embedded

This is important. Project service selections should not be only references to `services`, because prices and names can change later. Each selected service should snapshot:

- service id
- service code
- category id
- names
- unit type
- quantity
- unit price at the time of quotation
- calculated quantity
- line subtotal

This preserves historical proposal accuracy.

### Relations

- One `project` belongs to one creator `user`.
- One `project` can optionally be assigned to one staff `user`.
- One `project` contains many selected service snapshots.
- One `project` can have many `projectdocuments`.
- One `project` can have many `projectfiles`.

## 5. projectdocuments

Stores generated or manually edited project deliverables as distinct versioned documents.

This should exist even if proposal HTML is also cached inside `projects.generatedOutput`, because documents often need version history.

### Mongoose shape

```ts
{
  _id: ObjectId,
  projectId: ObjectId,
  type: String,
  title: String,
  titleAr: String | null,
  status: String,
  version: Number,
  htmlContent: String | null,
  textContent: String | null,
  pdfFileId: ObjectId | null,
  metadata: {
    model: String | null,
    generatedFromRfp: Boolean,
    generatedFromWebsite: Boolean
  },
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `projectId` | `ObjectId` | yes | Ref `projects` |
| `type` | `String` | yes | Enum: `technical_proposal`, `financial_proposal`, `rfp_summary`, `draft_html` |
| `title` | `String` | yes | Primary human-readable label |
| `titleAr` | `String` | no | Arabic title/label |
| `status` | `String` | yes | Enum: `draft`, `generated`, `edited`, `approved`, `archived` |
| `version` | `Number` | yes | Starts at 1 |
| `htmlContent` | `String` | no | Main HTML body |
| `textContent` | `String` | no | Extracted plain text or summary |
| `pdfFileId` | `ObjectId` | no | Ref `projectfiles` |
| `metadata.model` | `String` | no | AI model used |
| `metadata.generatedFromRfp` | `Boolean` | yes | Default `false` |
| `metadata.generatedFromWebsite` | `Boolean` | yes | Default `false` |
| `createdBy` | `ObjectId` | yes | Ref `users` |
| `createdAt` | `Date` | yes | Timestamps |
| `updatedAt` | `Date` | yes | Timestamps |

### Relations

- Many `projectdocuments` belong to one `project`.
- One `projectdocument` can optionally point to one `projectfile` for exported PDF.

## 6. projectfiles

Stores metadata for uploaded or generated files. Actual binary storage can be GridFS, S3, local disk, or another file service.

Examples:

- uploaded RFP PDF/TXT
- custom section images
- generated PDFs
- exported HTML snapshots

### Mongoose shape

```ts
{
  _id: ObjectId,
  projectId: ObjectId,
  documentId: ObjectId | null,
  kind: String,
  originalName: String,
  originalNameAr: String | null,
  mimeType: String,
  sizeBytes: Number,
  storageKey: String,
  publicUrl: String | null,
  uploadedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `projectId` | `ObjectId` | yes | Ref `projects` |
| `documentId` | `ObjectId` | no | Ref `projectdocuments` |
| `kind` | `String` | yes | Enum: `rfp`, `section_image`, `proposal_pdf`, `proposal_html`, `attachment` |
| `originalName` | `String` | yes | Original file name |
| `originalNameAr` | `String` | no | Arabic file title/name if the UI stores a localized label |
| `mimeType` | `String` | yes | File MIME type |
| `sizeBytes` | `Number` | yes | File size |
| `storageKey` | `String` | yes | Bucket/path/GridFS key |
| `publicUrl` | `String` | no | If served via CDN/object storage |
| `uploadedBy` | `ObjectId` | yes | Ref `users` |
| `createdAt` | `Date` | yes | Timestamps |
| `updatedAt` | `Date` | yes | Timestamps |

### Relations

- Many `projectfiles` belong to one `project`.
- Many `projectfiles` can belong to one `projectdocument`.

## 7. settings

Stores global commercial and system configuration.

The current frontend has a single config object with VAT, installation percentage, API key, and users. In a real backend, user accounts should be separate and secrets should not be kept in plain text in this collection unless encrypted and strictly controlled.

### Mongoose shape

```ts
{
  _id: ObjectId,
  key: String,
  value: Mixed,
  scope: String,
  description: String | null,
  updatedBy: ObjectId | null,
  createdAt: Date,
  updatedAt: Date
}
```

### Suggested settings documents

```ts
{ key: "pricing.defaultVatPercent", value: 15, scope: "global" }
{ key: "pricing.defaultInstallationPercent", value: 15, scope: "global" }
{ key: "system.defaultCurrency", value: "SAR", scope: "global" }
{ key: "proposal.defaultPaymentPlan", value: [50, 30, 20], scope: "global" }
```

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `key` | `String` | yes | Unique configuration key |
| `value` | `Mixed` | yes | Number, string, object, array |
| `scope` | `String` | yes | Usually `global` |
| `description` | `String` | no | Human-readable explanation |
| `updatedBy` | `ObjectId` | no | Ref `users` |
| `createdAt` | `Date` | yes | Timestamps |
| `updatedAt` | `Date` | yes | Timestamps |

## Optional 8. clients

This collection is not required for the current prototype, but it is recommended if multiple projects will belong to the same company over time.

### Why add it

The current frontend stores client data directly inside the project. That is enough for a prototype. For an API, a separate `clients` collection is useful when:

- the same company creates many projects
- contacts must be reused
- account history matters
- sales reporting is needed

### Mongoose shape

```ts
{
  _id: ObjectId,
  companyName: String,
  companyNameAr: String | null,
  website: String | null,
  industry: String | null,
  contacts: [
    {
      _id: ObjectId,
      name: String,
      nameAr: String | null,
      email: String | null,
      phone: String | null,
      title: String | null,
      titleAr: String | null,
      isPrimary: Boolean
    }
  ],
  notes: String | null,
  createdAt: Date,
  updatedAt: Date
}
```

### Relation strategy

If introduced, `projects.clientId` can reference `clients`, while still snapshotting `client.contactName`, `client.companyName`, and `client.website` inside the project for historical integrity.

## Arabic Naming Rule

For backend consistency, any human-facing `name` or `title` field should support an Arabic companion field when the value may be displayed in Arabic UI or appear in generated proposals.

Recommended pattern:

- `name` + `nameAr`
- `title` + `titleAr`
- `companyName` + `companyNameAr`
- `contactName` + `contactNameAr`
- `originalName` + `originalNameAr`

Guideline:

- keep the existing primary field for the default display value
- add the `Ar` field for explicit Arabic storage
- if the entity is already multilingual by design, keep `nameAr` and `nameEn`
- for catalog entities, `nameAr` should remain required because Arabic is a first-class business language in this system

## Relationship Summary

High-level relations:

- `users` 1 -> many `projects`
- `users` 1 -> many `projectdocuments`
- `servicecategories` 1 -> many `services`
- `projects` 1 -> many `projectdocuments`
- `projects` 1 -> many `projectfiles`
- `projects.selectedServices[*].serviceId` many -> 1 `services`
- `projectdocuments` many -> 1 `projects`
- `projectfiles` many -> 1 `projects`
- `projectfiles` many -> 0..1 `projectdocuments`

## Embedded vs Referenced Decision

Recommended references:

- `projects.createdBy -> users`
- `projects.assignedTo -> users`
- `services.categoryId -> servicecategories`
- `projectdocuments.projectId -> projects`
- `projectfiles.projectId -> projects`

Recommended embedded subdocuments:

- `projects.selectedServices`
- `projects.customSections`
- `projects.brandTheme`
- `projects.pricingSnapshot`
- `projects.aiInput`

Reason:

- selected services are transactional snapshots
- custom sections belong only to one project
- theme and pricing snapshot are tightly coupled to the proposal state

## Index Recommendations

### users

- unique index on `email`
- index on `role`
- index on `isActive`

### servicecategories

- unique index on `key`
- index on `sortOrder`

### services

- unique index on `code`
- index on `categoryId`
- compound index on `{ categoryId: 1, isActive: 1 }`
- text index on `nameAr`, `nameEn`, `description` if search is needed

### projects

- unique index on `projectNumber`
- index on `status`
- index on `createdBy`
- index on `assignedTo`
- index on `client.companyName`
- index on `client.companyNameAr`
- index on `event.date`
- text index on `client.companyName`, `client.companyNameAr`, `event.name`, `event.nameAr`, `client.contactName`, `client.contactNameAr`

### projectdocuments

- compound index on `{ projectId: 1, type: 1, version: -1 }`

### projectfiles

- compound index on `{ projectId: 1, kind: 1 }`

## Validation Rules AI Should Respect

- Email must be unique in `users`.
- Service `code` and category `key` must be stable and unique.
- `unitPrice` must be non-negative.
- `quantity` in selected services must be at least 1.
- `event.days` and `event.guests` must be at least 1.
- Color fields in `brandTheme` should be valid hex color strings.
- `pricingSnapshot` values should be recomputed server-side before saving final quotations.
- Raw AI-generated HTML should be sanitized or stored carefully before rendering in any user-facing surface.

## Suggested Mongoose Enums

```ts
ProjectStatus = ["draft", "pending", "accepted", "rejected", "archived"]
UserRole = ["admin", "sales_manager", "sales_rep", "client"]
UnitType = ["fixed", "sqm", "lm", "piece", "guest", "day", "person_day", "month", "pct_subtotal"]
DocumentType = ["technical_proposal", "financial_proposal", "rfp_summary", "draft_html"]
DocumentStatus = ["draft", "generated", "edited", "approved", "archived"]
FileKind = ["rfp", "section_image", "proposal_pdf", "proposal_html", "attachment"]
AiDepth = ["short", "medium", "detailed"]
BoothSizeMode = ["preset", "custom"]
```

## Implementation Notes For API Builders

- Do not expose raw pricing calculations from the client as a source of truth. Recompute on the API.
- Do not store API keys on the frontend. Use secure server-side secrets management.
- Treat `projects.selectedServices` as immutable quotation snapshots once a proposal is issued, or version them explicitly.
- Store generated documents as separate versioned records if proposal revisions matter.
- If the visual editor is retained, save edited output into `projectdocuments` rather than only overwriting the project record.

## Minimal First Backend Version

If the API should start small, the minimum practical collections are:

- `users`
- `servicecategories`
- `services`
- `projects`
- `settings`

Then add:

- `projectdocuments`
- `projectfiles`

when AI generation, uploaded RFPs, custom section images, and document history are implemented.
