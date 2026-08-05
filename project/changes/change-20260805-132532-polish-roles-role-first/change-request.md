# Change Request

## Metadata
- **date**: 2026-08-05
- **change-type**: polish
- **target-app**: web
- **affected-repos**: frontend
- **priority**: medium
- **request-id**: —
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Roles & Permissions
- Feature(s): Matrix visual redesign (reference style) — same logic
- Endpoint(s): —
- Page(s)/View(s): `web` · `/roles-permissions`
- Service(s): —

## Description
Restyle the Roles page to match the clean permissions-matrix reference:
- **Rows** = permissions (page/capability), grouped by module category
- **Columns** = roles
- Category bands with bold module title + role column labels
- Permission rows: line icon + label (+ key muted)
- Cells: blue checked square + “Yes” / empty square + muted “No”
- Generous whitespace, light hairline dividers, minimal chrome

Logic unchanged: read-only permission catalog; role CRUD; toggle assignments; Save; page size 15.

## Acceptance Criteria
1. Matrix keeps permissions as rows and roles as columns.
2. Visual style matches reference: category groups, Yes/No cells, icons, clean spacing.
3. Role add/edit/delete and assignment save still work; no permission CRUD.
4. RTL-safe; no API/data changes.
