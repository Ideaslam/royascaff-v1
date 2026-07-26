# Change Log Template

Live registry of every change / polish / escalated bug-fix pack. Lives at `project/changes/change-log.md`.

**Not** an append-only archive of finished work — keep rows updated on every pack-status transition. See `engine/project-layout.md` → Change log index contract · `engine/conventions.md` → Main vs pack vs index.

## Schema

```md
# Change Log

_Last updated: {YYYY-MM-DD}_

> Next change number: {NNN}

## Summary

| pack-status | Count |
|-------------|------:|
| drafted | 0 |
| in-progress | 0 |
| verified | 0 |
| merged | 0 |
| cancelled | 0 |
| blocked | 0 |

## In flight (not merged)

| # | Date | Type | Request | Depends on | Pack status | Artifacts done | Scope | Folder |
|---|------|------|---------|------------|-------------|----------------|-------|--------|
| 001 | 2026-07-26 | new-feature | REQ-1 | — | in-progress | 2/5 | billing API | `change-001-billing-api/` |

## Completed

| # | Date | Type | Request | Pack status | Scope | Folder | Merged |
|---|------|------|---------|-------------|-------|--------|--------|
| 001 | 2026-07-20 | new-feature | REQ-1 | merged | billing schema | `change-001-billing-schema/` | 2026-07-21 |

## Cancelled / blocked

| # | Pack status | Reason | Folder |
|---|-------------|--------|--------|
| — | — | — | — |
```

## Maintenance

1. On pack create → add row under **In flight** with `pack-status: drafted`; bump Summary counts; set Next change number.
2. On every status transition → move/update the **same** `#` row; refresh Summary.
3. When `merged` → move row to **Completed**; set Merged date.
4. When `cancelled` or stuck `blocked` with a reason → **Cancelled / blocked** (or keep blocked in In flight with reason in Scope).
5. Artifacts done = `Done/Total` from the pack's `blueprint/_index.md` (via pack `status.md`).
