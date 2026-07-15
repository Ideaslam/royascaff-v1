# Change Request — 071: Data Source & Table Detail UI Redesign

| Field | Value |
|-------|-------|
| Change # | 071 |
| Type | modify-page |
| Target app | customer-portal |
| Affected repos | roya-ai-dynamo-frontend |
| Priority | medium |

## Summary

Redesign the Data Source detail page and Data Table (dataset) detail page UI — especially button hierarchy and layout — using the existing shared `action-btn` system. **Styles and arrangement only; no logic changes.**

## Motivation

Header and row actions currently use equal-weight outlined buttons, which makes primary actions hard to spot and row actions feel cramped.

## Scope

- `source-detail` page: header actions, table row actions, table/card polish
- `dataset-detail` page: header actions, schema actions, stats/sections polish
- `sync-settings-panel`: Save button style
- Optional shared row-action classes in `styles.css`

## Out of scope

- Backend / API / data model
- Click handlers, sync/discovery/delete behavior
- New features or menus that change behavior
