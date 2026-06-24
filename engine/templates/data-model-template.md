# Data Model File Template

## Short Summary

Use this template when creating `data-model.md`.  
The `data-model.md` file should document the MongoDB and Mongoose data model the AI will build, and every collection entry should use the same structure.

## Purpose

This template is not for Mongoose schema code or repository code.  
It is a documentation template for describing collections, fields, relationships, and persistence rules in one consistent format.

Each collection entry should describe:

- collection name and purpose
- Mongoose document shape
- field definitions
- enums and nested subdocuments
- relations to other collections
- embedding vs referencing decisions
- index recommendations
- validation and business rules

## File-Level Rules

- `data-model.md` should describe the full backend persistence model inferred from product behavior or existing docs.
- Every collection must use the same section order.
- Use MongoDB `ObjectId` for primary keys and references unless the project explicitly uses another strategy.
- Keep catalog data normalized and snapshot transactional values inside project or order documents when history must be preserved.
- Separate reusable catalog entities from project-specific selections.
- Document optional or future collections separately from required first-version collections.
- If a field supports Arabic UI or generated documents, document the Arabic companion field pattern explicitly.
- Do not dump existing backend code; describe the recommended model the API should implement.

## Recommended `data-model.md` Structure

```md
# MongoDB Data Model Reference

## Short Summary

{One paragraph: what system this model supports and where the design comes from.}

## Scope

{List the backend domains implied by the product.}

## Modeling Principles

- {Principle 1}
- {Principle 2}
- {Principle 3}

## Collection Overview

Required collections:

- `{collectionName}`
- `{collectionName}`

Optional future collections:

- `{collectionName}`
- `{collectionName}`

## 1. {collectionName}

{collection entry}

## 2. {collectionName}

{collection entry}

## Relationship Summary

- `{collectionA}` 1 -> many `{collectionB}`
- `{collectionA}` many -> 1 `{collectionB}`

## Embedded vs Referenced Decision

Recommended references:

- `{path} -> {collection}`

Recommended embedded subdocuments:

- `{parentCollection}.{subdocumentPath}`

Reason:

- {Why these choices were made}

## Index Recommendations

### {collectionName}

- {index rule}

## Validation Rules AI Should Respect

- {Rule 1}
- {Rule 2}

## Suggested Mongoose Enums

{enum block}

## Implementation Notes For API Builders

- {Note 1}
- {Note 2}

## Minimal First Backend Version

If the API should start small, the minimum practical collections are:

- `{collectionName}`
- `{collectionName}`

Then add:

- `{collectionName}`

when {feature or capability} is implemented.
```

## Mongoose Shape Block Template

Use this TypeScript block inside each collection entry.

```ts
{
  _id: ObjectId,
  {fieldName}: {Type},
  {fieldName}: {Type} | null,
  {nestedObject}: {
    {fieldName}: {Type}
  },
  {arrayField}: [
    {
      {fieldName}: {Type}
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## Enums Block Template

Use this TypeScript block in the file-level enums section.

```ts
{EnumName} = ["{value1}", "{value2}"]
{EnumName} = ["{value1}", "{value2}"]
```

## Single Collection Entry Template

```md
## {Number}. {collectionName}

{Clear explanation of what this collection stores and why it exists.}

Examples from the current product:

- {Example 1}
- {Example 2}

### Mongoose shape

{mongoose shape block}

### Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | `ObjectId` | yes | Primary key |
| `{fieldName}` | `{Type}` | {yes/no} | {description} |
| `{fieldName}` | `{Type}` | {yes/no} | {description} |

### `{enumOrNestedSection}`

{Use this subsection for enums, pricing behavior, subdocument rules, or other collection-specific logic.}

Recommended enum values:

- `{value}`
- `{value}`

Behavior:

- `{rule or calculation mode}`

### Why `{subdocument}` should be embedded

{Explain when a subdocument should be embedded instead of referenced.}

This preserves:

- {Snapshot reason 1}
- {Snapshot reason 2}

### Relations

- One `{collectionName}` {relation verb} many `{otherCollection}`.
- Many `{collectionName}` belong to one `{otherCollection}`.

### Index Recommendations

- {index rule}
- {index rule}
```

## Compact Collection Entry Template

Use this if you want a shorter style but still consistent.

```md
## {Number}. {collectionName}

- Purpose: `{what it stores}`
- Shape:
  - `{field}: {type} - {notes}`
  - `{field}: {type} - {notes}`
- Relations:
  - `{relation}`
- Indexes:
  - `{index}`
- Notes:
  - `{rule or enum}`
```

## Cross-Cutting Sections Template

Use these sections once per `data-model.md`, after all collection entries.

### Arabic Naming Rule

```md
## Arabic Naming Rule

For backend consistency, any human-facing `name` or `title` field should support an Arabic companion field when the value may be displayed in Arabic UI or appear in generated documents.

Recommended pattern:

- `name` + `nameAr`
- `title` + `titleAr`
- `{field}` + `{fieldAr}`

Guideline:

- keep the existing primary field for the default display value
- add the `Ar` field for explicit Arabic storage
- if the entity is already multilingual by design, keep `nameAr` and `nameEn`
- for catalog entities, document which language fields are required
```

### Optional Collection Template

```md
## Optional {Number}. {collectionName}

This collection is not required for the current prototype, but it is recommended if {condition}.

### Why add it

- {Reason 1}
- {Reason 2}

### Mongoose shape

{mongoose shape block}

### Relation strategy

If introduced, `{parentCollection}.{fieldName}` can reference `{collectionName}`, while still snapshotting `{fields}` inside the parent for historical integrity.
```

## Example

Collection entry:

```md
## 1. users

Stores system users for internal staff and optional client accounts.

### Mongoose shape

{see mongoose shape example below}

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

### Index Recommendations

- unique index on `email`
- index on `role`
- index on `isActive`
```

Mongoose shape example for the entry above:

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

## Suggested Field Meanings

- `collectionName`
  MongoDB collection name in lowercase plural form unless the project uses another convention
- `Mongoose shape`
  high-level document structure for AI and developers before schema code is written
- `Fields`
  authoritative field list with type, required flag, and notes
- `Relations`
  how this collection connects to others
- `Why ... should be embedded`
  explains snapshot/history rules for subdocuments
- `Index Recommendations`
  expected query paths and uniqueness constraints
- `Validation Rules AI Should Respect`
  cross-collection rules the API must enforce
- `Suggested Mongoose Enums`
  shared enum values referenced by multiple collections
- `Minimal First Backend Version`
  phased rollout guidance when not every collection is needed on day one

## Final Guidance

When AI creates `data-model.md`, it should copy this collection entry format for every collection so the whole file stays consistent and easy to scan before any Mongoose schemas or repositories are generated.

The filled project-specific data model should live in `project/plan/data-model.md`, not in this template file.
