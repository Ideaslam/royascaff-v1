# Change Request

## Metadata
- **date**: 2026-07-15
- **change-type**: modify-page
- **target-app**: customer-portal
- **affected-repos**: backend+frontend
- **priority**: medium

## Scope
- Module(s): Projects (Create Dashboard picker), Data (lite list)
- Feature(s): Create Dashboard — source-first dataset picker
- Endpoint(s): EP-DATA-56 `GET /data/datasets/lite` — add `dataSourceId` query + `sources[]` response
- Page(s): customer-portal: project-detail

## Description
Flat/type-grouped table lists overwhelm users (e.g. 42 Google Ads tables). Redesign to **source-first**: Level 1 picks a data source; Level 2 shows only that source’s tables. Selection accumulates across sources via sticky summary.

## Acceptance Criteria
1. Level 1 shows data sources with synced table counts (not all tables)
2. Type chips / search filter sources on Level 1
3. Opening a source shows only that source’s tables
4. Select all / Deselect all on Level 2; checkboxes; sticky N tables · M sources
5. Selection retained when navigating back to sources / another source
6. Lite API supports `dataSourceId` and returns `sources[]`
7. EN/AR + RTL; create payload unchanged

## Notes
Follow-up to change-068.
