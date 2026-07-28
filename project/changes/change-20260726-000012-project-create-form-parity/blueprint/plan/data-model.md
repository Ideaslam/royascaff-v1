# Data Model — projects.info (pack delta)

## Delta
Document after-state of `projects.info` fields used by Create Project → DNA. No new Mongo collection. Persistence remains schema-less Mixed on `projects`.

## projects.info (after-state fields for create)

| Field | Type | Constraints | DNA mapping |
|-------|------|-------------|-------------|
| `digitalPresence` | Object | optional | → `dna.digitalPresence` |
| `digitalPresence.website` | String | URL-ish optional | |
| `digitalPresence.instagram` | String | username/URL optional | |
| `digitalPresence.twitter` | String | X / Twitter optional | |
| `digitalPresence.linkedin` | String | optional | |
| `digitalPresence.tiktok` | String | optional | |
| `digitalPresence.snapchat` | String | optional | |
| `competitors` | Array≤3 | items `{ url: string, name?: string }` | → `dna.competitors` (require `url`) |
| `summary` | String | **required on create** (project description) | → `dna.project.summaryUser` |
| `kpis` | String \| String[] | optional free-text KPIs from form | → seed `dna.project.kpis` or notes for analyze |
| `budget` | String \| Object | select value e.g. `100k-250k` or `{ label, value }` | → `dna.project.budget` |
| `duration` | String \| Object | select value e.g. `1-3` | → `dna.project.duration` |
| `researchOptions` | String[] | subset of launch keys | → `dna.research.selectedOptions` (unchanged) |

## projects.services (line items)

| Field | Type | Notes |
|-------|------|-------|
| `id` | String | optional catalog service id when selected from API |
| `name` | String | required; user may override catalog name |
| `price` / `unitPrice` | Number | user may override |
| `qty` / `quantity` | Number | default 1; override allowed |
| other catalog fields | Mixed | optional passthrough (description, category) |

Financial totals recomputed server-side via existing `computeFinancial`.
